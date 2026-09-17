import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const config = require('../docusaurus.config.js');
const handoff = readFileSync(new URL('../static/js/first-touch-handoff.js', import.meta.url), 'utf8');
const producer = readFileSync(new URL('../static/js/first-touch.js', import.meta.url), 'utf8');
const token = config.plugins.find(item => Array.isArray(item) && item[0] === 'posthog-docusaurus')[1].apiKey;
const timestamp = () => new Date(Date.now() - 86400000).toISOString();
const entry = (extra = {}) => ({ surface: 'website', path: '/first', referrer: 'https://www.google.com/',
  utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: '', ts: timestamp(), ...extra });
const encoded = data => encodeURIComponent(JSON.stringify(data));

function browser(t, { cookie, referrer = 'https://www.google.com/search?q=netdata',
  url = 'https://learn.netdata.cloud/docs/first?utm_source=google&utm_medium=organic', before } = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body><a id="app" href="https://app.netdata.cloud/?utm_source=learn&utm_content=nav#keep">App</a></body></html>',
    { url, referrer, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  if (cookie !== undefined) window.document.cookie = `nd_first_touch=${cookie}; Path=/; Secure`;
  before?.(window);
  window.eval(handoff);
  window.eval(producer);
  return window;
}
const cookieValue = w => w.document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('nd_first_touch='))?.slice(15);
const cookieData = w => JSON.parse(decodeURIComponent(cookieValue(w)));
const carried = anchor => JSON.parse(new URL(anchor.href).searchParams.get('nd_ft'));
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const fixtures = JSON.parse(readFileSync(new URL('./fixtures/first-touch-handoff.json', import.meta.url), 'utf8'));

test('common Website/Learn projection fixtures preserve the whole-observation contract', t => {
  const w = browser(t);
  for (const fixture of fixtures.cases) {
    const input = JSON.stringify(fixture.input);
    const output = w.ndFirstTouchHandoff.project(input, Date.parse(fixtures.now));
    if (fixture.expected === null) assert.equal(output, null, fixture.name);
    else {
      assert.equal(output.version, 2, fixture.name);
      for (const [key, value] of Object.entries(fixture.expected)) assert.equal(output.entry[key], value, fixture.name);
      assert.equal(output.entry.ts, fixture.input.entry?.ts || fixture.input.ts, fixture.name);
      if (fixture.input.entry?.identities) assert.deepEqual(JSON.parse(JSON.stringify(output.entry.identities)), fixture.input.entry.identities, fixture.name);
      if (fixture.input.landing_page) assert.equal(output.landing_page, fixture.input.landing_page, fixture.name);
    }
    assert.equal(JSON.stringify(fixture.input), input, fixture.name);
  }
});

test('captures whole initial Learn observation without Website roots and decorates existing links', t => {
  const w = browser(t);
  const data = cookieData(w);
  assert.equal(data.version, 2);
  assert.equal(data.entry.surface, 'learn');
  assert.equal(data.entry.path, '/docs/first');
  assert.equal(data.entry.utm_source, 'google');
  assert.equal(data.entry.referrer, 'https://www.google.com/search?q=netdata');
  assert.equal(data.landing_page, undefined);
  assert.equal(data.entry.identities, undefined);
  const link = w.document.querySelector('#app');
  const output = carried(link);
  assert.equal(output.entry.referrer, 'https://www.google.com/search');
  assert.equal(output.entry.ts, data.entry.ts);
  assert.equal(new URL(link.href).searchParams.get('utm_source'), 'learn');
  assert.equal(new URL(link.href).hash, '#keep');
});

test('SPA routes, script reexecution, dynamic content and middle-click preserve original entry', async t => {
  const w = browser(t);
  const raw = cookieValue(w);
  w.history.pushState({}, '', '/docs/later?utm_source=internal');
  w.eval(producer);
  const link = w.document.createElement('a');
  link.href = 'https://app.netdata.cloud/sign-in?utm_content=dynamic';
  link.textContent = 'dynamic';
  w.document.body.append(link);
  await tick();
  assert.equal(carried(link).entry.path, '/docs/first');
  assert.equal(carried(link).entry.utm_source, 'google');
  link.dispatchEvent(new w.MouseEvent('auxclick', { bubbles: true, button: 1 }));
  assert.equal(cookieValue(w), raw);
  assert.equal(new URL(link.href).searchParams.getAll('nd_ft').length, 1);
  link.setAttribute('href', 'https://app.netdata.cloud/spaces/netdata-demo?utm_content=replaced');
  await tick();
  assert.equal(carried(link).entry.path, '/docs/first');
  assert.equal(new URL(link.href).searchParams.get('utm_content'), 'replaced');
});

