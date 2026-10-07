"""Check absolute learn.netdata.cloud links in the ingested docs.

Docs link to each other with repository-relative paths, which the ingest converts and checks.
Absolute https://learn.netdata.cloud links skip that conversion, so a typo or a renamed page
stays broken until Learn's rendered link check reports it on unrelated Learn pull requests.
Checking them against the final ingest output (pages, redirects, static files) lets the
documentation check of the repository that introduced the link fail instead.
"""

import html
import os
import re
import tomllib
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml

_LINK_TARGET = re.compile(r"\]\(\s*<?(https?://learn\.netdata\.cloud(?:[/?#][^)\s>]*)?)")
_HREF_TARGET = re.compile(
    r"""\bhref\s*=\s*["'](https?://learn\.netdata\.cloud(?:[/?#][^"']*)?)["']"""
)
_DEFINITION_TARGET = re.compile(
    r"^[ \t]*(?:>[ \t]*)*\[(?:[^\]\\]|\\.)+\]:[ \t]*<?"
    r"(https?://learn\.netdata\.cloud(?:[/?#][^\s>]*)?)"
)
# remark-gfm turns a bare URL into a link when no ASCII letter precedes it.
_BARE_URL = re.compile(
    r"(?<![A-Za-z])https?://learn\.netdata\.cloud(?![\w-]|\.[\w-])[^\s<]*"
)
_INLINE_LINK = re.compile(r"!?\[[^\]]*\](?:\([^)]*\)|\[[^\]]*\])")
_HTML_TAG = re.compile(r"<[^>]*>")
_AUTOLINK_TRAIL = "!\"')*,.:;?_~]"
_ENTITY_SUFFIX = re.compile(r"&[A-Za-z]+;$")
_INLINE_CODE = re.compile(r"(`+)(?:(?!\1).)+?\1")
_CODE_PLACEHOLDER = re.compile(r"\x00(\d+)\x00")
_CHARACTER_REFERENCE = re.compile(
    r"&(?:#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[A-Za-z][A-Za-z0-9]{1,31});"
)
_FENCE = re.compile(r"(`{3,}|~{3,})")
# MDX has no indented code, so headings, underlines and list markers may be indented.
_HEADING = re.compile(r"^[ \t]*(#{1,6})[ \t]+(.*?)[ \t]*$")
_CLOSING_HASHES = re.compile(r"[ \t]+#+$")
_SETEXT_UNDERLINE = re.compile(r"^[ \t]*(?:=+|-+)[ \t]*$")
_THEMATIC_BREAK = re.compile(r"^[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$")
_LIST_ITEM = re.compile(r"^[ \t]*(?:[-+*]|\d{1,9}[.)])(?:[ \t]+|$)")
_BLOCKQUOTE = re.compile(r"^[ \t]*>[ ]?")
_TABLE_DELIMITER = re.compile(
    r"^[ \t]*\|?(?:[ \t]*:?-+:?[ \t]*\|)*[ \t]*:?-+:?[ \t]*\|?[ \t]*$"
)
_DEFINITION = re.compile(r"^[ \t]*\[(?:[^\]\\]|\\.)+\]:")
# JSX or HTML alone on a line, a directive fence (:::), ESM or an expression: never paragraph text.
_NON_PARAGRAPH = re.compile(r"^[ \t]*(?:<.*>|:::.*|\{.*\})[ \t]*$|^(?:import|export)\s")
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


def _lines_outside_fences(body):
    """Yield the lines of a markdown body with fenced code blocks blanked out."""
    fence = None
    for line in body.split("\n"):
        stripped = line.strip()
        if fence is None:
            opening = _FENCE.match(stripped)
            if opening:
                fence = opening.group(1)
                yield ""
                continue
            yield line
        else:
            if (
                stripped
                and set(stripped) == {fence[0]}
                and len(stripped) >= len(fence)
            ):
                fence = None
            yield ""


def prose_lines(body):
    """Yield the lines of a markdown body with code blocks and inline code blanked out."""
    for line in _lines_outside_fences(body):
        yield _INLINE_CODE.sub(" ", line)


def _trim_autolink(url):
    """Drop what GFM leaves out of a bare URL: trailing punctuation, entities, unmatched ')'."""
    url = re.split(r"\][(\[]", url, maxsplit=1)[0]
    while True:
        entity = _ENTITY_SUFFIX.search(url)
        if entity:
            url = url[: entity.start()]
        elif url[-1] in _AUTOLINK_TRAIL and not (
            url[-1] == ")" and url.count(")") <= url.count("(")
        ):
            url = url[:-1]
        else:
            return url


def _bare_urls(line):
    # Link text, link destinations and tag attributes are not autolinked.
    text = _HTML_TAG.sub(" ", _INLINE_LINK.sub(" ", line))
    return [_trim_autolink(match.group(0)) for match in _BARE_URL.finditer(text)]


