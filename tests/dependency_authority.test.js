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

const expectedNpmVersionGroups = {
  'css-toolchain': ['"@tailwindcss/*"', 'tailwindcss', 'autoprefixer', 'postcss', '"postcss-*"'],
  'javascript-build-parser': ['"@babel/*"', 'acorn', 'dotenv', 'parse5', 'typescript', 'webpack'],
  'test-runtime': ['"@testing-library/*"', '"@vitejs/*"', '"@vitest/*"', 'happy-dom', 'jsdom', 'vite', 'vitest'],
  'browser-runtime': ['"@types/react"', 'axios', 'mermaid', 'react', 'react-dom', 'react-inlinesvg'],
  'docusaurus-renderer': [
    '"@docusaurus/*"',
    '"@easyops-cn/docusaurus-search-local"',
    '"@mdx-js/*"',
    'posthog-docusaurus',
  ],
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

function assertScopedUpdateBlock(dependabot, ecosystem, directory) {
  const block = getUpdateBlock(dependabot, ecosystem);
  const escapedDirectory = directory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(
    block,
    new RegExp(`^[ \\t]*directory:[ \\t]*${escapedDirectory}[ \\t]*$`, 'm'),
    `${ecosystem} must be scoped to ${directory}`,
  );
}

function getVersionGroup(updateBlock, groupName) {
  const matchingGroups = getVersionGroups(updateBlock)
    .filter((group) => group.name === groupName);

  assert.equal(matchingGroups.length, 1, `expected one ${groupName} update group`);
  return matchingGroups[0].contents;
}

function getVersionGroups(updateBlock) {
  const starts = [...updateBlock.matchAll(
    /^ {6}(?:(["'])([A-Za-z](?:[A-Za-z_|-]*[A-Za-z])?)\1|([A-Za-z](?:[A-Za-z_|-]*[A-Za-z])?)):\s*$/gm,
  )];
  return starts
    .map((match, index) => ({
      name: match[2] ?? match[3],
      contents: updateBlock.slice(match.index, starts[index + 1]?.index),
    }));
}

function getGroupList(group, key) {
  const starts = [...group.matchAll(/^ {8}([a-z][a-z-]*):(?:\s+.*)?$/gm)];
  const matchingLists = starts
    .map((match, index) => ({
      key: match[1],
      contents: group.slice(match.index, starts[index + 1]?.index),
    }))
    .filter((list) => list.key === key);

  assert.equal(matchingLists.length, 1, `expected one ${key} list`);
  return [...matchingLists[0].contents.matchAll(/^ {10}- (.+)$/gm)].map((match) => match[1]);
}

function assertNpmVersionGroups(dependabot) {
  const npmBlock = getUpdateBlock(dependabot, 'npm');
  const groups = getVersionGroups(npmBlock);
  assert.deepEqual(
    groups.map((group) => group.name).sort(),
    Object.keys(expectedNpmVersionGroups).sort(),
    'npm update groups must match the approved validation surfaces',
  );
  for (const [groupName, patterns] of Object.entries(expectedNpmVersionGroups)) {
    const group = getVersionGroup(npmBlock, groupName);
    assert.match(group, /^ {8}applies-to: version-updates$/m, `${groupName} must exclude security updates`);
    assert.match(group, /^ {8}update-types:\n {10}- minor\n {10}- patch$/m, `${groupName} must leave majors separate`);
    assert.deepEqual(
      getGroupList(group, 'patterns').sort(),
      [...patterns].sort(),
      `${groupName} patterns must match its approved validation surface`,
    );
  }
  assert.doesNotMatch(npmBlock, /swagger-ui/, 'Swagger UI must retain its independent vendor validation');
}

function assertCompatibleVersionGroup(updateBlock, groupName) {
  const groups = getVersionGroups(updateBlock);
  assert.deepEqual(
    groups.map((group) => group.name),
    [groupName],
    `${groupName} must be the only update group`,
  );
  const group = getVersionGroup(updateBlock, groupName);
  assert.match(group, /^ {8}applies-to: version-updates$/m, `${groupName} must exclude security updates`);
  assert.deepEqual(getGroupList(group, 'patterns'), ['"*"'], `${groupName} must cover its whole ecosystem`);
  assert.match(group, /^ {8}update-types:\n {10}- minor\n {10}- patch$/m, `${groupName} must leave majors separate`);
}

test('uses one root Yarn authority and isolates owner-controlled npm vendors', () => {
  const packageJson = require('../package.json');
  assert.equal(packageJson.packageManager, 'yarn@1.22.22');
  assert.deepEqual(packageJson.resolutions, expectedResolutions);
  assert.equal(fs.existsSync(path.join(root, 'yarn.lock')), true);
  assert.equal(fs.existsSync(path.join(root, 'package-lock.json')), false);
  assert.equal(fs.existsSync(path.join(root, 'scripts/site-build-gate/package-lock.json')), true);

  const dependabot = fs.readFileSync(path.join(root, '.github/dependabot.yml'), 'utf8');
  assertScopedUpdateBlock(dependabot, 'npm', '/');
  assertScopedUpdateBlock(dependabot, 'github-actions', '/');
  assertScopedUpdateBlock(dependabot, 'pip', '"/.learn_environment"');
  assert.doesNotMatch(dependabot, /scripts\/site-build-gate/);

  assert.throws(
    () => assertScopedUpdateBlock(dependabot.replace('directory: /', 'directory: /packages'), 'npm', '/'),
    /npm must be scoped to \//,
  );
  assert.throws(
    () =>
      assertScopedUpdateBlock(
        dependabot.replace(
          'package-ecosystem: github-actions\n    directory: /',
          'package-ecosystem: github-actions\n    directory: /actions',
        ),
        'github-actions',
        '/',
      ),
    /github-actions must be scoped to \//,
  );
});

test('groups only compatible version updates by validation surface', () => {
  const dependabot = fs.readFileSync(path.join(root, '.github/dependabot.yml'), 'utf8');
  assertNpmVersionGroups(dependabot);

  assert.throws(
    () => assertNpmVersionGroups(dependabot.replace('- patch', '- major')),
    /must leave majors separate/,
  );
  assert.throws(
    () =>
      assertNpmVersionGroups(
        dependabot.replace('          - "@tailwindcss/*"', '          - "@tailwindcss/*"\n          - "*"'),
      ),
    /css-toolchain patterns must match its approved validation surface/,
  );
  assert.throws(
    () =>
      assertNpmVersionGroups(
        dependabot.replace(
          '      css-toolchain:',
          '      "unapproved_group":\n        applies-to: version-updates\n        patterns:\n          - unapproved\n        update-types:\n          - minor\n          - patch\n      css-toolchain:',
        ),
      ),
    /npm update groups must match the approved validation surfaces/,
  );
});

test('groups compatible Actions and Python updates without absorbing security fixes or majors', () => {
  const dependabot = fs.readFileSync(path.join(root, '.github/dependabot.yml'), 'utf8');
  const actionsBlock = getUpdateBlock(dependabot, 'github-actions');
  const pythonBlock = getUpdateBlock(dependabot, 'pip');

  assertCompatibleVersionGroup(actionsBlock, 'compatible-actions');
  assertCompatibleVersionGroup(pythonBlock, 'compatible-python');

  assert.throws(
    () => assertCompatibleVersionGroup(actionsBlock.replace('- patch', '- major'), 'compatible-actions'),
    /must leave majors separate/,
  );
  assert.throws(
    () =>
      assertCompatibleVersionGroup(
        pythonBlock.replace('applies-to: version-updates', 'applies-to: security-updates'),
        'compatible-python',
      ),
    /must exclude security updates/,
  );
  assert.throws(
    () =>
      assertCompatibleVersionGroup(
        actionsBlock.replace(
          '      compatible-actions:',
          '      selective_actions:\n        applies-to: version-updates\n        patterns:\n          - "actions/*"\n        update-types:\n          - minor\n          - patch\n      compatible-actions:',
        ),
        'compatible-actions',
      ),
    /compatible-actions must be the only update group/,
  );
});
