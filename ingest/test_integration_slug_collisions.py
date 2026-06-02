import importlib.util
import sys
import unittest
from pathlib import Path


INGEST_DIR = Path(__file__).resolve().parent
if str(INGEST_DIR) not in sys.path:
    sys.path.insert(0, str(INGEST_DIR))

spec = importlib.util.spec_from_file_location("learn_ingest", INGEST_DIR / "ingest.py")
ingest_module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(ingest_module)


class TestIntegrationSlugCollisions(unittest.TestCase):
    def setUp(self):
        self.original_docs_prefix = ingest_module.DOCS_PREFIX
        ingest_module.DOCS_PREFIX = "docs"

    def tearDown(self):
        ingest_module.DOCS_PREFIX = self.original_docs_prefix

    def _publish_info(self, custom_edit_url, label="System statistics"):
        metadata = {
            "custom_edit_url": custom_edit_url,
            "sidebar_label": label,
            "learn_rel_path": "Collecting Metrics/Operating Systems",
        }
        learn_path, slug = ingest_module.create_mdx_path_from_metadata(metadata)
        return {"metadata": metadata, "learnPath": learn_path, "slug": slug}

    def test_unique_integration_keeps_existing_path(self):
        publish_map = {
            "proc.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/proc.plugin/integrations/system_statistics.md"
            )
        }

        ingest_module.resolve_publish_path_collisions(publish_map)

        self.assertEqual(
            publish_map["proc.md"]["learnPath"],
            "docs/Collecting Metrics/Operating Systems/System statistics.mdx",
        )
        self.assertEqual(
            publish_map["proc.md"]["slug"],
            "/collecting-metrics/operating-systems/system-statistics",
        )

    def test_duplicate_integration_label_gets_source_suffix(self):
        publish_map = {
            "windows.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/windows.plugin/integrations/system_statistics.md"
            ),
            "proc.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/proc.plugin/integrations/system_statistics.md"
            ),
        }

        ingest_module.resolve_publish_path_collisions(publish_map)

        self.assertEqual(
            publish_map["proc.md"]["slug"],
            "/collecting-metrics/operating-systems/system-statistics",
        )
        self.assertEqual(
            publish_map["windows.md"]["slug"],
            "/collecting-metrics/operating-systems/system-statistics-windows-plugin",
        )
        self.assertNotEqual(
            publish_map["windows.md"]["learnPath"],
            publish_map["proc.md"]["learnPath"],
        )

    def test_source_suffix_avoids_existing_page_path(self):
        publish_map = {
            "windows.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/windows.plugin/integrations/system_statistics.md"
            ),
            "proc.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/proc.plugin/integrations/system_statistics.md"
            ),
            "existing.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/other.plugin/integrations/other.md",
                label="System statistics windows plugin",
            ),
        }

        ingest_module.resolve_publish_path_collisions(publish_map)

        self.assertEqual(
            publish_map["windows.md"]["slug"],
            "/collecting-metrics/operating-systems/system-statistics-windows-plugin-2",
        )
        self.assertNotEqual(
            publish_map["windows.md"]["learnPath"],
            publish_map["existing.md"]["learnPath"],
        )

    def test_slug_only_collision_gets_source_suffix(self):
        publish_map = {
            "punctuation.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/windows.plugin/integrations/system_statistics.md",
                label="System-statistics",
            ),
            "space.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/src/collectors/proc.plugin/integrations/system_statistics.md",
                label="System statistics",
            ),
        }

        self.assertNotEqual(
            publish_map["punctuation.md"]["learnPath"],
            publish_map["space.md"]["learnPath"],
        )
        self.assertEqual(
            publish_map["punctuation.md"]["slug"],
            publish_map["space.md"]["slug"],
        )

        ingest_module.resolve_publish_path_collisions(publish_map)

        self.assertEqual(
            publish_map["space.md"]["slug"],
            "/collecting-metrics/operating-systems/system-statistics",
        )
        self.assertEqual(
            publish_map["punctuation.md"]["slug"],
            "/collecting-metrics/operating-systems/system-statistics-windows-plugin",
        )

    def test_non_integration_exact_collision_fails(self):
        publish_map = {
            "first.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/docs/system-statistics.md"
            ),
            "second.md": self._publish_info(
                "https://github.com/netdata/netdata/edit/master/docs/other-system-statistics.md"
            ),
        }

        with self.assertRaises(ValueError) as context:
            ingest_module.resolve_publish_path_collisions(publish_map)

        self.assertIn("non-integration", str(context.exception))


if __name__ == "__main__":
    unittest.main()
