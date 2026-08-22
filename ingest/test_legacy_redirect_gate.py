import contextlib
import datetime
import io
import json
import os
import pathlib
import tempfile
import unittest
from unittest import mock

import yaml

import autogenerateRedirects as redirects


INGEST_DIR = pathlib.Path(__file__).resolve().parent
REPO_ROOT = INGEST_DIR.parent
GH = "https://github.com/netdata/netdata/blob/master/"
STATIC_TEMPLATE = """# section: static << START
{rules}
# section: static << END
"""
NETLIFY_TEMPLATE = """# section: static << START
# section: static << END

# section: dynamic << START
{rules}
# section: dynamic << END"""


def rule(source, target):
    return f'[[redirects]]\n  from="{source}"\n  to="{target}"\n'


class _GateFixture:
    """Temporary static.toml / netlify.toml / policy files for one gate scenario."""

    def __init__(self, static_rules="", tracked_rules="", retirements=None):
        self.directory = tempfile.TemporaryDirectory()
        root = pathlib.Path(self.directory.name)
        self.static_path = root / "static.toml"
        self.static_path.write_text(STATIC_TEMPLATE.format(rules=static_rules), encoding="utf-8")
        self.netlify_path = root / "netlify.toml"
        self.netlify_path.write_text(NETLIFY_TEMPLATE.format(rules=tracked_rules), encoding="utf-8")
        self.policy_path = root / "redirect-policy.json"
        policy = {"retired_wildcard_sources": []}
        if retirements is not None:
            policy["legacy_catalogue_retirements"] = retirements
        self.policy_path.write_text(json.dumps(policy), encoding="utf-8")

    def tracked(self):
        return redirects.readRedirectsFromFile(str(self.netlify_path))

    def gate(self, legacy, active_routes=()):
        return redirects.gate_legacy_redirects(
            legacy,
            self.tracked(),
            active_routes,
            static_path=str(self.static_path),
            policy_path=str(self.policy_path),
        )

    def close(self):
        self.directory.cleanup()


RETIREMENT = {
    "route": "/docs/gone",
    "source": GH + "docs/gone.md",
    "reason": "The page was removed and no replacement exists.",
    "evidence": ["netdata/netdata@abcdef123456 (#1) remove gone.md"],
    "reviewed": "2026-08-21",
}


