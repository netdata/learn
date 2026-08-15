import unittest

import autogenerateRedirects as redirects


class RedirectCleanupTests(unittest.TestCase):
    def test_removes_self_redirects_and_rules_that_shadow_live_routes(self):
        cleaned = redirects.clean_redirects(
            {
                "/docs/live": "/docs/new",
                "/docs/self": "/docs/self/",
                "/docs/legacy": "/docs/new",
            },
            {"/docs/live"},
        )
        self.assertEqual(cleaned, {"/docs/legacy": "/docs/new"})

    def test_collapses_redirect_chains_to_one_hop(self):
        cleaned = redirects.clean_redirects(
            {
                "/old": "/middle",
                "/middle": "/current",
                "/current-old": "/current",
            }
        )
        self.assertEqual(cleaned["/old"], "/current")
        self.assertEqual(cleaned["/middle"], "/current")

    def test_drops_redirect_cycles(self):
        cleaned = redirects.clean_redirects({"/a": "/b", "/b": "/a"})
        self.assertEqual(cleaned, {})

    def test_repairs_legacy_source_spelling(self):
        cleaned = redirects.clean_redirects({"docs/old/": "/docs/current/"})
        self.assertEqual(cleaned, {"/docs/old": "/docs/current/"})

    def test_parse_redirects_rejects_a_conflicting_identity_before_dict_coalescing(self):
        document = """# section: dynamic << START
[[redirects]]
  from="/old"
  to="/first"
[[redirects]]
  from="/old/"
  to="/second"
# section: dynamic << END
"""
        with self.assertRaisesRegex(ValueError, "Conflicting redirect identity /old"):
            redirects.parseRedirects(document)

    def test_parse_redirects_deduplicates_an_identical_target(self):
        document = """# section: dynamic << START
[[redirects]]
  from="/old"
  to="/current"
[[redirects]]
  from="/old/"
  to="/current/"
# section: dynamic << END
"""
        self.assertEqual(
            redirects.clean_redirects(redirects.parseRedirects(document)),
            {"/old": "/current"},
        )

    def test_merge_rejects_conflicting_identity(self):
        with self.assertRaisesRegex(ValueError, "Conflicting redirect identity /old"):
            redirects.combineDictsOverwrite(
                {"/old": "/first"},
                {"/old/": "/second"},
            )

    def test_merge_preserves_external_host_identity(self):
        with self.assertRaisesRegex(ValueError, "Conflicting redirect identity /old"):
            redirects.combineDictsOverwrite(
                {"/old": "https://example.com/release"},
                {"/old/": "https://example.net/release"},
            )

if __name__ == "__main__":
    unittest.main()
