import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  INVENTORY_SCHEMA,
  UnsafeTargetError,
  boundedResponseIsPartial,
  checkSameSite,
  classifyHttpStatus,
  fixedDestinationLookup,
  htmlRouteIdentity,
  inventoryRenderedSite,
  isNetdataHost,
  isPublicAddress,
  networkTargets,
  newlyIntroducedThirdParty,
  normalizeUrlPath,
  parseRedirectSources,
  probeTargets,
  probeUrl,
  redirectMatches,
  resolvePublicDestination,
  runWithLimits,
  validatePolicy,
} from '../scripts/link-integrity/check.mjs';

const temporaryDirectories = [];

function policy(siteOrigin = 'https://www.netdata.cloud') {
  return {
    schema: 'netdata-rendered-link-policy-v1',
    site_origin: siteOrigin,
    netdata_domain: 'netdata.cloud',
    opaque_fragment_hosts: ['app.netdata.cloud'],
    request: {
      concurrency: 4,
      per_host_concurrency: 2,
      timeout_ms: 2000,
      max_redirects: 3,
      max_body_bytes: 65536,
      user_agent: 'Netdata-Link-Integrity-Test/1.0',
    },
  };
}

function inventory({siteOrigin = 'https://www.netdata.cloud', links = [], invalid = []} = {}) {
  return {
    schema: INVENTORY_SCHEMA,
    site_origin: siteOrigin,
    html_files: 1,
    rendered_files: 1,
    file_routes: ['/index.html'],
    html_pages: [{source_route: '/', routes: ['/', '/index.html'], fragments: ['home']}],
    redirect_sources: ['/old/*'],
    links: links.map((url) => ({url, occurrences: 1, sources: ['/']})),
    invalid_links: invalid,
    unsupported_schemes: {},
  };
}

async function renderedFixture(files, redirects = '') {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'netdata-link-integrity-'));
  temporaryDirectories.push(root);
  const build = path.join(root, 'public');
  await fs.mkdir(build, {recursive: true});
  for (const [relative, contents] of Object.entries(files)) {
    const filename = path.join(build, relative);
    await fs.mkdir(path.dirname(filename), {recursive: true});
    await fs.writeFile(filename, contents);
  }
  const redirectsFilename = path.join(root, 'netlify.toml');
  await fs.writeFile(redirectsFilename, redirects);
  return {build, redirectsFilename};
}

test.afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) =>
    fs.rm(directory, {recursive: true, force: true})));
});

test('validates the bounded policy contract', () => {
  assert.equal(validatePolicy(policy()).site_origin, 'https://www.netdata.cloud');
  assert.throws(() => validatePolicy({...policy(), site_origin: 'http://www.netdata.cloud'}), /HTTPS origin/);
  assert.throws(() => validatePolicy({
    ...policy(),
    request: {...policy().request, concurrency: 100},
  }), /concurrency/);
});

test('maps Hugo and Docusaurus output paths to public route aliases', () => {
  assert.deepEqual(htmlRouteIdentity('index.html'), {
    source_route: '/', routes: ['/', '/index.html'],
  });
  assert.deepEqual(htmlRouteIdentity('docs/topic/index.html'), {
    source_route: '/docs/topic/',
    routes: ['/docs/topic', '/docs/topic/', '/docs/topic/index.html'],
  });
  assert.deepEqual(htmlRouteIdentity('api.html'), {
    source_route: '/api.html', routes: ['/api.html', '/api'],
  });
});

test('inventories parsed links, canonical relative semantics, fragments, files, and redirects', async () => {
  const fixture = await renderedFixture({
    'index.html': '<link rel="canonical" href="https://www.netdata.cloud/">' +
      '<a href="/guide/#part">Guide</a><a href="/old/value">Redirect</a>' +
      '<a href="mailto:docs@netdata.cloud">Mail</a>',
    'guide/index.html': '<link rel="canonical" href="https://www.netdata.cloud/guide/">' +
      '<h2 id="part">Part</h2><a name="legacy"></a><a href="../">Home</a>',
    'asset.pdf': 'fixture',
  }, '[[redirects]]\nfrom = "/old/*"\nto = "/guide/:splat"\n');
  const result = await inventoryRenderedSite({
    buildDirectory: fixture.build,
    redirectsFilename: fixture.redirectsFilename,
    policy: policy(),
  });
  assert.equal(result.html_files, 2);
  assert.ok(result.file_routes.includes('/asset.pdf'));
  assert.deepEqual(result.redirect_sources, ['/old/*']);
  assert.deepEqual(result.html_pages.find((page) => page.source_route === '/guide/').fragments, ['legacy', 'part']);
  assert.ok(result.links.some((link) => link.url === 'https://www.netdata.cloud/guide/#part'));
  assert.deepEqual(result.unsupported_schemes, {'mailto:': 1});
  assert.deepEqual(checkSameSite(result), {checked: 3, findings: []});
});

