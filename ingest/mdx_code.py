"""Locate code in MDX the way Docusaurus' MDX parser reads it.

Ingest rewrites prose so that MDX can compile it: it escapes characters MDX would read as JSX
or expressions and turns autolinks into links. MDX renders code literally, so these rewrites
must skip fenced code blocks and code spans, and llms-full.txt must undo them in the same
places. Both use this module, so they agree on what is code.

The rules follow micromark with the MDX, GFM and directive extensions that Docusaurus uses:

- MDX has no indented code, so fences, headings, list markers and blockquote markers may be
  indented any amount.
- A fence closes with a fence of the same character that is at least as long and has nothing
  after it, or when the blockquote, list item or ::: directive containing it ends. A backtick
  fence's info string cannot contain backticks.
- A code span pairs backtick runs of equal length within one paragraph, heading, directive
  label or table cell. Paragraphs continue over lazy lines; a table cell ends at an unescaped
  pipe, even between backticks.
"""

import re
from dataclasses import dataclass

_PUNCTUATION = frozenset("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~")
_FENCE_OPENING = re.compile(r"[ \t]*(?:(`{3,})[^`]*|(~{3,}).*)$")
_FENCE_CLOSING = re.compile(r"[ \t]*(`{3,}|~{3,})[ \t]*$")
_ATX_HEADING = re.compile(r"[ \t]*#{1,6}(?:[ \t]|$)")
_THEMATIC_BREAK = re.compile(r"[ \t]*([-*_])(?:[ \t]*\1){2,}[ \t]*$")
_SETEXT_UNDERLINE = re.compile(r"[ \t]*(?:=+|-+)[ \t]*$")
_BLOCKQUOTE = re.compile(r"[ \t]*>")
_LIST_ITEM = re.compile(r"[ \t]*(?:[-+*]|(\d{1,9})[.)])(?=[ \t]|$)")
_DIRECTIVE_OPENING = re.compile(r"[ \t]*(:{3,})[A-Za-z]")
_DIRECTIVE_CLOSING = re.compile(r"[ \t]*(:{3,})[ \t]*$")
# JSX tags or an HTML comment alone on a line end a paragraph.
_JSX_LINE = re.compile(r"[ \t]*(?:<[^<>]*>[ \t]*)+$")
_TABLE_DELIMITER = re.compile(
    r"[ \t]*\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$"
)


@dataclass
class _Container:
    kind: str  # "quote", "item" or "directive"
    size: int = 0  # item: content indentation; directive: length of its ::: fence


@dataclass
class _Fence:
    marker: str
    start: int
    end: int


def _advance(line, pos, col, end):
    """Move from pos to end, tracking the column with tabs stopping at multiples of 4."""
    while pos < end:
        col = col + 4 - col % 4 if line[pos] == "\t" else col + 1
        pos += 1
    return pos, col


def _whitespace_end(line, pos):
    while pos < len(line) and line[pos] in " \t":
        pos += 1
    return pos


def _consume_columns(line, pos, col, width):
    """Consume up to width columns of leading whitespace."""
    target = col + width
    while pos < len(line) and line[pos] in " \t" and col < target:
        pos, col = _advance(line, pos, col, pos + 1)
    return pos, col


def _code_spans(content):
    """Return (start, end) indexes of the code spans in one block's inline content."""
    spans = []
    index = 0
    while index < len(content):
        character = content[index]
        if character == "\\":
            index += 2 if content[index + 1 : index + 2] in _PUNCTUATION else 1
            continue
        if character != "`":
            index += 1
            continue
        run_end = index
        while run_end < len(content) and content[run_end] == "`":
            run_end += 1
        length = run_end - index
        search = run_end
        closing = None
        while search < len(content):
            if content[search] != "`":
                search += 1
                continue
            closing_end = search
            while closing_end < len(content) and content[closing_end] == "`":
                closing_end += 1
            if closing_end - search == length:
                closing = closing_end
                break
            search = closing_end
        if closing is None:
            index = run_end
        else:
            spans.append((index, closing))
            index = closing
    return spans


