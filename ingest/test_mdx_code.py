import unittest

import mdx_code


def code(text):
    return [text[start:end] for start, end in mdx_code.code_ranges(text)]


class FencedCodeTests(unittest.TestCase):
    def test_fence_closes_with_a_bare_fence_of_its_character_at_least_as_long(self):
        text = "````\na\n```\nb\n```js\nc\n`````\nprose `x`\n"
        self.assertEqual(code(text), ["````\na\n```\nb\n```js\nc\n`````", "`x`"])

    def test_backtick_fence_info_string_cannot_contain_backticks(self):
        self.assertEqual(code("```js` is text\n```\ncode\n```\n"), ["```\ncode\n```"])

    def test_fence_line_with_an_info_string_inside_a_block_is_content(self):
        # The AWS SNS notification page writes ```text right after ```yaml.
        text = '```yaml\n```text\nFORMAT="${status} on ${host}"\n```\n\nAfter {a}.\n'
        self.assertEqual(code(text), ['```yaml\n```text\nFORMAT="${status} on ${host}"\n```'])

    def test_longer_fences_contain_shorter_ones(self):
        # The style guide shows a fenced block inside a four-backtick fence and a code span.
        text = (
            "Use (```` ``` ````) here {a}.\n\n````c\n```c\nint f(void) {\n```\n````\n\n"
            "Result {b}:\n\n```c\nint f(void) {\n```\n"
        )
        self.assertEqual(
            code(text),
            [
                "```` ``` ````",
                "````c\n```c\nint f(void) {\n```\n````",
                "```c\nint f(void) {\n```",
            ],
        )

    def test_indented_fences_inside_a_longer_fence_are_content(self):
        text = "````text\nOPTIONS\n       ```yaml\n       a: '${KEY}'\n       ```\n       more '${KEY}'\n````\n"
        self.assertEqual(code(text), [text[:-1]])

    def test_fence_ends_with_its_list_item(self):
        # An unclosed fence in item 1 ends where item 2 starts; item 2 opens its own fence.
        text = (
            "1. Edit:\n\n    ```bash\n    sudo edit\n\n2. Add {a}:\n\n"
            "    ```text\n    region = ${REGION}\n    ```\n"
        )
        self.assertEqual(
            code(text),
            ["    ```bash\n    sudo edit\n", "    ```text\n    region = ${REGION}\n    ```"],
        )

    def test_line_indented_less_than_the_item_content_ends_the_fence(self):
        self.assertEqual(
            code("1. x\n   ```\n   {a}\n  ```\n  {b}\n"), ["   ```\n   {a}", "  ```\n  {b}\n"]
        )

    def test_fence_ends_with_its_blockquote(self):
        self.assertEqual(code("> ```\n> {a}\n{b}\n"), ["> ```\n> {a}"])
        self.assertEqual(code("> ```\n> {a}\n\n> {b}\n"), ["> ```\n> {a}"])
        # A paragraph continues over a lazy line; a fence does not.
        self.assertEqual(code("> a\n> ```\n> {a}\n{b}\n"), ["> ```\n> {a}"])

    def test_fence_ends_with_its_directive(self):
        self.assertEqual(code(":::note\n```\n{a}\n:::\n{b}\n"), ["```\n{a}"])
        # A shorter ::: line does not close a :::: directive.
        self.assertEqual(
            code("::::note\n```\n{a}\n:::\n{b}\n::::\n{c}\n"), ["```\n{a}\n:::\n{b}"]
        )

    def test_mdx_has_no_indented_code(self):
        self.assertEqual(
            code("        ```\n        {a}\n        ```\n{b}\n"),
            ["        ```\n        {a}\n        ```"],
        )
        self.assertEqual(code("    {a}\n"), [])

    def test_tilde_fence_and_unclosed_fence(self):
        self.assertEqual(code("~~~ `info`\n{a}\n~~~\n{b}\n"), ["~~~ `info`\n{a}\n~~~"])
        self.assertEqual(code("text {a}\n```\n{b}\n"), ["```\n{b}\n"])


class CodeSpanTests(unittest.TestCase):
    def test_code_span_pairs_backtick_runs_of_equal_length(self):
        self.assertEqual(code("a ``x ` y`` b `c` d\n"), ["``x ` y``", "`c`"])

    def test_code_span_crosses_lines_within_a_paragraph_only(self):
        self.assertEqual(code("a `b\nc` d\n\n`e\n\nf`\n"), ["`b\nc`"])
        self.assertEqual(code("- a `b\nc` d\n"), ["`b\nc`"])
        self.assertEqual(code("> `a\n> b`\n"), ["`a\n> b`"])

    def test_escaped_backtick_does_not_open_a_code_span(self):
        self.assertEqual(code("\\`not` code `yes`\n"), ["` code `"])

    def test_blocks_that_interrupt_a_paragraph_end_its_code_spans(self):
        # A bullet and a heading interrupt a paragraph; an ordered item not starting at 1 does not.
        self.assertEqual(code("p `a\n- b` c\n\np `a\n2. b` c\n\np `a\n# h` c\n"), ["`a\n2. b`"])
        self.assertEqual(code("`a\n---\nb`\n"), [])
        self.assertEqual(code("p `a\n<div>\nb` c\n</div>\n"), [])

    def test_table_cells_end_at_unescaped_pipes(self):
        text = "| a | b |\n|---|---|\n| `x|y` | `z` |\n| `x\\|y` | w |\n"
        self.assertEqual(code(text), ["`z`", "`x\\|y`"])
        self.assertEqual(code("p `a\n| x | y |\n|---|---|\n| `b` | c |\n"), ["`b`"])

    def test_directive_label_is_inline_content(self):
        self.assertEqual(code(":::tip[Use `x`]\n`y`\n:::\n"), ["`x`", "`y`"])


class FrontMatterTests(unittest.TestCase):
    def test_front_matter_keeps_code_spans_but_opens_no_block(self):
        text = '---\ntitle: "A `{x}` b"\nkeywords: ```odd\n---\n\n`c` {d}\n'
        self.assertEqual(code(text), ["`{x}`", "`c`"])


    def test_page_body_has_no_front_matter(self):
        # llms-full.txt reads page bodies, where a leading --- is a thematic break.
        body = "---\n\n```\n{a}\n```\n\n---\n"
        ranges = mdx_code.code_ranges(body, front_matter=False)
        self.assertEqual([body[start:end] for start, end in ranges], ["```\n{a}\n```"])
        self.assertEqual(code(body), [])


class TransformTests(unittest.TestCase):
    def test_transform_skips_code_and_overlapping_ranges(self):
        text = "a {b} `c {d}` e\n```\n{f}\n```\n"
        self.assertEqual(
            mdx_code.transform_prose(text, str.upper), "A {B} `c {d}` E\n```\n{f}\n```\n"
        )
        self.assertEqual(
            mdx_code.transform_outside("abcdef", [(3, 5), (1, 2), (2, 4)], str.upper), "AbcdeF"
        )


if __name__ == "__main__":
    unittest.main()
