const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const installed = path.join(root, 'node_modules', '@netdata', 'site-build-gate');
const gate = path.join(installed, 'site_build_gate.mjs');

function writeFixture(directory, sitemap, html) {
  fs.writeFileSync(path.join(directory, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(directory, 'index.html'), html);
}

test('the installed gate major version is the baseline ruleset', () => {
  const {version} = JSON.parse(fs.readFileSync(path.join(installed, 'package.json'), 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(path.join(root, 'config', 'site-build-gate-baseline.json'), 'utf8'));
  assert.equal(Number.parseInt(version, 10), baseline.ruleset_version);
});

test('every Netlify context runs the installed gate after Docusaurus', async () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const command = packageJson.scripts['build:netlify'];
  const build = 'docusaurus build';
  const gateRunner = 'node scripts/run-post-build-gates.mjs';
  const {postBuildGateCommands} = await import('../scripts/run-post-build-gates.mjs');
  const gateCommand = postBuildGateCommands({generatedOutputReady: true}).find(
    ([script]) => script === 'node_modules/@netdata/site-build-gate/site_build_gate.mjs',
  );
  assert.deepEqual(gateCommand, [
    'node_modules/@netdata/site-build-gate/site_build_gate.mjs',
    '--build-dir', 'build',
    '--site-origin', 'https://learn.netdata.cloud',
    '--baseline', 'config/site-build-gate-baseline.json',
    '--integration-route-prefix', '/docs/collecting-metrics/collectors',
    '--format', 'json',
  ]);
  assert.ok(command.indexOf(build) < command.indexOf(gateRunner));

  for (const filename of ['static.toml', 'netlify.toml']) {
    const netlify = fs.readFileSync(path.join(root, filename), 'utf8');
    const commands = [...netlify.matchAll(/^\s*command = "([^"]+)"$/gm)].map((match) => match[1]);
    assert.deepEqual(commands, ['npm run build:netlify']);
    assert.doesNotMatch(netlify, /^\[context\./m);
  }
});

test('the installed gate fails closed on a rendered defect without changing output', (t) => {
  const build = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-site-gate-'));
  t.after(() => fs.rmSync(build, {recursive: true, force: true}));
  const sitemap = '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    '<url><loc>https://learn.netdata.cloud/</loc></url></urlset>';
  const html = '<!doctype html><html><head><meta name="description" content="Home"></head>' +
    '<body><h1>Home</h1></body></html>';
  writeFixture(build, sitemap, html);
  const before = new Map(fs.readdirSync(build).map((name) => [name, fs.readFileSync(path.join(build, name))]));

  const result = spawnSync(process.execPath, [
    gate,
    '--build-dir', build,
    '--site-origin', 'https://learn.netdata.cloud',
    '--format', 'json',
  ], {encoding: 'utf8'});

  assert.equal(result.status, 1, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.regressions.map((finding) => finding.rule), ['missing-title']);
  for (const [name, bytes] of before) {
    assert.deepEqual(fs.readFileSync(path.join(build, name)), bytes);
  }
});

test('the installed gate reports malformed build input as a contract error', (t) => {
  const build = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-site-gate-'));
  t.after(() => fs.rmSync(build, {recursive: true, force: true}));
  writeFixture(
    build,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url>',
    '<!doctype html><html><head><title>Home</title></head><body><h1>Home</h1></body></html>',
  );
  const result = spawnSync(process.execPath, [
    gate,
    '--build-dir', build,
    '--site-origin', 'https://learn.netdata.cloud',
  ], {encoding: 'utf8'});
  assert.equal(result.status, 2, result.stderr || result.stdout);
  assert.match(result.stderr, /contract error/);
});
