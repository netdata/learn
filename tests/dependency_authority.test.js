const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const expectedResolutions = {
  '**/@11ty/gray-matter/js-yaml': '4.3.1',
  '**/@docusaurus/plugin-content-docs/js-yaml': '4.3.1',
  '**/@docusaurus/utils-validation/js-yaml': '4.3.1',
  '**/@docusaurus/utils/js-yaml': '4.3.1',
  '**/cosmiconfig/js-yaml': '4.3.1',
  '**/gray-matter/js-yaml': '3.15.1',
  '**/http-proxy-middleware': '2.0.10',
  '**/joi': '17.13.6',
  '**/nanoid': '3.3.18',
  '**/svgo': '3.3.4',
};

function getUpdateBlock(dependabot, ecosystem) {
  const starts = [...dependabot.matchAll(/^[ \t]*-[ \t]*package-ecosystem:[ \t]*([^\s#]+)[ \t]*$/gm)];
  const matchingBlocks = starts
    .map((match, index) => ({
      ecosystem: match[1],
      contents: dependabot.slice(match.index, starts[index + 1]?.index),
    }))
    .filter((block) => block.ecosystem === ecosystem);

  assert.equal(matchingBlocks.length, 1, `expected one ${ecosystem} Dependabot update block`);
  return matchingBlocks[0].contents;
}

function assertRootScopedUpdateBlock(dependabot, ecosystem) {
  const block = getUpdateBlock(dependabot, ecosystem);
  assert.match(block, /^[ \t]*directory:[ \t]*\/[ \t]*$/m, `${ecosystem} must be scoped to the root directory`);
}

test('uses one root Yarn authority and isolates owner-controlled npm vendors', () => {
  const packageJson = require('../package.json');
  assert.equal(packageJson.packageManager, 'yarn@1.22.22');
  assert.deepEqual(packageJson.resolutions, expectedResolutions);
  assert.equal(fs.existsSync(path.join(root, 'yarn.lock')), true);
  assert.equal(fs.existsSync(path.join(root, 'package-lock.json')), false);
  assert.equal(fs.existsSync(path.join(root, 'scripts/site-build-gate/package-lock.json')), true);

  const dependabot = fs.readFileSync(path.join(root, '.github/dependabot.yml'), 'utf8');
  assertRootScopedUpdateBlock(dependabot, 'npm');
  assertRootScopedUpdateBlock(dependabot, 'github-actions');
  assert.doesNotMatch(dependabot, /scripts\/site-build-gate/);

  assert.throws(
    () => assertRootScopedUpdateBlock(dependabot.replace('directory: /', 'directory: /packages'), 'npm'),
    /npm must be scoped to the root directory/,
  );
  assert.throws(
    () =>
      assertRootScopedUpdateBlock(
        dependabot.replace(
          'package-ecosystem: github-actions\n    directory: /',
          'package-ecosystem: github-actions\n    directory: /actions',
        ),
        'github-actions',
      ),
    /github-actions must be scoped to the root directory/,
  );
});