def _cells(row):
    """Return (start, end) indexes of a table row's cells: split at unescaped pipes."""
    cells = []
    start = 0
    index = 0
    while index < len(row):
        if row[index] == "\\":
            index += 2
            continue
        if row[index] == "|":
            cells.append((start, index))
            start = index + 1
        index += 1
    cells.append((start, len(row)))
    if not row[cells[0][0] : cells[0][1]].strip() and len(cells) > 1:
        cells = cells[1:]
    if not row[cells[-1][0] : cells[-1][1]].strip() and len(cells) > 1:
        cells = cells[:-1]
    return cells


def _list_item(rest, paragraph_open):
    """Return the list item marker match if rest starts a list item here, else None."""
    if _THEMATIC_BREAK.match(rest):
        return None
    marker = _LIST_ITEM.match(rest)
    if marker is None:
        return None
    if paragraph_open:
        # Only a non-empty bullet or an ordered item starting at 1 interrupts a paragraph.
        if not rest[marker.end() :].strip():
            return None
        if marker.group(1) is not None and int(marker.group(1)) != 1:
            return None
    return marker


class _Scanner:
    def __init__(self, text, front_matter):
        self.text = text
        self.front_matter = front_matter
        self.ranges = []
        self.stack = []
        self.fence = None
        self.paragraph = []  # (offset, content) of each line of the open paragraph
        self.table = False

    def scan(self):
        lines = self.text.split("\n")
        offset = 0
        index = 0
        if self.front_matter and lines[0].rstrip() == "---":
            closing = next(
                (number for number in range(1, len(lines)) if lines[number].rstrip() == "---"),
                None,
            )
            if closing is not None:
                # Front matter is YAML, not markdown: it never opens a block, but its code spans
                # stay protected as before, so a value like `{name}` is not escaped.
                for line in lines[: closing + 1]:
                    self._inline(offset, line)
                    offset += len(line) + 1
                index = closing + 1
        for line in lines[index:]:
            # Like MDX, read CRLF as a line ending: a fence line ending in \r still closes.
            self._line(line[:-1] if line.endswith("\r") else line, offset)
            offset += len(line) + 1
        self._close_leaf()
        return _merge(self.ranges)

    def _line(self, line, offset):
        pos, col = 0, 0
        matched = 0
        for index, container in enumerate(self.stack):
            if container.kind == "quote":
                marker = _BLOCKQUOTE.match(line, pos)
                if marker is None:
                    break
                pos, col = _advance(line, pos, col, marker.end())
                if pos < len(line) and line[pos] in " \t":
                    pos, col = _advance(line, pos, col, pos + 1)
            elif container.kind == "item":
                if line[pos:].strip():
                    _, indent_col = _advance(line, pos, col, _whitespace_end(line, pos))
                    if indent_col - col < container.size:
                        break
                pos, col = _consume_columns(line, pos, col, container.size)
            else:
                closing = _DIRECTIVE_CLOSING.match(line, pos)
                if closing and len(closing.group(1)) >= container.size:
                    self._close_leaf()
                    del self.stack[index:]
                    return
            matched += 1

        rest = line[pos:]
        if matched < len(self.stack):
            if self._lazy(rest):
                self.paragraph.append((offset + pos, rest))
                return
            self._close_leaf()
            del self.stack[matched:]

        if self.fence is not None:
            closing = _FENCE_CLOSING.match(rest)
            self.fence.end = offset + len(line)
            if (
                closing
                and closing.group(1)[0] == self.fence.marker[0]
                and len(closing.group(1)) >= len(self.fence.marker)
            ):
                self._close_leaf()
            return

        while True:
            quote = _BLOCKQUOTE.match(line, pos)
            if quote:
                self._close_leaf()
                pos, col = _advance(line, pos, col, quote.end())
                if pos < len(line) and line[pos] in " \t":
                    pos, col = _advance(line, pos, col, pos + 1)
                self.stack.append(_Container("quote"))
                continue
            item = _list_item(line[pos:], bool(self.paragraph) and not self.table)
            if item:
                self._close_leaf()
                start_col = col
                marker_end = pos + item.end()
                if line[marker_end:].strip():
                    pos, col = _advance(line, pos, col, _whitespace_end(line, marker_end))
                    size = col - start_col
                else:
                    pos, col = _advance(line, pos, col, marker_end)
                    size = col - start_col + 1
                    pos = len(line)
                self.stack.append(_Container("item", size))
                continue
            directive = _DIRECTIVE_OPENING.match(line, pos)
            if directive:
                self._close_leaf()
                self.stack.append(_Container("directive", len(directive.group(1))))
                self._inline(offset + directive.end(), line[directive.end() :])
                return
            break

        rest = line[pos:]
        if not rest.strip():
            self._close_leaf()
            return
        fence = _FENCE_OPENING.match(rest)
        if fence:
            self._close_leaf()
            self.fence = _Fence(fence.group(1) or fence.group(2), offset, offset + len(line))
            return
        if _ATX_HEADING.match(rest):
            self._close_leaf()
            self._inline(offset + pos, rest)
            return
        if self.table:
            if not self._interrupts(rest):
                self._row(offset + pos, rest)
                return
            self._close_leaf()
        if self.paragraph:
            if self._starts_table(rest):
                return
            if _SETEXT_UNDERLINE.match(rest):
                self._close_leaf()
                return
        if _THEMATIC_BREAK.match(rest) or _JSX_LINE.match(rest):
            self._close_leaf()
            return
        self.paragraph.append((offset + pos, rest))

    def _lazy(self, rest):
        """A paragraph continues over a line that its containers do not continue."""
        return (
            bool(self.paragraph)
            and not self.table
            and bool(rest.strip())
            and not self._interrupts(rest)
        )

    def _interrupts(self, rest):
        return bool(
            _FENCE_OPENING.match(rest)
            or _ATX_HEADING.match(rest)
            or _THEMATIC_BREAK.match(rest)
            or _BLOCKQUOTE.match(rest)
            or _list_item(rest, True)
            or _DIRECTIVE_OPENING.match(rest)
            or _JSX_LINE.match(rest)
        )

    def _starts_table(self, rest):
        """Turn the paragraph's last line into a table header when rest is its delimiter row."""
        if not _TABLE_DELIMITER.match(rest):
            return False
        header_offset, header = self.paragraph[-1]
        if "|" not in header and "|" not in rest:
            return False
        if len(_cells(header)) != len(_cells(rest)):
            return False
        self.paragraph.pop()
        self._close_leaf()
        self._row(header_offset, header)
        self.table = True
        return True

    def _row(self, offset, row):
        for start, end in _cells(row):
            self._inline(offset + start, row[start:end])

    def _inline(self, offset, content):
        for start, end in _code_spans(content):
            self.ranges.append((offset + start, offset + end))

    def _flush_paragraph(self):
        lines = self.paragraph
        self.paragraph = []
        if not lines:
            return
        content = "\n".join(text for _, text in lines)
        starts = []
        position = 0
        for line_offset, text in lines:
            starts.append((position, line_offset))
            position += len(text) + 1

        def original(index):
            line_start, line_offset = next(
                (start, line_offset)
                for start, line_offset in reversed(starts)
                if start <= index
            )
            return line_offset + index - line_start

        for start, end in _code_spans(content):
            self.ranges.append((original(start), original(end - 1) + 1))

    def _close_leaf(self):
        if self.fence is not None:
            self.ranges.append((self.fence.start, self.fence.end))
            self.fence = None
        self._flush_paragraph()
        self.table = False


def _merge(ranges):
    merged = []
    for start, end in sorted(ranges):
        if merged and start <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], end))
        else:
            merged.append((start, end))
    return merged


def code_ranges(text, front_matter=True):
    """Return the sorted (start, end) offsets of the fenced code blocks and code spans in text.

    With front_matter, text is a whole page and a leading --- block is its YAML front matter;
    without it, text is a page body, where a leading --- is a thematic break.
    """
    return _Scanner(text, front_matter).scan()


def transform_outside(text, ranges, transform):
    """Apply transform to each stretch of text outside the (start, end) ranges, which may overlap."""
    pieces = []
    position = 0
    for start, end in _merge(ranges):
        pieces.append(transform(text[position:start]))
        pieces.append(text[start:end])
        position = end
    pieces.append(transform(text[position:]))
    return "".join(pieces)


def transform_prose(text, transform, front_matter=True):
    """Apply transform to everything except code; code stays byte for byte."""
    return transform_outside(text, code_ranges(text, front_matter), transform)