test('preserves v1 storage bytes and transports Website roots without upgrading expiry', t => {
  const first = entry();
  const raw = encoded({ landing_page: first.path, referrer: first.referrer, ts: first.ts });
  const w = browser(t, { cookie: raw });
  assert.equal(cookieValue(w), raw);
  const output = carried(w.document.querySelector('#app'));
  assert.equal(output.entry.surface, 'website');
  assert.equal(output.entry.path, '/first');
  assert.equal(output.landing_page, '/first');
  assert.equal(output.ts, first.ts);
});

test('href mutations decorate anchors but leave resource links and SVG references untouched', async t => {
  const w = browser(t);
  for (const element of [w.document.createElement('link'),
    w.document.createElementNS('http://www.w3.org/2000/svg', 'use')]) {
    w.document.body.append(element);
    await tick();
    const href = 'https://app.netdata.cloud/resource?preserve=%20#asset';
    element.setAttribute('href', href);
    await tick();
    assert.equal(element.getAttribute('href'), href, element.tagName);
  }
  const anchor = w.document.querySelector('#app');
  anchor.setAttribute('href', 'https://app.netdata.cloud/sign-up?changed=1');
  await tick();
  assert.equal(carried(anchor).entry.path, '/docs/first');
});

test('preserves v2 observation, identities and original cookie expiry without any write', t => {
  const first = entry({ surface: 'community', path: '/t/example' });
  first.identities = [{ distinct_id: 'anonymous-test-id', project_token: 'public-test-token',
    surface: 'community', status: 'anonymous', observed_at: first.ts }];
  const raw = encoded({ version: 2, entry: first });
  const writes = [];
  const w = browser(t, { before(window) {
    Object.defineProperty(window.document, 'cookie', { get: () => `nd_first_touch=${raw}`, set: value => writes.push(value) });
  } });
  assert.deepEqual(writes, []);
  assert.deepEqual(carried(w.document.querySelector('#app')).entry, first);
});

for (const [label, raw] of [
  ['unsupported version', encoded({ version: 99, entry: entry() })],
  ['malformed value', '%broken'],
  ['future entry', encoded({ version: 2, entry: entry({ ts: '2099-01-01T00:00:00.000Z' }) })],
  ['expired entry', encoded({ version: 2, entry: entry({ ts: '2020-01-01T00:00:00.000Z' }) })],
  ['private sender', encoded({ version: 2, entry: entry({ referrer: 'http://192.168.1.1:19999/' }) })],
  ['oversized value', encoded({ version: 2, entry: entry({ utm_content: 'x'.repeat(4000) }) })],
  ['invalid root', encoded({ version: 2, entry: entry(), landing_page: '/later', ts: 'invalid' })],
]) test(`${label} remains untouched and is not replaced with invented evidence`, t => {
  const w = browser(t, { cookie: raw });
  assert.equal(cookieValue(w), raw);
  assert.equal(carried(w.document.querySelector('#app')), null);
});

test('refused writes retain initial document evidence; unreadable storage fails closed', t => {
  const w = browser(t, { before(window) {
    Object.defineProperty(window.document, 'cookie', { get: () => '', set: () => {} });
  } });
  assert.equal(cookieValue(w), undefined);
  assert.equal(carried(w.document.querySelector('#app')).entry.surface, 'learn');
  const blocked = browser(t, { before(window) {
    Object.defineProperty(window.document, 'cookie', { get: () => { throw new Error('denied'); } });
  } });
  assert.equal(carried(blocked.document.querySelector('#app')), null);
});

