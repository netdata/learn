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

    def test_preserves_legacy_source_spelling(self):
        cleaned = redirects.clean_redirects({"docs/old/": "/docs/current/"})
        self.assertEqual(cleaned, {"docs/old/": "/docs/current/"})

if __name__ == "__main__":
    unittest.main()