def learn_links(body):
    """Return the absolute Learn URLs a page links to: inline, reference, HTML and bare links."""
    links = []
    for line in prose_lines(body):
        links.extend(_LINK_TARGET.findall(line))
        links.extend(_HREF_TARGET.findall(line))
        links.extend(_DEFINITION_TARGET.findall(line))
        links.extend(_bare_urls(line))
    return links


def _code_span_text(match):
    content = match.group(0)[len(match.group(1)) : -len(match.group(1))]
    # CommonMark drops one space on each side when both are present.
    if content[:1] == content[-1:] == " " and content.strip(" "):
        content = content[1:-1]
    return content


def _heading_text(raw):
    """Return the text Docusaurus slugs: markup removed, inline code kept verbatim."""
    spans = []

    def protect(match):
        spans.append(_code_span_text(match))
        return f"\x00{len(spans) - 1}\x00"

    text = _INLINE_CODE.sub(protect, raw)
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = _CHARACTER_REFERENCE.sub(lambda match: html.unescape(match.group(0)), text)
    text = text.replace("\\", "").replace("*", "")
    text = re.sub(r"(?<!\w)_(.+?)_(?!\w)", r"\1", text)
    return _CODE_PLACEHOLDER.sub(lambda match: spans[int(match.group(1))], text).strip()


def _indent(line):
    return len(line) - len(line.lstrip(" \t"))


def _headings(body):
    """Yield the raw text of each ATX and Setext heading in document order.

    A Setext underline (=== or ---) turns the paragraph right above it into a heading only
    when it stays in that paragraph's container: the same blockquote depth and, for a
    paragraph that starts indented (list item content), at least the same indentation.
    Otherwise --- is a thematic break and === is paragraph text. Table rows, list markers,
    JSX lines and link definitions are not paragraph text.
    """
    paragraph = []
    paragraph_quote = 0
    paragraph_indent = 0
    in_table = False
    for line in _lines_outside_fences(body):
        quote = 0
        while (marker := _BLOCKQUOTE.match(line)) is not None:
            quote += 1
            line = line[marker.end() :]
        stripped = line.strip()
        if not stripped:
            paragraph, in_table = [], False
            continue
        atx = _HEADING.match(line)
        if atx:
            paragraph, in_table = [], False
            yield _CLOSING_HASHES.sub("", atx.group(2))
            continue
        if paragraph and _SETEXT_UNDERLINE.match(line):
            if quote == paragraph_quote and _indent(line) >= paragraph_indent:
                yield "\n".join(paragraph)
                paragraph = []
            elif stripped[0] == "=":
                paragraph.append(stripped)
            else:
                paragraph = []
            continue
        if _THEMATIC_BREAK.match(line):
            paragraph, in_table = [], False
            continue
        if in_table:
            continue
        if paragraph and "|" in line and _TABLE_DELIMITER.match(line):
            paragraph, in_table = [], True
            continue
        if _NON_PARAGRAPH.match(line) or (not paragraph and _DEFINITION.match(line)):
            paragraph = []
            continue
        item = _LIST_ITEM.match(line)
        if item:
            content = line[item.end() :].strip()
            atx = _HEADING.match(content)
            if atx:
                yield _CLOSING_HASHES.sub("", atx.group(2))
                content = ""
            paragraph = [content] if content else []
            paragraph_quote, paragraph_indent = quote, item.end()
            continue
        if paragraph and quote <= paragraph_quote:
            paragraph.append(stripped)
        else:
            paragraph = [stripped]
            paragraph_quote, paragraph_indent = quote, _indent(line)


def github_slug(text):
    """Slug a heading the way github-slugger, used by Docusaurus, does.

    github-slugger keeps letters, marks (such as the emoji variation selector), decimal and
    letter numbers, connector punctuation and hyphens, and turns spaces into hyphens.
    """
    slug = []
    for character in text.lower():
        category = unicodedata.category(character)
        if character == " ":
            slug.append("-")
        elif character == "-" or category[0] in "LM" or category in ("Nd", "Nl", "Pc"):
            slug.append(character)
    return "".join(slug)


def page_anchors(body):
    """Return the fragment identifiers a rendered page exposes."""
    anchors = set()
    occurrences = {}
    for text in _headings(body):
        explicit = _EXPLICIT_ID.search(text)
        if explicit:
            anchors.add(explicit.group(1))
            continue
        slug = github_slug(_heading_text(text))
        original = slug
        while slug in occurrences:
            occurrences[original] += 1
            slug = f"{original}-{occurrences[original]}"
        occurrences[slug] = 0
        anchors.add(slug)
        # Older ingested links collapse repeated hyphens; accept that spelling too.
        anchors.add(re.sub(r"-+", "-", slug).strip("-"))
    for line in prose_lines(body):
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
