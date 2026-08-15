import importlib.util
import unittest
from pathlib import Path


INGEST_DIR = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location(
    "classify_ingest_result", INGEST_DIR / "classify_ingest_result.py"
)
classifier = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(classifier)


class IngestWorkflowClassificationTests(unittest.TestCase):
    def test_accepts_completed_success(self):
        output = f"work\n{classifier.SUCCESS_MARKER}\n"
        self.assertEqual(classifier.classify_result(0, output), "success")

    def test_accepts_completed_broken_link_run(self):
        output = (
            f"work\n{classifier.BROKEN_LINK_MARKER}\n"
            f"{classifier.BROKEN_LINK_REASON}\n"
        )
        self.assertEqual(classifier.classify_result(1, output), "broken_links")

    def test_rejects_operational_crash_with_exit_one(self):
        output = "Traceback (most recent call last):\nUnsafeFilesystemPathError\n"
        with self.assertRaises(classifier.IncompleteIngestError):
            classifier.classify_result(1, output)

    def test_rejects_success_without_completion_marker(self):
        with self.assertRaises(classifier.IncompleteIngestError):
            classifier.classify_result(0, "work stopped early\n")

    def test_rejects_conflicting_completion_markers(self):
        output = (
            f"{classifier.SUCCESS_MARKER}\n"
            f"{classifier.BROKEN_LINK_MARKER}\n"
            f"{classifier.BROKEN_LINK_REASON}\n"
        )
        with self.assertRaises(classifier.IncompleteIngestError):
            classifier.classify_result(1, output)

    def test_rejects_other_exit_codes(self):
        output = f"{classifier.SUCCESS_MARKER}\n"
        with self.assertRaises(classifier.IncompleteIngestError):
            classifier.classify_result(2, output)


if __name__ == "__main__":
    unittest.main()
