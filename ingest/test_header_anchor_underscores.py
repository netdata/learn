import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


INGEST_DIR = Path(__file__).resolve().parent
if str(INGEST_DIR) not in sys.path:
    sys.path.insert(0, str(INGEST_DIR))

spec = importlib.util.spec_from_file_location("learn_ingest", INGEST_DIR / "ingest.py")
ingest_module = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(ingest_module)


class TestHeaderAnchorUnderscores(unittest.TestCase):
    """extract_headers_from_file() must not treat every underscore as removable
    markup. Per CommonMark, underscore emphasis can't start/end intraword, so a
    literal underscore inside a word (e.g. `fallback_type`) survives into the
    anchor the same way Docusaurus's real heading slugger keeps it, while an
    underscore genuinely used as an emphasis delimiter (e.g. `_italic_`) is
    still stripped."""

    def _write_md(self, content):
        tmp = tempfile.NamedTemporaryFile(
            mode="w", suffix=".md", delete=False, dir=self._tmp_dir.name
        )
        tmp.write(content)
        tmp.close()
        return tmp.name

    def setUp(self):
        self._tmp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self._tmp_dir.cleanup()

    def test_intraword_underscore_is_preserved_in_anchor(self):
        path = self._write_md("### `fallback_type`\n")
        headers = ingest_module.extract_headers_from_file(path)
        self.assertIn("fallback_type", headers)
        self.assertNotIn("fallbacktype", headers)

    def test_intraword_underscore_link_validates(self):
        path = self._write_md("### `fallback_type`\n")
        self.assertTrue(ingest_module.validate_header_in_file(path, "fallback_type"))

    def test_genuine_underscore_emphasis_is_stripped(self):
        path = self._write_md("### _italic phrase_\n")
        headers = ingest_module.extract_headers_from_file(path)
        self.assertIn("italic-phrase", headers)
        self.assertNotIn("_italic-phrase_", headers)

    def test_genuine_underscore_emphasis_link_validates(self):
        path = self._write_md("### _italic phrase_\n")
        self.assertTrue(ingest_module.validate_header_in_file(path, "italic-phrase"))

    def test_backtick_and_asterisk_still_stripped(self):
        path = self._write_md("### `match`\n\n### **bold**\n")
        headers = ingest_module.extract_headers_from_file(path)
        self.assertIn("match", headers)
        self.assertIn("bold", headers)


if __name__ == "__main__":
    unittest.main()
