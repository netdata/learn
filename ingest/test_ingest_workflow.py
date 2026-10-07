import importlib.util
import os
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

import yaml


INGEST_DIR = Path(__file__).resolve().parent
WORKFLOW = INGEST_DIR.parent / ".github" / "workflows" / "ingest.yml"
spec = importlib.util.spec_from_file_location(
    "classify_ingest_result", INGEST_DIR / "classify_ingest_result.py"
)
classifier = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(classifier)


def recovery_snapshot_function():
    """Return the snapshot_generated_outputs function of the workflow's recovery step."""
    workflow = yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))
    for job in workflow["jobs"].values():
        for step in job.get("steps", []):
            if step.get("name") == "Verify generated recovery state":
                return re.search(
                    r"^snapshot_generated_outputs\(\) \{\n.*?^\}\n", step["run"], re.M | re.S
                ).group(0)
    raise AssertionError("the ingest workflow has no recovery step")


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


@unittest.skipUnless(shutil.which("bash") and shutil.which("sha256sum"), "needs bash and sha256sum")
class RecoverySnapshotTests(unittest.TestCase):
    FIXED = [
        "docs/Page.mdx",
        "ingest/generated_map.yaml",
        "ingest/generated_sidebar_order.json",
        "ingest/generated_sidebar_order.json.sha256",
        "netlify.toml",
    ]

    def hashed_paths(self, llms_files):
        with tempfile.TemporaryDirectory() as work, tempfile.TemporaryDirectory() as runner:
            root = Path(work)
            for name in self.FIXED + ["static/robots.txt"] + llms_files:
                (root / name).parent.mkdir(parents=True, exist_ok=True)
                (root / name).write_text(name)
            result = subprocess.run(
                ["bash", "-c", f"set -o pipefail\n{recovery_snapshot_function()}snapshot_generated_outputs"],
                cwd=root,
                env={**os.environ, "RUNNER_TEMP": runner},
                capture_output=True,
                text=True,
            )
        self.assertEqual(result.returncode, 0, result.stderr)
        return sorted(line.split(maxsplit=1)[1] for line in result.stdout.splitlines())

    def test_hashes_the_llms_files_when_present(self):
        llms_files = ["static/llms-full.txt", "static/llms.txt"]
        self.assertEqual(self.hashed_paths(llms_files), sorted(self.FIXED + llms_files))

    def test_runs_before_the_llms_files_are_first_generated(self):
        self.assertEqual(self.hashed_paths([]), sorted(self.FIXED))


if __name__ == "__main__":
    unittest.main()
