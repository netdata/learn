const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const vendor = path.join(root, 'scripts', 'site-build-gate');
const gate = path.join(vendor, 'site_build_gate.mjs');

const expectedManifest = {
  schema: 'netdata-site-build-gate-vendor-v2',
  contract: 'netdata-site-build-gate-v1',
  ruleset_version: 8,
  node_major: 22,
  artifacts: [
    {
      path: 'package-lock.json',
      sha256: '97fc9775c2560a176c703761fbbd54a455e46eefab543917943b59c1f55806d9',
    },
    {
      path: 'package.json',
      sha256: '6c0295092c0f51a67e2382c5538c018a1e0ec45c7bb7b0eb85d21a60f8e8d430',
    },
    {
      path: 'site_build_gate.mjs',
      sha256: 'eeca6581f309f0c1545d9ce4cc9ef21c4c7d9929b3748bf19db480d602230778',
    },
  ],
};

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function writeFixture(directory, sitemap, html) {
  fs.writeFileSync(path.join(directory, 'sitemap.xml'), sitemap);
  fs.writeFileSync(path.join(directory, 'index.html'), html);
}

test('the site vendors the exact accepted ruleset-v8 bundle', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(vendor, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest, expectedManifest);
  for (const artifact of manifest.artifacts) {
    assert.equal(sha256(path.join(vendor, artifact.path)), artifact.sha256);
  }
});

test('every Netlify context runs the clean-installed gate after Docusaurus', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const command = packageJson.scripts['build:netlify'];
  const install = 'npm ci --prefix scripts/site-build-gate --ignore-scripts --no-audit';
  const build = 'docusaurus build';
  const gateCommand = 'node scripts/site-build-gate/site_build_gate.mjs --build-dir build ' +
    '--site-origin https://learn.netdata.cloud --baseline config/site-build-gate-baseline.json';
  assert.match(command, new RegExp(install));
  assert.ok(command.indexOf(install) < command.indexOf(build));
  assert.ok(command.indexOf(build) < command.indexOf(gateCommand));

  for (const filename of ['static.toml', 'netlify.toml']) {
    const netlify = fs.readFileSync(path.join(root, filename), 'utf8');
    const commands = [...netlify.matchAll(/^\s*command = "([^"]+)"$/gm)].map((match) => match[1]);
    assert.deepEqual(commands, ['npm run build:netlify']);
    assert.doesNotMatch(netlify, /^\[context\./m);
  }
});

test('the vendored gate fails closed on a rendered defect without changing output', (t) => {
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

test('the vendored gate reports malformed build input as a contract error', (t) => {
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
