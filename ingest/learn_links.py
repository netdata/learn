"""Check absolute learn.netdata.cloud links in the ingested docs.

Docs link to each other with repository-relative paths, which the ingest converts and checks.
Absolute https://learn.netdata.cloud links skip that conversion, so a typo or a renamed page
stays broken until Learn's rendered link check reports it on unrelated Learn pull requests.
Checking them against the final ingest output (pages, redirects, static files) lets the
documentation check of the repository that introduced the link fail instead.
"""

import os
import re
import tomllib
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml

_LINK_TARGET = re.compile(r"\]\(\s*<?(https?://learn\.netdata\.cloud(?:[/?#][^)\s>]*)?)")
_HREF_TARGET = re.compile(
    r"""\bhref\s*=\s*["'](https?://learn\.netdata\.cloud(?:[/?#][^"']*)?)["']"""
)
_INLINE_CODE = re.compile(r"(`+)(?:(?!\1).)+?\1")
_HEADING = re.compile(r"^(#{1,6})[ \t]+(.*?)[ \t]*$")
_CLOSING_HASHES = re.compile(r"[ \t]+#+$")
_EXPLICIT_ID = re.compile(r"[ \t]*\{#([^}\s]+)\}$")
_ID_ATTRIBUTE = re.compile(r"""\b(?:id|name)\s*=\s*["']([^"']+)["']""")
_EDIT_URL_REPOSITORY = re.compile(r"^https://github\.com/netdata/([^/]+)/")

# Routes Docusaurus serves that do not come from a docs page or a static file.
_SITE_ROUTES = frozenset({"/", "/search"})


@dataclass(frozen=True)
class BrokenLearnLink:
    repository: str
    source: str
    url: str
    reason: str


def normalize_route(path):
    path = unquote(path or "/")
    if not path.startswith("/"):
        path = "/" + path
    return path.rstrip("/") or "/"


def split_front_matter(text):
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---", 4)
    if end < 0:
        return {}, text
    try:
        front_matter = yaml.safe_load(text[4:end]) or {}
    except yaml.YAMLError:
        front_matter = {}
    body_start = text.find("\n", end + 4)
    body = text[body_start + 1 :] if body_start >= 0 else ""
    return (front_matter if isinstance(front_matter, dict) else {}), body


def prose_lines(body):
    """Yield the lines of a markdown body with code blocks and inline code blanked out."""
    fence = None
    for line in body.split("\n"):
        stripped = line.strip()
        if fence is None:
            opening = re.match(r"(`{3,}|~{3,})", stripped)
            if opening:
                fence = opening.group(1)
                yield ""
                continue
            yield _INLINE_CODE.sub(" ", line)
        else:
            if (
                stripped
                and set(stripped) == {fence[0]}
                and len(stripped) >= len(fence)
            ):
                fence = None
            yield ""


def learn_links(body):
    links = []
    for line in prose_lines(body):
        links.extend(_LINK_TARGET.findall(line))
        links.extend(_HREF_TARGET.findall(line))
    return links


def _heading_text(raw):
    text = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", raw)
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("\\", "")
    text = re.sub(r"[`*]", "", text)
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"\1", text)
    return text.strip()


def github_slug(text):
    """Slug a heading the way github-slugger, used by Docusaurus, does."""
    slug = []
    for character in text.lower():
        if character.isalnum() or character in "-_":
            slug.append(character)
        elif character == " ":
            slug.append("-")
    return "".join(slug)


def page_anchors(body):
    """Return the fragment identifiers a rendered page exposes."""
    anchors = set()
    occurrences = {}
    for line in prose_lines(body):
        heading = _HEADING.match(line)
        if heading:
            text = _CLOSING_HASHES.sub("", heading.group(2))
            explicit = _EXPLICIT_ID.search(text)
            if explicit:
                anchors.add(explicit.group(1))
            else:
                slug = github_slug(_heading_text(text))
                original = slug
                while slug in occurrences:
                    occurrences[original] += 1
                    slug = f"{original}-{occurrences[original]}"
                occurrences[slug] = 0
                anchors.add(slug)
                # Older ingested links collapse repeated hyphens; accept that spelling too.
                anchors.add(re.sub(r"-+", "-", slug).strip("-"))
        anchors.update(_ID_ATTRIBUTE.findall(line))
    anchors.discard("")
    return anchors


def _read(path, read_text):
    if read_text is not None:
        return read_text(path)
    return Path(path).read_text(encoding="utf-8")


def _page_route(front_matter):
    learn_link = front_matter.get("learn_link")
    if isinstance(learn_link, str) and learn_link:
        return normalize_route(urlsplit(learn_link).path)
    slug = front_matter.get("slug")
    if isinstance(slug, str) and slug.startswith("/"):
        return normalize_route("/docs" + slug)
    return None


