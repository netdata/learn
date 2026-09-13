import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const config = require('../docusaurus.config.js');
const posthogPlugin = require('posthog-docusaurus');

test('Learn navbar carries internal campaign tags without a first-touch envelope', () => {
  const appLinks = config.themeConfig.navbar.items.filter((item) =>
    (item.href || item.to || '').startsWith('https://app.netdata.cloud'),
  );
  assert.equal(appLinks.length, 2);
  for (const item of appLinks) {
    const url = new URL(item.href || item.to);
    assert.equal(url.searchParams.get('utm_source'), 'learn');
    assert.equal(url.searchParams.has('nd_ft'), false);
    assert.deepEqual([...url.searchParams.keys()].sort(), ['utm_content', 'utm_source']);
  }
});

test('the installed PostHog plugin generates an asynchronous stub without a synchronous identity reader', () => {
  assert.equal(require('posthog-docusaurus/package.json').version, '2.0.5');
  const options = config.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'posthog-docusaurus')[1];
  const plugin = posthogPlugin({}, { ...options, enableInDevelopment: true });
  const script = plugin.injectHtmlTags().headTags.find((tag) => tag.tagName === 'script').innerHTML;
  const inserted = [];
  const context = {
    document: {
      createElement: () => ({}),
      getElementsByTagName: () => [{ parentNode: { insertBefore: (element) => inserted.push(element) } }],
    },
  };
  context.window = context;
  vm.runInNewContext(script, context);

  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].src, 'https://app.posthog.com/static/array.js');
  assert.equal(inserted[0].async, true);
  assert.equal(context.posthog._i[0][0], options.apiKey);
  assert.equal(context.posthog.get_distinct_id, undefined);
  assert.equal(typeof context.posthog.capture, 'function');
  assert.equal(context.posthog.has_opted_out_capturing(), undefined);
});

test('the installed PostHog route module captures pageviews without producing first-touch cookies', () => {
  const plugin = posthogPlugin({}, { apiKey: 'phc_synthetic', enableInDevelopment: true });
  const filename = require.resolve(plugin.getClientModules()[0]);
  const module = readFileSync(filename, 'utf8')
    .replace("import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';", '')
    .replace('export default', 'globalThis.lifecycle =');
  const events = [];
  const writes = [];
  const document = {};
  Object.defineProperty(document, 'cookie', {
    get: () => '',
    set: (value) => writes.push(value),
  });
  const context = {
    ExecutionEnvironment: { canUseDOM: true },
    document,
    window: { document, posthog: { capture: (event) => events.push(event) } },
  };
  vm.runInNewContext(module, context, { filename });
  context.lifecycle.onRouteUpdate({ location: { pathname: '/docs/first' }, previousLocation: null });
  context.lifecycle.onRouteUpdate({
    location: { pathname: '/docs/second' }, previousLocation: { pathname: '/docs/first' },
  });
  context.lifecycle.onRouteUpdate({
    location: { pathname: '/docs/second', hash: '#heading' }, previousLocation: { pathname: '/docs/second' },
  });

  assert.deepEqual(events, ['$pageview', '$pageview']);
  assert.deepEqual(writes, []);
});

test('the installed plugin removes a loaded callback from configuration when serializing it', () => {
  const plugin = posthogPlugin({}, {
    apiKey: 'phc_synthetic', enableInDevelopment: true, loaded: function captureOriginIdentity() {},
  });
  const script = plugin.injectHtmlTags().headTags.find((tag) => tag.tagName === 'script').innerHTML;
  assert.equal(script.includes('captureOriginIdentity'), false);
  assert.equal(script.includes('"loaded"'), false);
});
