import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIREMENTS_INPUT = ROOT / ".learn_environment" / "ingest-requirements.in"
REQUIREMENTS_LOCK = ROOT / ".learn_environment" / "ingest-requirements.txt"
WORKFLOWS = ROOT / ".github" / "workflows"


class IngestDependencyPolicyTests(unittest.TestCase):
    def test_python_lock_covers_each_direct_requirement_with_hashes(self):
        source = REQUIREMENTS_INPUT.read_text(encoding="utf-8")
        lock = REQUIREMENTS_LOCK.read_text(encoding="utf-8")

        self.assertIn("uv pip compile --generate-hashes --universal --python-version 3.13", lock)
        direct_requirements = [
            line.strip().lower()
            for line in source.splitlines()
            if line.strip() and not line.startswith("#")
        ]
        self.assertTrue(direct_requirements)

        lock_lines = lock.lower().splitlines()
        package_line = re.compile(r"^[a-z0-9_.-]+==")
        for requirement in direct_requirements:
            start = next(
                (index for index, line in enumerate(lock_lines) if line.startswith(requirement)),
                None,
            )
            self.assertIsNotNone(start, requirement)
            end = next(
                (
                    index
                    for index in range(start + 1, len(lock_lines))
                    if package_line.match(lock_lines[index])
                ),
                len(lock_lines),
            )
            self.assertIn("--hash=sha256:", "\n".join(lock_lines[start:end]), requirement)

    def test_active_workflows_pin_actions_and_install_the_hash_lock(self):
        expected_actions = {
            "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1",
            "actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0",
            "actions/setup-python@5fda3b95a4ea91299a34e894583c3862153e4b97 # v7.0.0",
            "actions/github-script@3a2844b7e9c422d3c10d287c895573f7108da1b3 # v9.0.0",
            "webfactory/ssh-agent@e83874834305fe9a4a2997156cb26c5de65a8555 # v0.10.0",
            "peter-evans/create-pull-request@5f6978faf089d4d20b00c7766989d076bb2fc7f1 # v8.1.1",
        }
        active_workflows = list(WORKFLOWS.glob("*.yml"))
        self.assertTrue(active_workflows)
        contents = "\n".join(path.read_text(encoding="utf-8") for path in active_workflows)

        for action in expected_actions:
            self.assertIn(action, contents)
        self.assertIsNone(re.search(r"^\s*uses:\s+[^@\s]+@v", contents, re.MULTILINE))
        self.assertEqual(contents.count('python-version: "3.13"'), 2)
        self.assertEqual(
            contents.count(
                "python -m pip install --require-hashes -r .learn_environment/ingest-requirements.txt"
            ),
            2,
        )


if __name__ == "__main__":
    unittest.main()
