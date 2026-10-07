import tempfile
import unittest
from pathlib import Path

import learn_links

NETLIFY = """# section: static << START
[[redirects]]
  from="/docs/old-page"
  to="/docs/target"

[[redirects]]
  from="/docs/moved/*"
  to="/docs/target"

[[redirects]]
  from="/docs/items/:name/details"
  to="/docs/target"
# section: static << END
"""


def page(slug, body, edit_url="https://github.com/netdata/netdata/edit/master/docs/page.md"):
    return (
        "---\n"
        f'custom_edit_url: "{edit_url}"\n'
        'learn_status: "Published"\n'
        f'learn_link: "https://learn.netdata.cloud/docs{slug}"\n'
        f'slug: "{slug}"\n'
        "---\n\n"
        f"{body}\n"
    )


class LearnLinkTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.docs = self.root / "docs"
        self.static = self.root / "static"
        self.docs.mkdir()
        self.static.mkdir()
        (self.static / "llms.txt").write_text("index\n")
        self.netlify = self.root / "netlify.toml"
        self.netlify.write_text(NETLIFY)
        self.write(
            "Target.mdx",
            page(
                "/target",
                "# Target page\n\n## Virtual nodes\n\n## Setup {#custom-setup}\n\n"
                "## Options\n\n## Options\n\n## Fish & Chips\n\n"
                '<a id="manual-anchor"></a>\n',
            ),
        )

    def tearDown(self):
        self.temporary.cleanup()

    def write(self, name, content):
        path = self.docs / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)

    def broken(self, body, preserved=None, edit_url=None):
        arguments = {"edit_url": edit_url} if edit_url else {}
        self.write("Source.mdx", page("/source", body, **arguments))
        return learn_links.find_broken_learn_links(
            self.docs, self.netlify, self.static, preserved_pages=preserved
        )

    def test_accepts_pages_anchors_redirects_and_static_files(self):
        links = [
            "https://learn.netdata.cloud/docs/target",
            "https://learn.netdata.cloud/docs/target/",
            "https://learn.netdata.cloud/docs/target#virtual-nodes",
            "https://learn.netdata.cloud/docs/target#custom-setup",
            "https://learn.netdata.cloud/docs/target#options-1",
            "https://learn.netdata.cloud/docs/target#fish--chips",
            "https://learn.netdata.cloud/docs/target#fish-chips",
            "https://learn.netdata.cloud/docs/target#manual-anchor",
            "https://learn.netdata.cloud/docs/target#:~:text=anything",
            "https://learn.netdata.cloud/docs/old-page",
            "https://learn.netdata.cloud/docs/old-page#ignored-on-redirects",
            "https://learn.netdata.cloud/docs/moved/deep/page",
            "https://learn.netdata.cloud/docs/items/x/details",
            "https://learn.netdata.cloud/llms.txt",
            "https://learn.netdata.cloud/",
            "https://learn.netdata.cloud",
        ]
        body = "\n".join(f"[link {index}]({url})" for index, url in enumerate(links))
        self.assertEqual(self.broken(body), [])

    def test_reports_missing_pages_and_anchors_with_their_source(self):
        broken = self.broken(
            "See [gone](https://learn.netdata.cloud/docs/gone) and "
            '<a href="https://learn.netdata.cloud/docs/target#nope">anchor</a>.',
            edit_url="https://github.com/netdata/netdata/edit/master/src/x/metadata.yaml",
        )
        self.assertEqual(
            [(item.repository, item.url, item.reason, item.source) for item in broken],
            [
                (
                    "netdata",
                    "https://learn.netdata.cloud/docs/gone",
                    "missing page",
                    "https://github.com/netdata/netdata/edit/master/src/x/metadata.yaml",
                ),
                (
                    "netdata",
                    "https://learn.netdata.cloud/docs/target#nope",
                    "missing anchor #nope",
                    "https://github.com/netdata/netdata/edit/master/src/x/metadata.yaml",
                ),
            ],
        )

    def test_ignores_links_inside_code(self):
        body = (
            "```markdown\n[x](https://learn.netdata.cloud/docs/XYZ)\n```\n\n"
            "~~~\n[x](https://learn.netdata.cloud/docs/also-gone)\n~~~\n\n"
            "Inline `[x](https://learn.netdata.cloud/docs/inline-gone)` code."
        )
        self.assertEqual(self.broken(body), [])

    def test_keeps_preserved_pages_of_skipped_repositories(self):
        preserved = {"/docs/on-prem/install": frozenset({"requirements"})}
        self.assertEqual(
            self.broken(
                "[a](https://learn.netdata.cloud/docs/on-prem/install#requirements)",
                preserved=preserved,
            ),
            [],
        )
        broken = self.broken(
            "[a](https://learn.netdata.cloud/docs/on-prem/install#missing)",
            preserved=preserved,
        )
        self.assertEqual([item.reason for item in broken], ["missing anchor #missing"])

    def test_snapshot_records_routes_and_anchors_of_selected_pages(self):
        self.write(
            "OnPrem.mdx",
            page(
                "/on-prem/install",
                "# Install\n\n## Requirements\n",
                edit_url="https://github.com/netdata/netdata-cloud-onprem/edit/master/docs/install.md",
            ),
        )
        snapshot = learn_links.snapshot_pages(
            self.docs,
            lambda front_matter: "/netdata-cloud-onprem/"
            in str(front_matter.get("custom_edit_url")),
        )
        self.assertEqual(list(snapshot), ["/docs/on-prem/install"])
        self.assertIn("requirements", snapshot["/docs/on-prem/install"])

    def test_generated_pages_without_a_source_are_attributed_to_learn(self):
        self.write(
            "Grid.mdx",
            "---\ncustom_edit_url: null\nlearn_link: "
            '"https://learn.netdata.cloud/docs/grid"\nslug: "/grid"\n---\n\n'
            "[x](https://learn.netdata.cloud/docs/gone)\n",
        )
        broken = learn_links.find_broken_learn_links(self.docs, self.netlify, self.static)
        self.assertEqual(
            [(item.repository, item.source) for item in broken],
            [("learn", (self.docs / "Grid.mdx").as_posix())],
        )

    def test_github_slug_matches_docusaurus_heading_ids(self):
        self.assertEqual(learn_links.github_slug("Fish & Chips"), "fish--chips")
        self.assertEqual(learn_links.github_slug("Use `netdata.conf` Options"), "use-netdataconf-options")
        self.assertEqual(learn_links.github_slug("fallback_type"), "fallback_type")
        # github-slugger keeps marks such as the emoji variation selector and drops symbols.
        self.assertEqual(learn_links.github_slug("⚠️ Warning"), "️-warning")
        self.assertEqual(learn_links.github_slug("x² growth"), "x-growth")
        self.assertEqual(
            sorted(learn_links.page_anchors("## A\n## A\n## A\n")),
            ["a", "a-1", "a-2"],
        )

    def test_heading_anchors_keep_inline_code_and_decode_entities(self):
        anchors = learn_links.page_anchors(
            "#### Alert Line `lookup`\n"
            "## The `<name>` option\n"
            "## Disk Requirements &amp; Retention\n"
            "## ⚠️ Critical Considerations\n"
            "   ## Indented heading\n"
            "> ## Quoted heading\n"
            "1. ## List heading\n"
        )
        expected = {
            "alert-line-lookup",
            "the-name-option",
            "disk-requirements--retention",
            "️-critical-considerations",
            "indented-heading",
            "quoted-heading",
            "list-heading",
        }
        self.assertEqual(expected - anchors, set())
        self.assertNotIn("alert-line", anchors)

    def test_setext_headings_are_anchors(self):
        anchors = learn_links.page_anchors(
            "Setext title\n============\n\n"
            "Setext section\n--------------\n\n"
            "Two line\nheading\n---\n\n"
            "- Item title\n  ---\n\n"
            "> Quoted title\n> ===\n\n"
            "## Setext section\n"
        )
        self.assertEqual(
            anchors,
            {
                "setext-title",
                "setext-section",
                "two-lineheading",
                "item-title",
                "quoted-title",
                "setext-section-1",
            },
        )

    def test_thematic_breaks_tables_and_lists_are_not_setext_headings(self):
        anchors = learn_links.page_anchors(
            "Intro paragraph\n\n---\n\n"
            "Stars\n***\n\n"
            "Spaced\n- - -\n\n"
            "- List item\n---\n\n"
            "> Quoted\n---\n\n"
            "| Name | Value |\n| --- | --- |\n| a | b |\n---\n\n"
            "Executed commands:\n- `ls`\n\n"
            "## Real heading\n"
        )
        self.assertEqual(anchors, {"real-heading"})

    def test_front_matter_is_not_a_setext_heading(self):
        broken = self.broken("[x](https://learn.netdata.cloud/docs/target#slug-target)")
        self.assertEqual([item.reason for item in broken], ["missing anchor #slug-target"])

    def test_checks_reference_definitions_and_bare_urls(self):
        broken = self.broken(
            "[gone]: https://learn.netdata.cloud/docs/gone-reference\n"
            '[ok]: <https://learn.netdata.cloud/docs/target> "Title"\n\n'
            "Read https://learn.netdata.cloud/docs/gone-bare. "
            "Or see (https://learn.netdata.cloud/docs/target#virtual-nodes).\n\n"
            "**https://learn.netdata.cloud/docs/gone-emphasis**\n\n"
            "See [the reference][gone] and [the target][ok].\n"
        )
        self.assertEqual(
            [item.url for item in broken],
            [
                "https://learn.netdata.cloud/docs/gone-bare",
                "https://learn.netdata.cloud/docs/gone-emphasis",
                "https://learn.netdata.cloud/docs/gone-reference",
            ],
        )

    def test_url_text_that_is_not_an_autolink_is_ignored(self):
        body = (
            "[https://learn.netdata.cloud/docs/gone-text](https://learn.netdata.cloud/docs/target)\n\n"
            '<a href="https://learn.netdata.cloud/docs/target" '
            'title="https://learn.netdata.cloud/docs/gone-attribute">x</a>\n\n'
            "prefixhttps://learn.netdata.cloud/docs/gone-glued and "
            "https://learn.netdata.cloud.example.com/docs/gone-domain\n"
        )
        self.assertEqual(self.broken(body), [])


if __name__ == "__main__":
    unittest.main()