test('uses rendered canonical URLs to resolve extensionless Docusaurus relative links', async () => {
  const fixture = await renderedFixture({
    'docs/topic/index.html': '<link rel="canonical" href="https://www.netdata.cloud/docs/topic">' +
      '<a href="sibling">Sibling</a>',
    'docs/sibling/index.html': '<link rel="canonical" href="https://www.netdata.cloud/docs/sibling">' +
      '<h1 id="ok">Sibling</h1>',
  });
  const result = await inventoryRenderedSite({
    buildDirectory: fixture.build,
    redirectsFilename: fixture.redirectsFilename,
    policy: policy(),
  });
  assert.ok(result.links.some((link) => link.url === 'https://www.netdata.cloud/docs/sibling'));
  assert.equal(checkSameSite(result).findings.length, 0);
});

test('same-site validation reports missing paths, fragments, invalid escapes, and malformed relative links', () => {
  const subject = inventory({
    links: [
      'https://www.netdata.cloud/missing',
      'https://www.netdata.cloud/#missing',
      'https://www.netdata.cloud/%ZZ',
      'https://other.example/missing',
    ],
    invalid: [{source: '/', href: 'http://[', scope: 'network', error: 'invalid URL'}],
  });
  const result = checkSameSite(subject);
  assert.equal(result.checked, 3);
  assert.deepEqual(result.findings.map((item) => item.kind), [
    'missing-path', 'missing-fragment', 'invalid-target',
  ]);
});

test('same-site validation rejects non-default ports and ambiguous rendered aliases', () => {
  const withPort = inventory({links: ['https://www.netdata.cloud:8443/#home']});
  assert.match(checkSameSite(withPort).findings[0].error, /non-default port/);
  const ambiguous = inventory();
  ambiguous.html_pages.push({
    source_route: '/other', routes: ['/'], fragments: [],
  });
  assert.throws(() => checkSameSite(ambiguous), /owned by both/);
});

test('accepts browser text directives without weakening ordinary fragment checks', () => {
  const subject = inventory({links: ['https://www.netdata.cloud/#:~:text=Home']});
  assert.deepEqual(checkSameSite(subject), {checked: 1, findings: []});
});

test('normalizes safe percent escapes and rejects encoded separators', () => {
  assert.equal(normalizeUrlPath('/docs/space%20name'), '/docs/space name');
  assert.throws(() => normalizeUrlPath('/docs/a%2Fb'), /encoded separator/);
  assert.throws(() => normalizeUrlPath('/docs/%ZZ'), /invalid percent escape/);
});

test('parses same-host absolute redirect sources and matches bounded parameters', () => {
  const sources = parseRedirectSources(
    '[[redirects]]\nfrom="https://www.netdata.cloud/exact"\nto="/new"\n' +
    '[[redirects]]\nfrom="/files/:name/*"\nto="/new"\n' +
    '[[redirects]]\nfrom="https://learn.netdata.cloud/not-ours"\nto="/new"\n',
    'https://www.netdata.cloud',
  );
  assert.deepEqual(sources, ['/exact', '/files/:name/*']);
  assert.equal(redirectMatches('/files/report/value', sources), true);
  assert.equal(redirectMatches('/files//value', sources), false);
  assert.equal(redirectMatches('/unrelated', sources), false);
});

test('classifies exact Netdata hosts without substring ownership mistakes', () => {
  assert.equal(isNetdataHost('learn.netdata.cloud', 'netdata.cloud'), true);
  assert.equal(isNetdataHost('netdata.cloud', 'netdata.cloud'), true);
  assert.equal(isNetdataHost('netdata.cloud.example', 'netdata.cloud'), false);
  const subject = inventory({links: [
    'https://learn.netdata.cloud/docs/a',
    'https://example.com/a',
    'https://www.netdata.cloud/internal',
  ]});
  assert.deepEqual(networkTargets(subject, policy(), 'cross-site').map((item) => item.url), [
    'https://learn.netdata.cloud/docs/a',
  ]);
  assert.deepEqual(networkTargets(subject, policy(), 'third-party').map((item) => item.url), [
    'https://example.com/a',
  ]);
});

