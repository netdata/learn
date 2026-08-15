import importlib.util
import tempfile
import unittest
from pathlib import Path


INGEST_DIR = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("learn_ingest", INGEST_DIR / "ingest.py")
ingest = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(ingest)


class IngestDirectoryTraversalTests(unittest.TestCase):
    def test_child_directories_exclude_files_and_are_sorted(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "Zulu").mkdir()
            (root / "Alpha").mkdir()
            (root / "Page.mdx").write_text("# Page\n", encoding="utf-8")

            self.assertEqual(
                [path.name for path in ingest._child_directories(root)],
                ["Alpha", "Zulu"],
            )

    def test_child_directories_reject_directory_symlinks(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            outside = root / "outside"
            outside.mkdir()
            docs = root / "docs"
            docs.mkdir()
            (docs / "Linked").symlink_to(outside, target_is_directory=True)

            with self.assertRaisesRegex(
                ingest.UnsafeFilesystemPathError, "symbolic link"
            ):
                ingest._child_directories(docs)


if __name__ == "__main__":
    unittest.main()
