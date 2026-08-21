import unittest
from unittest import mock

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

    def test_ignored_repository_removes_only_its_unresolved_legacy_redirect(self):
        legacy = {
            "/on-prem": (
                "https://github.com/netdata/netdata-cloud-onprem/"
                "blob/master/docs/page.md"
            ),
            "/agent": "https://github.com/netdata/netdata/blob/master/docs/page.md",
        }
        self.assertEqual(
            redirects.UpdateGHLinksBasedOnMap(
                {},
                legacy,
                ignored_github_repositories={"netdata/netdata-cloud-onprem"},
            ),
            {"/agent": "https://github.com/netdata/netdata/blob/master/docs/page.md"},
        )

    def test_non_ignored_unresolved_legacy_redirect_is_preserved(self):
        legacy = {
            "/on-prem": (
                "https://github.com/netdata/netdata-cloud-onprem/"
                "blob/master/docs/page.md"
            )
        }
        self.assertEqual(redirects.UpdateGHLinksBasedOnMap({}, legacy), legacy)

    def test_ignored_on_prem_mapping_preserves_the_tracked_internal_redirect(self):
        source = "/docs/netdata-cloud-on-prem/light-poc-deployment"
        tracked = {source: "/docs/netdata-cloud-on-prem/poc-without-k8s"}
        legacy = {
            source: (
                "https://github.com/netdata/netdata-cloud-onprem/"
                "blob/master/docs/learn.netdata.cloud/poc-without-k8s.md"
            )
        }
        filtered = redirects.UpdateGHLinksBasedOnMap(
            {},
            legacy,
            ignored_github_repositories={"netdata/netdata-cloud-onprem"},
        )
        self.assertEqual(redirects.combineDictsOverwrite(tracked, filtered), tracked)
        with self.assertRaisesRegex(ValueError, "Conflicting redirect identity"):
            redirects.combineDictsOverwrite(
                tracked,
                redirects.UpdateGHLinksBasedOnMap({}, legacy),
            )

    def test_current_mapping_wins_even_when_its_repository_is_ignored(self):
        github_url = (
            "https://github.com/netdata/netdata-cloud-onprem/"
            "blob/master/docs/page.md"
        )
        self.assertEqual(
            redirects.UpdateGHLinksBasedOnMap(
                {github_url: "/docs/current"},
                {"/old": github_url},
                ignored_github_repositories={"netdata/netdata-cloud-onprem"},
            ),
            {"/old": "/docs/current"},
        )

    def test_main_does_not_hide_redirect_conflicts(self):
        with (
            mock.patch.object(
                redirects,
                "reductTonew_learn_pathFromGHLinksCorrelation",
                return_value={"https://github.com/netdata/netdata/blob/master/docs/second.md": "/second"},
            ),
            mock.patch.object(redirects, "addMovedRedirects", return_value={}),
            mock.patch.object(redirects, "append_entries_to_json"),
            mock.patch.object(
                redirects,
                "readLegacyLearnDocMap",
                return_value={"/old": "https://github.com/netdata/netdata/blob/master/docs/second.md"},
            ),
            mock.patch.object(
                redirects,
                "readRedirectsFromFile",
                return_value={"/old": "/first"},
            ),
        ):
            with self.assertRaisesRegex(ValueError, "Conflicting redirect identity /old"):
                redirects.main({})

if __name__ == "__main__":
    unittest.main()