test('diffs complete rendered target identities against the merge base', () => {
  const base = inventory({links: ['https://example.com/existing#one']});
  const head = inventory({
    links: ['https://example.com/existing#one', 'https://example.com/existing#two', 'https://new.example/path'],
    invalid: [{source: '/', href: 'https://[', scope: 'network', error: 'invalid URL'}],
  });
  const result = newlyIntroducedThirdParty(head, base, policy());
  assert.deepEqual(result.targets.map((item) => item.url), [
    'https://example.com/existing#two', 'https://new.example/path',
  ]);
  assert.equal(result.invalid.length, 1);
});

test('blocks local, private, documentation, mapped, and multicast addresses', async () => {
  for (const address of [
    '0.0.0.0', '10.1.2.3', '127.0.0.1', '169.254.169.254', '172.16.0.1',
    '192.168.1.1', '198.51.100.2', '224.0.0.1', '::1', '::ffff:127.0.0.1',
    '2001:db8::1', 'fc00::1', 'fe80::1', 'ff02::1',
  ]) assert.equal(isPublicAddress(address), false, address);
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
  await assert.rejects(
    resolvePublicDestination('host.example', async () => [
      {address: '8.8.8.8', family: 4}, {address: '127.0.0.1', family: 4},
    ]),
    UnsafeTargetError,
  );
});

test('pins request DNS for both Node lookup callback forms', async () => {
  const resolved = {address: '8.8.8.8', family: 4};
  const lookup = fixedDestinationLookup(resolved);
  await new Promise((resolve, reject) => lookup('example.com', {}, (error, address, family) => {
    try {
      assert.ifError(error);
      assert.equal(address, resolved.address);
      assert.equal(family, resolved.family);
      resolve();
    } catch (assertionError) {
      reject(assertionError);
    }
  }));
  await new Promise((resolve, reject) => lookup('example.com', {all: true}, (error, addresses) => {
    try {
      assert.ifError(error);
      assert.deepEqual(addresses, [resolved]);
      resolve();
    } catch (assertionError) {
      reject(assertionError);
    }
  }));
});

test('classifies definitive absence separately from transient and access-controlled responses', () => {
  assert.equal(classifyHttpStatus(200), 'ok');
  assert.equal(classifyHttpStatus(206), 'ok');
  assert.equal(classifyHttpStatus(404), 'broken');
  assert.equal(classifyHttpStatus(410), 'broken');
  assert.equal(classifyHttpStatus(403), 'inconclusive');
  assert.equal(classifyHttpStatus(429), 'inconclusive');
  assert.equal(classifyHttpStatus(503), 'inconclusive');
  assert.equal(boundedResponseIsPartial(200, {}), false);
  assert.equal(boundedResponseIsPartial(206, {'content-range': 'bytes 0-99/100'}), false);
  assert.equal(boundedResponseIsPartial(206, {'content-range': 'bytes 0-99/1000'}), true);
  assert.equal(boundedResponseIsPartial(206, {}), true);
});

test('follows bounded redirects, preserves fragments, and reports cycles and confirmed absence', async () => {
  const requestPolicy = validatePolicy(policy()).request;
  const responses = new Map([
    ['https://example.com/start#part', {status: 301, location: '/final'}],
    ['https://example.com/final#part', {status: 200, classification: 'ok'}],
    ['https://example.com/missing', {status: 404, classification: 'broken'}],
    ['https://example.com/cycle-a', {status: 301, location: '/cycle-b'}],
    ['https://example.com/cycle-b', {status: 301, location: '/cycle-a'}],
  ]);
  const requestOnce = async (url) => responses.get(url.href);
  assert.deepEqual(await probeUrl('https://example.com/start#part', requestPolicy, {requestOnce}), {
    url: 'https://example.com/start#part',
    final_url: 'https://example.com/final#part',
    http_status: 200,
    status: 'ok',
  });
  assert.equal((await probeUrl('https://example.com/missing', requestPolicy, {requestOnce})).status, 'broken');
  assert.equal((await probeUrl('https://example.com/cycle-a', requestPolicy, {requestOnce})).reason, 'redirect cycle');
  assert.equal((await probeUrl('https://example.com:8443/', requestPolicy)).status, 'unsafe');
});

