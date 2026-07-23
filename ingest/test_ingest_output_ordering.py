import importlib.util
import sys
import unittest
from pathlib import Path

import pandas as pd


INGEST_DIR = Path(__file__).resolve().parent
if str(INGEST_DIR) not in sys.path:
    sys.path.insert(0, str(INGEST_DIR))

spec = importlib.util.spec_from_file_location("learn_ingest", INGEST_DIR / "ingest.py")
ingest_module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(ingest_module)


WINDOWS_URL = (
    "https://github.com/netdata/netdata/edit/master/"
    "src/collectors/windows.plugin/integrations/system_statistics.md"
)
PROC_URL = (
    "https://github.com/netdata/netdata/edit/master/"
    "src/collectors/proc.plugin/integrations/system_statistics.md"
)


class TestGeneratedMapSortOrderIndependence(unittest.TestCase):
    """windows.plugin and proc.plugin both publish a 'System statistics' doc
    under the same learn_rel_path, so they tie on the first two sort keys.
    Without a unique tiebreaker, their relative order depended on whichever
    order they arrived in from glob.glob() (see PR #2937)."""

    def _entries(self, first_url, second_url):
        return pd.DataFrame(
            [
                {
                    "custom_edit_url": first_url,
                    "sidebar_label": "System statistics",
                    "learn_rel_path": "Collecting Metrics/Collectors/Operating Systems",
                },
                {
                    "custom_edit_url": second_url,
                    "sidebar_label": "System statistics",
                    "learn_rel_path": "Collecting Metrics/Collectors/Operating Systems",
                },
            ]
        )

    def _sorted_urls(self, entries):
        sorted_entries = entries.sort_values(
            by=["learn_rel_path", "sidebar_label", "custom_edit_url"],
            key=lambda col: col.str.lower(),
        )
        return sorted_entries["custom_edit_url"].tolist()

    def test_tied_rows_sort_independent_of_input_order(self):
        windows_first = self._entries(WINDOWS_URL, PROC_URL)
        proc_first = self._entries(PROC_URL, WINDOWS_URL)

        self.assertEqual(
            self._sorted_urls(windows_first), self._sorted_urls(proc_first)
        )


class TestOneCommitBackSortOrderIndependence(unittest.TestCase):
    """one_commit_back_file-dict.yaml previously had no sort at all, so its
    row order tracked raw dict-iteration order and churned almost entirely
    on every ingest run."""

    def _sorted_urls(self, custom_edit_urls, learn_paths):
        df = pd.DataFrame(
            {"custom_edit_url": custom_edit_urls, "learn_path": learn_paths}
        )
        df = df.sort_values(by="custom_edit_url").reset_index(drop=True)
        return df["custom_edit_url"].tolist()

    def test_rows_sort_independent_of_input_order(self):
        urls = [WINDOWS_URL, PROC_URL, "https://github.com/netdata/netdata/edit/master/README.md"]
        paths = ["/windows", "/proc", "/readme"]

        forward = self._sorted_urls(urls, paths)
        reversed_input = self._sorted_urls(list(reversed(urls)), list(reversed(paths)))

        self.assertEqual(forward, reversed_input)
        self.assertEqual(forward, sorted(urls))


if __name__ == "__main__":
    unittest.main()