for (const kind of ['localStorage', 'cookie', 'sdk']) test(`${kind} opt-out prevents capture and handoff`, t => {
  const w = browser(t, { before(window) {
    if (kind === 'localStorage') window.localStorage.setItem(`__ph_opt_in_out_${token}`, '0');
    if (kind === 'cookie') window.document.cookie = `__ph_opt_in_out_${token}=0; Path=/`;
    if (kind === 'sdk') window.posthog = { __loaded: true, has_opted_out_capturing: () => true };
  } });
  assert.equal(cookieValue(w), undefined);
  assert.equal(carried(w.document.querySelector('#app')), null);
});

test('opting out after decoration restores the original href without changing the cookie', t => {
  const w = browser(t);
  const before = cookieValue(w);
  w.localStorage.setItem(`__ph_opt_in_out_${token}`, '0');
  w.ndLearnFirstTouch.refresh();
  assert.equal(carried(w.document.querySelector('#app')), null);
  assert.equal(cookieValue(w), before);
});

test('competing cookie writes cannot replace earlier document evidence or hide a tied conflict', t => {
  const first = entry({ surface: 'learn', path: '/original' });
  const w = browser(t, { cookie: encoded({ version: 2, entry: first }) });
  const later = { ...first, path: '/later', ts: new Date(Date.parse(first.ts) + 1000).toISOString() };
  w.document.cookie = `nd_first_touch=${encoded({ version: 2, entry: later })}; Path=/; Secure`;
  w.ndLearnFirstTouch.refresh();
  assert.equal(carried(w.document.querySelector('#app')).entry.path, '/original');
  const conflicting = { ...first, path: '/conflict' };
  w.document.cookie = `nd_first_touch=${encoded({ version: 2, entry: conflicting })}; Path=/; Secure`;
  w.ndLearnFirstTouch.refresh();
  assert.equal(carried(w.document.querySelector('#app')), null);
});

test('only exact App HTTPS links are eligible; preview and localhost do not capture', async t => {
  const w = browser(t);
  for (const href of ['http://app.netdata.cloud/', 'https://app.netdata.cloud.evil.example/',
    'https://user@app.netdata.cloud/', 'https://app.netdata.cloud:444/', '/docs/next']) {
    const a = w.document.createElement('a'); a.setAttribute('href', href); w.document.body.append(a);
    await tick();
    assert.equal(a.getAttribute('href'), href);
  }
  for (const url of ['http://localhost:3000/docs/a', 'https://deploy-preview-3079--learn.netlify.app/docs/a']) {
    const other = browser(t, { url });
    assert.equal(cookieValue(other), undefined);
    assert.equal(other.ndLearnFirstTouch, undefined);
  }
});

test('Docusaurus head and standalone API use the same synchronous scripts; OAuth utility does not', () => {
  const scripts = config.scripts.filter(item => item.src?.includes('first-touch'));
  assert.deepEqual(scripts.map(item => item.src), ['/js/first-touch-handoff.js', '/js/first-touch.js']);
  assert.ok(scripts.every(item => item.async === false && item.defer === false));
  const api = readFileSync(new URL('../static/api.html', import.meta.url), 'utf8');
  assert.ok(api.indexOf('first-touch-handoff.js') < api.indexOf('first-touch.js'));
  assert.ok(api.indexOf('first-touch.js') < api.indexOf('</head>'));
  assert.ok(!readFileSync(new URL('../static/oauth2-redirect.html', import.meta.url), 'utf8').includes('first-touch'));
});

test('preserves query bytes, fragments and existing envelopes, with a complete URL size cap', async t => {
  const w = browser(t);
  for (const prefix of ['https:', '']) {
    const a = w.document.createElement('a');
    const original = `${prefix}//app.netdata.cloud/sign-in?redirect_uri=a%20b&c=%2f+%2B#x%2fy`;
    a.setAttribute('href', original); w.document.body.append(a);
    await tick();
    assert.ok(a.href.includes('?redirect_uri=a%20b&c=%2f+%2B&nd_ft='));
    assert.ok(a.href.endsWith('#x%2fy'));
  }
  for (const original of ['https://app.netdata.cloud/?nd_ft=preserve-existing',
    `https://app.netdata.cloud/?long=${'x'.repeat(3700)}`]) {
    const a = w.document.createElement('a'); a.href = original; w.document.body.append(a);
    await tick();
    assert.equal(a.href, original);
  }
});
