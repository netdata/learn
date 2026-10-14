import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

import {postBuildGateCommands} from '../../scripts/run-post-build-gates.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../..');
const packageJson = require('../../package.json');
const docusaurus = require('../../docusaurus.config.js');

describe('shared deployment integrations', () => {
  it('runs the installed C8 gate after generated output activates strict gates', () => {
    const command = packageJson.scripts['build:netlify'];
    const build = 'docusaurus build';
    const gateRunner = 'node scripts/run-post-build-gates.mjs';
    const scan = postBuildGateCommands({generatedOutputReady: true}).find(
      ([script]) => script === 'node_modules/@netdata/site-build-gate/site_build_gate.mjs',
    );
    expect(scan).toEqual([
      'node_modules/@netdata/site-build-gate/site_build_gate.mjs',
      '--build-dir',
      'build',
      '--site-origin',
      'https://learn.netdata.cloud',
      '--baseline',
      'config/site-build-gate-baseline.json',
      '--integration-route-prefix',
      '/docs/collecting-metrics/collectors',
      '--format',
      'json',
    ]);
    expect(command).toContain(gateRunner);
    expect(command.indexOf(build)).toBeLessThan(command.indexOf(gateRunner));
  });

  it('pins the exact Yarn runtime without the deprecated Netlify selector', () => {
    expect(packageJson.packageManager).toBe('yarn@1.22.22');
    for (const relative of ['static.toml', 'netlify.toml']) {
      const config = fs.readFileSync(path.join(root, relative), 'utf8');
      expect(config).not.toContain('NETLIFY_USE_YARN');
      expect(config).toContain('NODE_VERSION = "22.23.3"');
      expect(config).toContain('NPM_VERSION = "10.9.9"');
    }
  });

  it('aligns the development container with the pinned production Node runtime', () => {
    const devcontainer = JSON.parse(
      fs.readFileSync(path.join(root, '.devcontainer/devcontainer.json'), 'utf8'),
    );
    expect(devcontainer.image).toBe('node:22.23.3');
  });

  it('uses the stable Docusaurus Faster engine within the Netlify memory bound', () => {
    expect(packageJson.devDependencies['@docusaurus/faster']).toBe('3.10.2');
    expect(packageJson.dependencies['@easyops-cn/docusaurus-search-local']).toBe('0.55.3');
    expect(packageJson.dependencies).not.toHaveProperty('@docusaurus/plugin-client-redirects');
    expect(docusaurus.future?.faster).toEqual({
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      rspackBundler: true,
      rspackPersistentCache: false,
      ssgWorkerThreads: false,
      mdxCrossCompilerCache: true,
      gitEagerVcs: true,
    });

    for (const relative of ['static.toml', 'netlify.toml']) {
      const config = fs.readFileSync(path.join(root, relative), 'utf8');
      expect(config).toContain('NODE_OPTIONS = "--max-old-space-size=3072"');
      expect(config).toContain('DOCUSAURUS_SSR_CONCURRENCY = "4"');
    }
  });

  it('keeps the root redirect-only and forces logo clicks through Netlify', () => {
    expect(fs.existsSync(path.join(root, 'src/pages/index.js'))).toBe(false);
    expect(docusaurus.themeConfig.navbar.logo.href).toBe('pathname:///');
    expect(docusaurus.themeConfig.navbar.logo.target).toBe('_self');
  });

  it('installs the website-owned IndexNow schema-2 plugin from npm', () => {
    const plugin = '@netdata/netlify-plugin-indexnow';
    expect(packageJson.devDependencies).toHaveProperty(plugin);
    for (const relative of ['static.toml', 'netlify.toml']) {
      const config = fs.readFileSync(path.join(root, relative), 'utf8');
      expect(config).toContain(`package = "${plugin}"`);
    }
    expect(require(`${plugin}/contract-tests.json`)).toMatchObject({
      schema_version: 2,
      receipt_schema_version: 2,
    });
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
        'data-cf-beacon': '{"token":"7408c22ab930458a8467c91b5360b8f3","send":{"to":"/cdn-cgi/rum"}}',
      },
    ]);
    expect(beacons[0]).not.toHaveProperty('integrity');

    const api = fs.readFileSync(path.join(root, 'static/api.html'), 'utf8');
    expect(api).not.toContain('static.cloudflareinsights.com');
    expect(api).not.toContain('7408c22ab930458a8467c91b5360b8f3');
    expect(fs.existsSync(path.join(root, 'static/docs/ask-netdata/index.html'))).toBe(false);
  });
});
