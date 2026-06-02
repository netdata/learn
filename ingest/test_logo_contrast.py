import unittest
import sys
from pathlib import Path
import importlib.util

INGEST_DIR = Path(__file__).resolve().parent
if str(INGEST_DIR) not in sys.path:
    sys.path.insert(0, str(INGEST_DIR))

spec = importlib.util.spec_from_file_location("learn_ingest", INGEST_DIR / "ingest.py")
ingest_module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(ingest_module)


class TestLogoContrastHelpers(unittest.TestCase):
    def test_parse_css_color_hex(self):
        rgba = ingest_module._parse_css_color("#0C1724")
        self.assertIsNotNone(rgba)
        self.assertAlmostEqual(rgba[0], 12 / 255, places=4)
        self.assertAlmostEqual(rgba[1], 23 / 255, places=4)
        self.assertAlmostEqual(rgba[2], 36 / 255, places=4)
        self.assertEqual(rgba[3], 1.0)

    def test_classify_low_dark_only(self):
        # Dark icon blended on dark background should be low contrast.
        luminance = {"light": 0.05, "dark": 0.01, "confidence": "high"}
        result = ingest_module._classify_logo_by_luminance(luminance)
        self.assertEqual(result["dark"], "low")
        self.assertIn(result["light"], {"ok", "low"})

    def test_annotate_logo_tag_uses_cached_classification(self):
        url = "https://netdata.cloud/img/network.svg"
        ingest_module.LOGO_CACHE[url] = {
            "light": "ok",
            "dark": "low",
            "confidence": "medium",
        }
        body = f'<img src="{url}" width="150"/>'
        updated = ingest_module._annotate_integration_logo_tags(body)
        self.assertIn('data-integration-logo="true"', updated)
        self.assertIn('data-logo-contrast-dark="low"', updated)
        self.assertIn('data-logo-contrast-light="ok"', updated)


if __name__ == "__main__":
    unittest.main()