def _repository(custom_edit_url):
    match = _EDIT_URL_REPOSITORY.match(custom_edit_url or "")
    return match.group(1) if match else "learn"


def collect_pages(docs_root, read_text=None):
    """Map each docs route to its file and front matter."""
    pages = {}
    for path in sorted(Path(docs_root).rglob("*.md*")):
        if path.suffix not in {".md", ".mdx"} or not path.is_file():
            continue
        front_matter, _ = split_front_matter(_read(path, read_text))
        route = _page_route(front_matter)
        if route is not None:
            pages[route] = (path, front_matter)
    return pages


def snapshot_pages(docs_root, keep, read_text=None):
    """Record the routes and anchors of pages that a run will delete but still links to."""
    snapshot = {}
    for route, (path, front_matter) in collect_pages(docs_root, read_text).items():
        if keep(front_matter):
            _, body = split_front_matter(_read(path, read_text))
            snapshot[route] = frozenset(page_anchors(body))
    return snapshot


def _redirect_matchers(netlify_path):
    with open(netlify_path, "rb") as stream:
        configuration = tomllib.load(stream)
    exact = set()
    patterns = []
    for rule in configuration.get("redirects", []):
        source = rule.get("from")
        if not isinstance(source, str) or not source.startswith("/"):
            continue
        if source.endswith("/*") or "/:" in source:
            expression = re.escape(normalize_route(source.removesuffix("/*")))
            expression = re.sub(r"/\\?:[^/]+", "/[^/]+", expression)
            suffix = "(?:/.*)?" if source.endswith("/*") else ""
            patterns.append(re.compile(f"^{expression}{suffix}$"))
        else:
            exact.add(normalize_route(source))
    return exact, patterns


def _static_routes(static_root):
    routes = set()
    if static_root is None or not os.path.isdir(static_root):
        return routes
    for path in Path(static_root).rglob("*"):
        if not path.is_file():
            continue
        route = normalize_route("/" + path.relative_to(static_root).as_posix())
        routes.add(route)
        if route.endswith("/index.html"):
            routes.add(normalize_route(route.removesuffix("/index.html")))
        elif route.endswith(".html"):
            routes.add(route.removesuffix(".html"))
    return routes


def find_broken_learn_links(
    docs_root, netlify_path, static_root, preserved_pages=None, read_text=None
):
    """Return absolute Learn links in published pages that resolve to no route or anchor."""
    pages = collect_pages(docs_root, read_text)
    preserved = dict(preserved_pages or {})
    redirects, redirect_patterns = _redirect_matchers(netlify_path)
    static_routes = _static_routes(static_root)
    anchors_cache = {}

    def anchors_for(route):
        if route not in anchors_cache:
            path, _ = pages[route]
            _, body = split_front_matter(_read(path, read_text))
            anchors_cache[route] = page_anchors(body)
        return anchors_cache[route]

    broken = set()
    for route, (path, front_matter) in pages.items():
        source = front_matter.get("custom_edit_url") or path.as_posix()
        repository = _repository(front_matter.get("custom_edit_url"))
        _, body = split_front_matter(_read(path, read_text))
        for url in learn_links(body):
            parts = urlsplit(url)
            target = normalize_route(parts.path)
            fragment = unquote(parts.fragment)
            if target in pages or target in preserved:
                if not fragment or fragment.startswith(":~:"):
                    continue
                anchors = anchors_for(target) if target in pages else preserved[target]
                if fragment not in anchors:
                    broken.add(
                        BrokenLearnLink(repository, source, url, f"missing anchor #{fragment}")
                    )
                continue
            if (
                target in _SITE_ROUTES
                or target in static_routes
                or target in redirects
                or any(pattern.match(target) for pattern in redirect_patterns)
            ):
                continue
            broken.add(BrokenLearnLink(repository, source, url, "missing page"))
    return sorted(broken, key=lambda item: (item.repository, item.url, item.source))


def format_report(broken_links):
    lines = ["", "### Broken learn.netdata.cloud links (grouped by repo) ###"]
    by_repository = {}
    for link in broken_links:
        by_repository.setdefault(link.repository, {}).setdefault(
            (link.url, link.reason), []
        ).append(link.source)
    for repository in sorted(by_repository):
        links = by_repository[repository]
        lines.append(f"\n=== Repo: {repository} ({len(links)} broken links) ===")
        for (url, reason), sources in sorted(links.items()):
            lines.append(f"\n  Broken link: {url} ({reason})")
            lines.append(f"  Referenced in {len(sources)} file(s):")
            lines.extend(f"    - {source}" for source in sorted(sources))
    lines.append(f"\nTotal broken learn.netdata.cloud links: {len(broken_links)}")
    return "\n".join(lines)
