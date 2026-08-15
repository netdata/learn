import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../..');
const packageJson = require('../../package.json');
const docusaurus = require('../../docusaurus.config.js');

describe('shared deployment integrations', () => {
  it('runs the exact C8 bundle after every Netlify Docusaurus build', () => {
    const command = packageJson.scripts['build:netlify'];
    const install = 'npm ci --prefix scripts/site-build-gate --ignore-scripts --no-audit';
    const build = 'docusaurus build';
    const scan = [
      'node scripts/site-build-gate/site_build_gate.mjs',
      '--build-dir build',
      '--site-origin https://learn.netdata.cloud',
      '--baseline config/site-build-gate-baseline.json',
    ].join(' ');
    expect(command).toContain(install);
    expect(command).toContain(scan);
    expect(command.indexOf(install)).toBeLessThan(command.indexOf(build));
    expect(command.indexOf(build)).toBeLessThan(command.indexOf(scan));

    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, 'scripts/site-build-gate/manifest.json'), 'utf8'),
    );
    expect(manifest).toMatchObject({
      schema: 'netdata-site-build-gate-vendor-v2',
      contract: 'netdata-site-build-gate-v1',
      ruleset_version: 9,
      node_major: 22,
    });
  });

  it('pins the exact Yarn runtime without the deprecated Netlify selector', () => {
    expect(packageJson.packageManager).toBe('yarn@1.22.22');
    for (const relative of ['static.toml', 'netlify.toml']) {
      const config = fs.readFileSync(path.join(root, relative), 'utf8');
      expect(config).not.toContain('NETLIFY_USE_YARN');
      expect(config).toContain('NODE_VERSION = "22.14.0"');
      expect(config).toContain('NPM_VERSION = "10.9.2"');
    }
  });

  it('uses the complete website-owned IndexNow schema-2 contract', () => {
    const contract = require('../../plugins/netlify-plugin-indexnow/vendor-checksums.json');
    expect(contract).toMatchObject({
      schema_version: 2,
      owner: 'netdata/website',
      algorithm: 'sha256',
      dependencies: {'@netlify/blobs': '10.7.13', saxes: '6.0.0'},
      receipt_schema_version: 2,
      contract_tests_schema_version: 2,
    });
    expect(Object.keys(contract.files).sort()).toEqual([
      'contract-tests.json',
      'core.js',
      'index.js',
      'manifest.yml',
      'package.json',
      'receipt-schema.json',
    ]);
    expect(packageJson.dependencies).toMatchObject(contract.dependencies);
  });

  it('installs exactly one manual Cloudflare module beacon through shared configuration', () => {
    const beacons = docusaurus.scripts.filter(
      (script) => script.src === 'https://static.cloudflareinsights.com/beacon.min.js',
    );
    expect(beacons).toEqual([
      {
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        defer: true,
        type: 'module',
        'data-cf-beacon': '{"token":"7408c22ab930458a8467c91b5360b8f3"}',
      },
    ]);
    expect(beacons[0]).not.toHaveProperty('integrity');

    for (const relative of ['static/api.html', 'static/oauth2-redirect.html']) {
      const html = fs.readFileSync(path.join(root, relative), 'utf8');
      expect(html).not.toContain('static.cloudflareinsights.com');
      expect(html).not.toContain('7408c22ab930458a8467c91b5360b8f3');
    }
    expect(fs.existsSync(path.join(root, 'static/docs/ask-netdata/index.html'))).toBe(false);
  });
});
