#!/usr/bin/env python3
"""Check HTTP status codes for learn_link metadata in docs/*.mdx files.

Outputs:
 - CSV file at ./ingest/learn_link_status.csv with columns: file, learn_link, status_code, ok, error
 - Prints a short summary to stdout

Behavior:
 - Walks docs/ recursively
 - Extracts a frontmatter key `learn_link: "<url>"` if present
 - Checks each URL with a HEAD request, falls back to GET if HEAD not allowed
 - Uses a small thread pool for concurrency
 - Timeout default 10s
"""
import re
import csv
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

DOCS_DIR = Path('docs')
OUTPUT_CSV = Path('ingest/learn_link_status.csv')
TIMEOUT = 10
MAX_WORKERS = 10

LEARN_LINK_RE = re.compile(r'learn_link:\s*"(?P<url>https?://[^"]+)"')


def extract_learn_link_from_file(path: Path):
    try:
        text = path.read_text(encoding='utf-8')
    except Exception as e:
        return None
    m = LEARN_LINK_RE.search(text)
    if m:
        return m.group('url')
    return None


def check_url(url: str, timeout: int = TIMEOUT):
    try:
        # Try HEAD first
        resp = requests.head(url, allow_redirects=True, timeout=timeout)
        if resp.status_code in (405, 501):
            resp = requests.get(url, allow_redirects=True, timeout=timeout)
        return resp.status_code, None
    except Exception as e:
        return None, str(e)


def main():
    if not DOCS_DIR.exists():
        print(f"Docs directory {DOCS_DIR} not found", file=sys.stderr)
        sys.exit(1)

    files = list(DOCS_DIR.rglob('*.mdx')) + list(DOCS_DIR.rglob('*.md'))

    entries = []
    for f in files:
        url = extract_learn_link_from_file(f)
        if url:
            entries.append((f, url))

    if not entries:
        print("No learn_link metadata found in docs files.")
        return

    # Only print learn_links that return HTTP 404
    results_404 = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = {ex.submit(check_url, url): (f, url) for f, url in entries}
        for fut in as_completed(futures):
            f, url = futures[fut]
            status_code, error = fut.result()
            if status_code == 404:
                results_404.append((f, url))

    if results_404:
        for f, url in results_404:
            print(f"404: {f} -> {url}")
    else:
        print("No 404 learn_link URLs found.")

    return results_404


if __name__ == '__main__':
    res = main()
    # Exit non-zero when 404s are found to help CI detect problems
    if res:
        sys.exit(1)