class LegacyRedirectGateBranchTests(unittest.TestCase):
    def setUp(self):
        self.fixtures = []

    def tearDown(self):
        for fixture in self.fixtures:
            fixture.close()

    def fixture(self, **kwargs):
        fixture = _GateFixture(**kwargs)
        self.fixtures.append(fixture)
        return fixture

    def test_resolved_source_generates_its_current_redirect(self):
        fixture = self.fixture()
        result = fixture.gate({"/docs/old": "/docs/current"}, {"/docs/current"})
        self.assertEqual(result["resolved"], {"/docs/old": "/docs/current"})
        self.assertEqual((result["retained"], result["retired"], result["failed"]), ([], [], []))

    def test_unresolved_source_with_live_tracked_redirect_is_retained_and_reported(self):
        fixture = self.fixture(tracked_rules=rule("/docs/old", "/docs/current"))
        result = fixture.gate({"/docs/old": GH + "docs/moved.md"}, {"/docs/current"})
        self.assertEqual(result["resolved"], {})
        self.assertEqual(
            result["retained"],
            [{"route": "/docs/old", "source": GH + "docs/moved.md", "redirect": "/docs/current", "kind": "tracked"}],
        )
        self.assertEqual(result["failed"], [])
        report = redirects.format_legacy_redirect_report(result)
        self.assertIn("STALE https://learn.netdata.cloud/docs/old -> /docs/current (tracked redirect kept)", report)
        self.assertIn("missing source: " + GH + "docs/moved.md", report)

    def test_unresolved_source_with_tracked_redirect_to_an_unpublished_page_fails(self):
        fixture = self.fixture(tracked_rules=rule("/docs/old", "/docs/vanished"))
        result = fixture.gate({"/docs/old": GH + "docs/moved.md"}, {"/docs/current"})
        self.assertEqual(result["retained"], [])
        self.assertEqual(len(result["failed"]), 1)
        self.assertIn("not a published page: /docs/vanished", result["failed"][0]["detail"])

    def test_unresolved_source_covered_by_a_static_rule_is_retained(self):
        fixture = self.fixture(static_rules=rule("/docs/old", "/api"))
        result = fixture.gate({"/docs/old/": GH + "docs/moved.md"}, set())
        self.assertEqual(result["retained"][0]["kind"], "static")
        self.assertEqual(result["retained"][0]["redirect"], "/api")
        self.assertEqual(result["failed"], [])

    def test_tracked_wildcard_coverage_requires_a_live_computed_target(self):
        fixture = self.fixture(tracked_rules=rule("/docs/agent/cloud/*", "/docs/cloud/:splat"))
        live = fixture.gate({"/docs/agent/cloud/alerts": GH + "docs/gone.md"}, {"/docs/cloud/alerts"})
        self.assertEqual(live["retained"][0]["redirect"], "/docs/cloud/alerts")
        dead = fixture.gate({"/docs/agent/cloud/billing": GH + "docs/gone.md"}, {"/docs/cloud/alerts"})
        self.assertEqual(dead["retained"], [])
        self.assertEqual(len(dead["failed"]), 1)

    def test_reviewed_retirement_is_accepted_without_a_redirect(self):
        fixture = self.fixture(retirements=[RETIREMENT])
        result = fixture.gate({"/docs/gone": GH + "docs/gone.md"}, set())
        self.assertEqual(result["retired"], [{"route": "/docs/gone", "source": GH + "docs/gone.md"}])
        self.assertEqual((result["resolved"], result["retained"], result["failed"]), ({}, [], []))
        self.assertNotIn("/docs/gone", redirects.format_legacy_redirect_report(result))

    def test_retirement_applies_only_to_the_recorded_source(self):
        fixture = self.fixture(retirements=[RETIREMENT])
        result = fixture.gate({"/docs/gone": GH + "docs/other.md"}, set())
        self.assertEqual(result["retired"], [])
        self.assertIn("no tracked redirect", result["failed"][0]["detail"])
        self.assertIn("different source: " + GH + "docs/gone.md", result["failed"][0]["detail"])

    def test_unresolved_source_without_coverage_fails_with_an_actionable_message(self):
        fixture = self.fixture()
        result = fixture.gate({"/docs/old": GH + "docs/moved.md"}, {"/docs/current"})
        self.assertEqual(result["failed"], [{"route": "/docs/old", "source": GH + "docs/moved.md", "detail": "no tracked redirect"}])
        message = redirects.format_legacy_redirect_failure(result)
        self.assertIn("https://learn.netdata.cloud/docs/old", message)
        self.assertIn("missing source: " + GH + "docs/moved.md", message)
        self.assertIn("Do not weaken this gate", message)
        self.assertIn("catalogue migration is required", message)
        self.assertIn("LegacyLearnCorrelateLinksWithGHURLs.json", message)
        self.assertIn("legacy_catalogue_retirements", message)

    def test_catalogue_value_that_is_not_a_url_fails(self):
        fixture = self.fixture(tracked_rules=rule("/docs/x", "/docs/current"))
        result = fixture.gate({"/docs/x": "not-a-published-source"}, {"/docs/current"})
        self.assertEqual(result["resolved"], {})
        self.assertEqual(result["retained"], [])
        self.assertEqual(result["failed"][0]["route"], "/docs/x")
        self.assertIn("neither a GitHub source URL nor a published Learn route", result["failed"][0]["detail"])
        message = redirects.format_legacy_redirect_failure(result)
        self.assertIn("not-a-published-source", message)
        self.assertIn("Do not weaken this gate", message)

    def test_learn_route_value_is_resolved_only_when_it_is_live(self):
        fixture = self.fixture()
        live = fixture.gate({"/docs/old": "/docs/current"}, {"/docs/current"})
        self.assertEqual(live["resolved"], {"/docs/old": "/docs/current"})
        dead = fixture.gate({"/docs/old": "/docs/not-live"}, {"/docs/current"})
        self.assertEqual(dead["resolved"], {})
        self.assertEqual(len(dead["failed"]), 1)
        self.assertIn("neither a GitHub source URL nor a published Learn route", dead["failed"][0]["detail"])

    def test_live_tracked_redirect_wins_over_a_mismatched_retirement_and_reports_it(self):
        fixture = self.fixture(tracked_rules=rule("/docs/gone", "/docs/current"), retirements=[RETIREMENT])
        result = fixture.gate({"/docs/gone": GH + "docs/other.md"}, {"/docs/current"})
        self.assertEqual(result["failed"], [])
        self.assertEqual(result["retired"], [])
        self.assertEqual(result["retained"][0]["redirect"], "/docs/current")
        self.assertIn("different source", result["retained"][0]["note"])
        report = redirects.format_legacy_redirect_report(result)
        self.assertIn("STALE https://learn.netdata.cloud/docs/gone -> /docs/current", report)
        self.assertIn("policy retirement names a different source: " + GH + "docs/gone.md", report)

    def test_live_tracked_redirect_wins_over_a_matching_retirement(self):
        fixture = self.fixture(tracked_rules=rule("/docs/gone", "/docs/current"), retirements=[RETIREMENT])
        result = fixture.gate({"/docs/gone": GH + "docs/gone.md"}, {"/docs/current"})
        self.assertEqual(result["retired"], [])
        self.assertEqual(result["retained"][0]["kind"], "tracked")
        self.assertIn("also records a retirement", result["retained"][0]["note"])

    def test_static_rule_wins_over_a_retirement(self):
        fixture = self.fixture(static_rules=rule("/docs/gone", "/api"), retirements=[RETIREMENT])
        result = fixture.gate({"/docs/gone": GH + "docs/gone.md"}, set())
        self.assertEqual(result["retired"], [])
        self.assertEqual(result["retained"][0]["kind"], "static")

    def test_mismatched_retirement_with_a_dead_tracked_redirect_fails_with_both_details(self):
        fixture = self.fixture(tracked_rules=rule("/docs/gone", "/docs/vanished"), retirements=[RETIREMENT])
        result = fixture.gate({"/docs/gone": GH + "docs/other.md"}, {"/docs/current"})
        self.assertEqual(result["retained"], [])
        self.assertIn("not a published page: /docs/vanished", result["failed"][0]["detail"])
        self.assertIn("different source", result["failed"][0]["detail"])

    def test_incomplete_retirement_entries_are_rejected(self):
        for missing_field in redirects.RETIREMENT_FIELDS:
            entry = {field: value for field, value in RETIREMENT.items() if field != missing_field}
            fixture = self.fixture(retirements=[entry])
            with self.assertRaisesRegex(ValueError, f"missing {missing_field}"):
                fixture.gate({"/docs/gone": GH + "docs/gone.md"}, set())

    def test_duplicate_retirements_are_rejected(self):
        fixture = self.fixture(retirements=[RETIREMENT, dict(RETIREMENT, route="/docs/gone/")])
        with self.assertRaisesRegex(ValueError, "Duplicate legacy catalogue retirement"):
            fixture.gate({"/docs/gone": GH + "docs/gone.md"}, set())
        with self.assertRaisesRegex(ValueError, "Duplicate legacy catalogue retirement"):
            redirects.read_legacy_catalogue_retirements(str(fixture.policy_path))


