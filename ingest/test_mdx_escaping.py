import tempfile
import unittest
from pathlib import Path

import ingest

# Source lines that ingest used to escape inside code, where MDX shows the backslash.
CODE_FROM_PUBLISHED_PAGES = {
    "Alert Configuration Reference": (
        "| Comparison | `<`, `==`, `<=`, `<>`, `!=`, `>`, `>=` | `1` (true) or `0` (false) |\n"
    ),
    "AWS SNS": (
        "An example working configuration would be:\n\n```yaml\n```text\n"
        'SEND_AWSSNS="YES"\n'
        'AWSSNS_MESSAGE_FORMAT="${status} on ${host} at ${date}: ${chart} ${value_string}"\n'
        "```\n"
    ),
    "Chart Template Format": (
        "| Effective `chart.priority <= 0` after group inheritance | Treated as `70000`. |\n"
    ),
    "Oracle DB": (
        "2. Verify access:\n\n   ```sql\n"
        "   SELECT COUNT(*) FROM V$SQLSTATS WHERE ROWNUM <= 1;\n   ```\n"
    ),
    "Netdata style guide": (
        "Include the language directly after the three backticks (```` ``` ````):\n\n"
        "````c\n```c\ninline char *health_stock_config_dir(void) {\n}\n```\n````\n\n"
        "And the prettified result:\n\n"
        "```c\ninline char *health_stock_config_dir(void) {\n}\n```\n"
    ),
    "CountIf": "- `>=`, greater or equal to\n- `<=`, less or equal to\n",
    "Queries": "- `countif`: A comparison operator followed by a value (e.g., `>100`, `<=50`)\n",
    "log2journal": (
        "````text\n  --rewrite KEY=/MATCH/REPLACE[/OPTIONS]\n"
        "       ```yaml\n       rewrite:\n         - key: KEY\n"
        "           value: '${KEY3}${KEY4}' # gets the values of KEY3 and KEY4\n"
        "       ```\n"
        "       ```yaml\n           value: 'all input keys as ${VARIABLE}'\n       ```\n"
        "````\n"
    ),
    "Organize systems metrics and alerts": (
        "1. Edit `netdata.conf`:\n\n    ```bash\n    sudo ./edit-config netdata.conf\n\n"
        "3. You can use environment variables in label values:\n\n"
        "    ```text\n    [host labels]\n        region = ${REGION}\n"
        "        location = ${DC}-${RACK:-default}\n    ```\n"
    ),
    "Classifiers": "Comparing a string-typed identifier with `>` / `<` / `>=` / `<=` raises\n",
    "SNMP Trap Profile Format": "values ordered with `lower <= upper`.\n",
    "OpenTelemetry Plugin Reference": (
        "Timing must satisfy `0 < interval <= 3600`, `interval < grace`, and `grace <= expiry`.\n"
    ),
}


class MdxEscapingTests(unittest.TestCase):
    def test_code_from_published_pages_stays_as_written(self):
        for page, source in CODE_FROM_PUBLISHED_PAGES.items():
            with self.subTest(page=page):
                self.assertEqual(ingest._escape_mdx(source), source)

    def test_prose_around_code_is_still_escaped(self):
        source = (
            "1. Edit {file}:\n\n    ```bash\n    sudo edit\n\n2. Add {labels} when a <= b:\n\n"
            "    ```text\n    region = ${REGION}\n    ```\n"
        )
        self.assertEqual(
            ingest._escape_mdx(source),
            source.replace("{file}", "\\{file}")
            .replace("{labels}", "\\{labels}")
            .replace("a <= b", "a \\<= b"),
        )

    def test_prose_rewrites(self):
        cases = {
            "zabbix.{context} and ${count}": "zabbix.\\{context} and $\\{count}",
            "a <= b, 5%<x and a <-> b": "a \\<= b, 5%\\<x and a \\<-> b",
            '<img style={{width: "90%"}} />': '<img style={{width: "90%"}} />',
            "See <https://x.y/a> or <me@x.y>.": "See [https://x.y/a](https://x.y/a) or [me@x.y](mailto:me@x.y).",
            "<details><summary>More</summary>": "<details>\n<summary>More</summary>",
            "import { A } from 'b'\n\n{c}": "import { A } from 'b'\n\n\\{c}",
        }
        for source, expected in cases.items():
            with self.subTest(source=source):
                self.assertEqual(ingest._escape_mdx(source), expected)

    def test_code_keeps_text_that_prose_rewrites(self):
        source = (
            "`<https://x.y/a>` and `5%<x` and `a <-> b`\n\n"
            "```html\n<details><summary>More</summary>\n<me@x.y> {a}\n```\n"
        )
        self.assertEqual(ingest._escape_mdx(source), source)

    def test_escaped_characters_are_not_escaped_again(self):
        cases = {
            "\\{a} and a \\<= b and \\<-> and 5%\\<x": "\\{a} and a \\<= b and \\<-> and 5%\\<x",
            # The old rewrites produced %\\<-> here, a literal backslash and a bare <.
            "5%<->6": "5%\\<->6",
            # An escaped backslash does not escape the brace after it.
            "C:\\\\{dir}": "C:\\\\\\{dir}",
        }
        for source, expected in cases.items():
            with self.subTest(source=source):
                self.assertEqual(ingest._escape_mdx(source), expected)

    def test_escaping_twice_changes_nothing(self):
        document = "\n".join(CODE_FROM_PUBLISHED_PAGES.values()) + (
            "\nSet {name} when a <= b, 5%<x, a <-> b, C:\\\\{dir}, <https://x.y>.\n"
        )
        once = ingest._escape_mdx(document)
        self.assertNotEqual(once, document)
        self.assertEqual(ingest._escape_mdx(once), once)

    def test_sanitize_page_escapes_prose_and_keeps_code(self):
        with tempfile.TemporaryDirectory() as directory:
            page = Path(directory) / "page.mdx"
            page.write_text(
                "<!--\ntitle: Oracle DB\n-->\n\nRows where n <= {limit}:\n\n"
                "```sql\nSELECT * FROM t WHERE ROWNUM <= 1;\n```\n",
                encoding="utf-8",
            )
            ingest.sanitize_page(page)
            sanitized = page.read_text(encoding="utf-8")
            self.assertTrue(sanitized.startswith("---\ntitle: Oracle DB\n---\n"))
            self.assertIn("\nRows where n \\<= \\{limit}:\n\n```sql\n", sanitized)
            self.assertTrue(sanitized.endswith("```sql\nSELECT * FROM t WHERE ROWNUM <= 1;\n```\n"))


if __name__ == "__main__":
    unittest.main()