test('enforces both global and per-host probe concurrency', async () => {
  const items = [
    {url: 'https://one.example/a'}, {url: 'https://one.example/b'},
    {url: 'https://one.example/c'}, {url: 'https://two.example/a'},
    {url: 'https://three.example/a'},
  ];
  let active = 0;
  let maximum = 0;
  const byHost = new Map();
  const hostMaximum = new Map();
  const results = await runWithLimits(items, {concurrency: 3, perHostConcurrency: 1}, async (item) => {
    const host = new URL(item.url).hostname;
    active += 1;
    maximum = Math.max(maximum, active);
    byHost.set(host, (byHost.get(host) ?? 0) + 1);
    hostMaximum.set(host, Math.max(hostMaximum.get(host) ?? 0, byHost.get(host)));
    await new Promise((resolve) => setTimeout(resolve, 5));
    active -= 1;
    byHost.set(host, byHost.get(host) - 1);
    return item.url;
  });
  assert.equal(maximum, 3);
  assert.deepEqual([...hostMaximum.values()], [1, 1, 1]);
  assert.deepEqual(results, items.map((item) => item.url));
});

test('deduplicates probes and keeps inconclusive evidence non-failing', async () => {
  const targets = [
    {url: 'https://one.example/', occurrences: 2, sources: ['/a']},
    {url: 'https://one.example/', occurrences: 1, sources: ['/b']},
    {url: 'https://two.example/', occurrences: 1, sources: ['/a']},
  ];
  let calls = 0;
  const result = await probeTargets(targets, policy(), async (url) => {
    calls += 1;
    return {url, status: url.includes('two.') ? 'inconclusive' : 'ok', reason: 'fixture'};
  });
  assert.equal(calls, 2);
  assert.equal(result.checked, 2);
  assert.equal(result.findings.length, 0);
  assert.equal(result.warnings.length, 1);
});

test('probes application-state and text fragments as opaque URL state', async () => {
  const targets = [
    {url: 'https://app.netdata.cloud/#modal=open', occurrences: 1, sources: ['/']},
    {url: 'https://learn.netdata.cloud/#:~:text=Install', occurrences: 1, sources: ['/']},
  ];
  const probed = [];
  const result = await probeTargets(targets, policy(), async (url) => {
    probed.push(url);
    return {url, status: 'ok'};
  });
  assert.deepEqual(probed.sort(), ['https://app.netdata.cloud/', 'https://learn.netdata.cloud/']);
  assert.equal(result.findings.length, 0);
});

test('keeps required and advisory jobs standalone, pinned, and outside Netlify', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const workflow = await fs.readFile(
    path.join(root, '.github/workflows/rendered-link-integrity.yml'),
    'utf8',
  );
  const netlify = await fs.readFile(path.join(root, 'netlify.toml'), 'utf8');
  for (const name of [
    'Required same-site links',
    'Advisory cross-site links',
    'Advisory new third-party links',
  ]) assert.match(workflow, new RegExp(`name: ${name}`));
  assert.match(workflow, /same-site:\n[\s\S]*?needs: render-head\n\s+if: \$\{\{ always\(\) \}\}/);
  assert.match(workflow, /merge_group:/);
  assert.match(workflow, /workflow_dispatch:\n\s+inputs:\n\s+pr_number:/);
  assert.match(workflow, /inputs\.head_sha \|\| github\.event\.pull_request\.head\.sha/);
  assert.match(workflow, /inputs\.base_sha \|\| github\.event\.pull_request\.base\.sha/);
  assert.ok(
    workflow.indexOf('Preserve the pull-request checker for the base render') <
    workflow.indexOf('Switch to the merge-base revision'),
  );
  const unpinned = [...workflow.matchAll(/^\s*uses:\s*([^\s]+)$/gm)]
    .map((match) => match[1])
    .filter((reference) => !/@[0-9a-f]{40}$/.test(reference));
  assert.deepEqual(unpinned, []);
  assert.doesNotMatch(netlify, /link-integrity|same-site links|third-party links/i);
});

test('ingest automation explicitly dispatches rendered link checks for its PR head', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  const workflow = await fs.readFile(path.join(root, '.github/workflows/ingest.yml'), 'utf8');
  assert.match(workflow, /permissions:\n\s+actions: write/);
  assert.match(workflow, /id: create-pr\n\s+uses: peter-evans\/create-pull-request@[0-9a-f]{40}/);
  assert.match(workflow, /pull-request-operation == 'created'/);
  assert.match(workflow, /pull-request-operation == 'updated'/);
  assert.match(workflow, /workflow_id: 'rendered-link-integrity\.yml'/);
  assert.match(workflow, /ref: pull\.head\.ref/);
  assert.match(workflow, /base_sha: pull\.base\.sha/);
  assert.match(workflow, /head_sha: pull\.head\.sha/);
});