class LegacyRedirectGateMainTests(unittest.TestCase):
    """End-to-end behaviour of autogenerateRedirects.main around the gate."""

    def setUp(self):
        self.fixture = _GateFixture()

    def tearDown(self):
        self.fixture.close()

    def run_main(self, mapping, legacy, ignored=(), moved=None):
        self.appended = mock.Mock()
        with (
            mock.patch.object(redirects, "reductTonew_learn_pathFromGHLinksCorrelation", return_value=mapping),
            mock.patch.object(redirects, "addMovedRedirects", return_value=moved or {}),
            mock.patch.object(redirects, "append_entries_to_json", self.appended),
            mock.patch.object(redirects, "readLegacyLearnDocMap", return_value=legacy),
            contextlib.redirect_stdout(io.StringIO()) as stdout,
        ):
            result = redirects.main(
                {},
                ignored_github_repositories=ignored,
                netlify_path=str(self.fixture.netlify_path),
                static_path=str(self.fixture.static_path),
                policy_path=str(self.fixture.policy_path),
            )
        return result, stdout.getvalue()

    def test_pending_source_move_keeps_the_tracked_redirect_and_reports_it(self):
        # The catalogue already names the source path a pending upstream move will create;
        # until that file exists, the previously generated redirect must stay in place.
        self.fixture.netlify_path.write_text(
            NETLIFY_TEMPLATE.format(rules=rule("/docs/old/dcstat", "/docs/current/dcstat")), encoding="utf-8"
        )
        mapping = {GH + "src/old/integrations/dcstat.md": "/docs/current/dcstat"}
        legacy = {"/docs/old/dcstat": GH + "src/new/integrations/dcstat.md"}
        result, output = self.run_main(mapping, legacy)
        self.assertEqual([entry["route"] for entry in result["retained"]], ["/docs/old/dcstat"])
        self.assertIn("STALE https://learn.netdata.cloud/docs/old/dcstat -> /docs/current/dcstat", output)
        written = redirects.readRedirectsFromFile(str(self.fixture.netlify_path))
        self.assertEqual(written, {"/docs/old/dcstat": "/docs/current/dcstat"})

    def test_completed_source_move_generates_the_redirect_from_the_catalogue(self):
        mapping = {GH + "src/new/integrations/dcstat.md": "/docs/current/dcstat"}
        legacy = {"/docs/old/dcstat": GH + "src/new/integrations/dcstat.md"}
        result, output = self.run_main(mapping, legacy)
        self.assertEqual(result["retained"], [])
        self.assertNotIn("STALE", output)
        written = redirects.readRedirectsFromFile(str(self.fixture.netlify_path))
        self.assertEqual(written, {"/docs/old/dcstat": "/docs/current/dcstat"})

    def test_unresolved_entry_fails_and_leaves_the_tracked_configuration_untouched(self):
        before = self.fixture.netlify_path.read_text(encoding="utf-8")
        legacy = {"/docs/old": GH + "docs/moved.md", "/docs/fine": GH + "docs/fine.md"}
        mapping = {GH + "docs/fine.md": "/docs/fine-current"}
        moved = {"https://learn.netdata.cloud/docs/previous": GH + "docs/fine.md"}
        with self.assertRaises(redirects.LegacyRedirectGateError) as raised:
            self.run_main(mapping, legacy, moved=moved)
        self.assertIn("https://learn.netdata.cloud/docs/old", str(raised.exception))
        self.assertNotIn("/docs/fine", str(raised.exception))
        self.assertEqual(self.fixture.netlify_path.read_text(encoding="utf-8"), before)
        self.appended.assert_not_called()

    def test_moved_entries_join_the_catalogue_only_after_the_gate_passes(self):
        legacy = {"/docs/fine": GH + "docs/fine.md"}
        mapping = {GH + "docs/fine.md": "/docs/fine-current"}
        moved = {"https://learn.netdata.cloud/docs/previous": GH + "docs/fine.md"}
        result, _ = self.run_main(mapping, legacy, moved=moved)
        self.appended.assert_called_once_with(moved)
        # The moved entry is gated in memory and already produces its redirect in this run.
        self.assertEqual(result["resolved"], {"/docs/fine": "/docs/fine-current", "/docs/previous": "/docs/fine-current"})
        written = redirects.readRedirectsFromFile(str(self.fixture.netlify_path))
        self.assertEqual(written, {"/docs/fine": "/docs/fine-current", "/docs/previous": "/docs/fine-current"})

    def test_unresolved_moved_entry_is_gated_before_it_is_written(self):
        mapping = {GH + "docs/fine.md": "/docs/fine-current"}
        moved = {"https://learn.netdata.cloud/docs/previous": "not-a-published-source"}
        with self.assertRaises(redirects.LegacyRedirectGateError):
            self.run_main(mapping, {}, moved=moved)
        self.appended.assert_not_called()

    def test_ignored_repository_entries_do_not_reach_the_gate(self):
        legacy = {
            "/docs/on-prem/page": "https://github.com/netdata/netdata-cloud-onprem/blob/master/docs/page.md",
            "/docs/agent/page": GH + "docs/page.md",
        }
        mapping = {GH + "docs/page.md": "/docs/agent-current"}
        with self.assertRaises(redirects.LegacyRedirectGateError):
            self.run_main(mapping, legacy)
        result, _ = self.run_main(mapping, legacy, ignored={"netdata/netdata-cloud-onprem"})
        self.assertEqual(result["failed"], [])
        self.assertEqual(result["resolved"], {"/docs/agent/page": "/docs/agent-current"})


class RepositoryCatalogueTests(unittest.TestCase):
    """The committed catalogue, policy, and tracked redirects must classify completely.

    The mapping fixture is ingest/one_commit_back_file-dict.yaml, the source-to-page mapping
    the ingest itself records on every run; it is not edited by hand.
    """

    @classmethod
    def setUpClass(cls):
        with open(INGEST_DIR / "one_commit_back_file-dict.yaml", encoding="utf-8") as fh:
            rows = yaml.safe_load(fh)
        cls.mapping = {}
        for row in rows:
            cls.mapping[row["custom_edit_url"]] = row["learn_path"]
            cls.mapping[row["custom_edit_url"].replace("/edit/", "/blob/")] = row["learn_path"]
        cls.catalogue = redirects.readLegacyLearnDocMap(str(REPO_ROOT / "LegacyLearnCorrelateLinksWithGHURLs.json"))
        with open(REPO_ROOT / "config/redirect-policy.json", encoding="utf-8") as fh:
            cls.policy = json.load(fh)

    def gate(self, ignored=()):
        legacy = redirects.UpdateGHLinksBasedOnMap(self.mapping, self.catalogue, ignored_github_repositories=ignored)
        return redirects.gate_legacy_redirects(
            legacy,
            redirects.readRedirectsFromFile(str(REPO_ROOT / "netlify.toml")),
            set(self.mapping.values()),
            static_path=str(REPO_ROOT / "static.toml"),
            policy_path=str(REPO_ROOT / "config/redirect-policy.json"),
        )

    def test_full_catalogue_has_no_unclassified_entries_against_the_recorded_mapping(self):
        result = self.gate()
        self.assertEqual(result["failed"], [])
        self.assertEqual(
            len(result["resolved"]) + len(result["retained"]) + len(result["retired"]),
            len(self.catalogue),
        )

    def test_full_catalogue_classifies_completely_without_the_on_prem_repository(self):
        result = self.gate(ignored={"netdata/netdata-cloud-onprem"})
        self.assertEqual(result["failed"], [])

    def test_ebpf_dcstat_routes_are_resolved_or_retained_across_the_upstream_move(self):
        result = self.gate()
        routes = {route for route, source in self.catalogue.items() if source.endswith("integrations/ebpf_dcstat.md")}
        self.assertEqual(len(routes), 3)
        retained = {entry["route"] for entry in result["retained"]}
        for route in routes:
            self.assertTrue(route in result["resolved"] or route in retained, route)

    def test_retired_energomera_routes_resolve_to_generic_prometheus_collector(self):
        prometheus_source = (
            "https://github.com/netdata/netdata/blob/master/"
            "src/go/plugin/go.d/collector/prometheus/README.md"
        )
        prometheus_route = (
            "/docs/collecting-metrics/collectors/applications/prometheus-endpoint"
        )
        routes = {
            "/docs/data-collection/iot-devices/energomera-smart-power-meters",
            "/docs/collecting-metrics/iot-devices/energomera-smart-power-meters",
            "/docs/collecting-metrics/hardware-and-iot/energomera-smart-power-meters",
            "/docs/collecting-metrics/hardware-and-sensors/energomera-smart-power-meters",
        }
        self.assertEqual({self.catalogue[route] for route in routes}, {prometheus_source})
        result = self.gate()
        for route in routes:
            self.assertIn(route, result["resolved"])
            self.assertEqual(result["resolved"][route], prometheus_route)

        merged = redirects.combineDictsOverwrite(
            redirects.readRedirectsFromFile(str(REPO_ROOT / "netlify.toml")),
            result["resolved"],
        )
        for route in routes:
            self.assertEqual(merged[route], prometheus_route)

    def test_policy_retirements_are_complete_and_match_the_catalogue(self):
        retirements = self.policy["legacy_catalogue_retirements"]
        self.assertTrue(retirements)
        seen = set()
        for entry in retirements:
            for field in redirects.RETIREMENT_FIELDS:
                self.assertTrue(entry.get(field), f"{entry.get('route')} lacks {field}")
            self.assertIsInstance(entry["evidence"], list)
            datetime.date.fromisoformat(entry["reviewed"])
            route = redirects._normalize_route(entry["route"])
            self.assertNotIn(route, seen)
            seen.add(route)
            self.assertEqual(self.catalogue.get(entry["route"]), entry["source"], entry["route"])
        self.assertEqual(
            len(redirects.read_legacy_catalogue_retirements(str(REPO_ROOT / "config/redirect-policy.json"))),
            len(retirements),
        )


if __name__ == "__main__":
    unittest.main()
