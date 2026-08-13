const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const plugin = require('../plugins/netlify-plugin-indexnow');
const {_test} = plugin;
const contractTests = require('../plugins/netlify-plugin-indexnow/contract-tests.json');

const HOST = 'learn.netdata.cloud';
const KEY = '69893e732658435694bf647d5a6fed1d';
const INPUTS = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
};

function sitemap(values) {
  const xmlText = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${values.map((value) => `<url><loc>${xmlText(value)}</loc></url>`).join('')}</urlset>`;
}

function logger() {
  const messages = {log: [], error: [], warn: []};
  return {
    messages,
    log(message) { messages.log.push(message); },
    error(message) { messages.error.push(message); },
    warn(message) { messages.warn.push(message); },
  };
}

function blobStore() {
  const values = new Map();
  const calls = [];
  return {
    values,
    calls,
    async set(key, value, options) {
      calls.push({key, value, options});
      if (values.has(key)) return {modified: false};
      values.set(key, value);
      return {modified: true, etag: 'test-etag'};
    },
    async get(key) { return values.get(key) ?? null; },
  };
}

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-indexnow-'));
  t.after(() => fs.rm(root, {recursive: true, force: true}));
  const publishDir = path.join(root, 'build');
  const statePath = path.join(root, 'cache', 'state.json');
  await fs.mkdir(path.join(publishDir, 'one'), {recursive: true});
  await fs.mkdir(path.join(publishDir, 'docs', 'two'), {recursive: true});
  await fs.mkdir(path.join(publishDir, 'docs', 'release.v1'), {recursive: true});
  await fs.mkdir(path.join(publishDir, 'café'), {recursive: true});
  await fs.writeFile(path.join(publishDir, 'index.html'), 'home');
  await fs.writeFile(path.join(publishDir, 'one', 'index.html'), 'one');
  await fs.writeFile(path.join(publishDir, 'docs', 'two', 'index.html'), 'two');
  await fs.writeFile(path.join(publishDir, 'docs', 'release.v1', 'index.html'), 'dotted');
  await fs.writeFile(path.join(publishDir, 'direct.html'), 'direct');
  await fs.writeFile(path.join(publishDir, 'café', 'index.html'), 'unicode');
  await fs.writeFile(path.join(publishDir, 'llms.txt'), 'not HTML');
  await fs.writeFile(path.join(publishDir, `${KEY}.txt`), KEY);
  await fs.writeFile(
    path.join(publishDir, 'sitemap.xml'),
    sitemap([
      `https://${HOST}/`,
      `https://${HOST}/one/`,
      `https://${HOST}/docs/two`,
      `https://${HOST}/llms.txt`,
      'https://other.example/foreign/',
    ]),
  );
  const cache = {
    restore: async () => {},
    saveCalls: [],
    async save(value) { this.saveCalls.push(value); return true; },
  };
  return {root, publishDir, statePath, cache, receiptStore: blobStore()};
}

async function run(dirs, overrides = {}) {
  return _test.runOnSuccess({
    constants: {PUBLISH_DIR: dirs.publishDir},
    inputs: INPUTS,
    utils: {cache: dirs.cache},
    statePath: dirs.statePath,
    fetchImpl: async () => ({status: 202, text: async () => ''}),
    logger: logger(),
    deployId: 'deploy-test',
    siteId: 'site-test',
    commitRef: 'commit-test',
    receiptStore: dirs.receiptStore,
    ...overrides,
  });
}

test('cold cache seeds all HTML route shapes without a bulk submission', async (t) => {
  const dirs = await fixture(t);
  let fetches = 0;
  const result = await run(dirs, {
    fetchImpl: async () => { fetches += 1; },
  });

  assert.equal(fetches, 0);
  assert.equal(result.seeded, true);
  assert.deepEqual(result.accepted, []);
  const state = JSON.parse(await fs.readFile(dirs.statePath, 'utf8'));
  assert.equal(state.version, 2);
  assert.equal(state.host, HOST);
  assert.deepEqual(Object.keys(state.pages), [
    `https://${HOST}/`,
    `https://${HOST}/docs/two`,
    `https://${HOST}/one/`,
  ]);
  assert.deepEqual(dirs.cache.saveCalls, [dirs.statePath]);
});

test('empty, corrupt, legacy, cross-host, and non-canonical state reseeds without submission', async (t) => {
  const hash = 'a'.repeat(64);
  for (const [name, state] of [
    ['invalid JSON', '{invalid'],
    ['legacy version', JSON.stringify({version: 1, pages: {}})],
    ['cross-host', JSON.stringify({version: 2, host: 'learn.netdata.cloud', pages: {}})],
    ['empty pages', JSON.stringify({version: 2, host: HOST, pages: {}})],
    ['invalid hash', JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/`]: 'not-a-hash'}})],
    ['query', JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/?unexpected=state`]: hash}})],
    ['uppercase host', JSON.stringify({version: 2, host: HOST, pages: {'https://WWW.netdata.cloud/one/': hash}})],
    ['default port', JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}:443/one/`]: hash}})],
    ['unescaped space', JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/a b/`]: hash}})],
    ['lowercase percent escape', JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/a%2fb/`]: hash}})],
    ['encoded unreserved', JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/%7Euser/`]: hash}})],
    ['encoded separator', JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/a%2Fb/`]: hash}})],
    ['extra field', `${JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/`]: hash}, extra: true}, null, 2)}\n`],
    ['reordered fields', `${JSON.stringify({host: HOST, version: 2, pages: {[`https://${HOST}/`]: hash}}, null, 2)}\n`],
    ['trailing whitespace', `${JSON.stringify({version: 2, host: HOST, pages: {[`https://${HOST}/`]: hash},}, null, 2)}\n `],
    ['duplicate top-level key', `{"version":2,"version":2,"host":"${HOST}","pages":{"https://${HOST}/":"${hash}"}}`],
  ]) {
    await t.test(name, async (t) => {
      const dirs = await fixture(t);
      await fs.mkdir(path.dirname(dirs.statePath), {recursive: true});
      await fs.writeFile(dirs.statePath, state);
      let fetches = 0;
      const result = await run(dirs, {fetchImpl: async () => { fetches += 1; }});
      assert.equal(result.seeded, true);
      assert.equal(fetches, 0);
      assert.equal(JSON.parse(await fs.readFile(dirs.statePath, 'utf8')).version, 2);
    });
  }
});

test('sitemap parsing uses direct URL locations and enforces the exact HTTPS host', () => {
  const xml = [
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    `<url><loc>https://${HOST}/one/?bad=query</loc></url>`,
    `<url><loc>https://${HOST}/one/</loc><image:image><image:loc>https://${HOST}/image.png</image:loc></image:image></url>`,
    `<url><loc>https://${HOST}/a&amp;b/</loc></url>`,
    `<url><loc>http://${HOST}/http/</loc></url>`,
    `<url><loc>https://${HOST}:444/port/</loc></url>`,
    `<url><loc>https://other.example/foreign/</loc></url>`,
    `<url><loc>https://${HOST}/one/</loc></url>`,
    '</urlset>',
  ].join('');
  assert.deepEqual(_test.sitemapUrls(xml, HOST), [
    `https://${HOST}/a&b/`,
    `https://${HOST}/one/`,
  ]);
});

test('sitemap XML handles namespaces, comments, CDATA, and named or numeric entities', () => {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sm:urlset xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    `<!-- <sm:url><sm:loc>https://${HOST}/comment-fake/</sm:loc></sm:url> -->`,
    `<sm:url><sm:loc><![CDATA[https://${HOST}/one/]]></sm:loc><image:image><image:loc>https://${HOST}/image-fake/</image:loc></image:image></sm:url>`,
    `<sm:url><sm:loc>https://${HOST}/a&amp;b/</sm:loc></sm:url>`,
    `<sm:url><sm:loc>https://${HOST}/decimal&#38;entity/</sm:loc></sm:url>`,
    `<sm:url><sm:loc>https://${HOST}/hex&#x2D;entity/</sm:loc></sm:url>`,
    '</sm:urlset>',
  ].join('');
  assert.deepEqual(_test.sitemapUrls(xml, HOST), [
    `https://${HOST}/a&b/`,
    `https://${HOST}/decimal&entity/`,
    `https://${HOST}/hex-entity/`,
    `https://${HOST}/one/`,
  ]);
});

test('malformed sitemap XML fails closed', () => {
  for (const xml of [
    '<urlset><url><loc>https://www.netdata.cloud/</url></loc></urlset>',
    '<urlset><url><loc>https://www.netdata.cloud/</loc></url>',
    '<urlset><!-- unclosed</urlset>',
    '<urlset><url><loc>https://www.netdata.cloud/</loc><loc>https://www.netdata.cloud/two/</loc></url></urlset>',
    '<urlset><url></url></urlset>',
    '<urlset><url><loc>https://www.netdata.cloud/a&unknown;b/</loc></url></urlset>',
    '<urlset><url><loc>https://www.netdata.cloud/a&#0;b/</loc></url></urlset>',
    '<urlset><url><loc>https://www.netdata.cloud/a]]>b/</loc></url></urlset>',
    '<urlset><loc>https://www.netdata.cloud/</loc></urlset>',
    '<urlset><url><loc><nested>https://www.netdata.cloud/</nested></loc></url></urlset>',
    '<urlset></urlset><urlset></urlset>',
    '<wrong:urlset xmlns:wrong="https://example.invalid"><wrong:url><wrong:loc>https://www.netdata.cloud/</wrong:loc></wrong:url></wrong:urlset>',
    '<sm:urlset><sm:url><sm:loc>https://www.netdata.cloud/</sm:loc></sm:url></sm:urlset>',
    '<?xml version="1.0"?><urlset><?xml version="1.0"?><url><loc>https://www.netdata.cloud/</loc></url></urlset>',
    '<?xml version="1.0"?><?xml version="1.0"?><urlset><url><loc>https://www.netdata.cloud/</loc></url></urlset>',
    '<urlset xmlns:a="urn:a" xmlns:b="urn:a" a:id="1" b:id="2"><url><loc>https://www.netdata.cloud/</loc></url></urlset>',
    '<urlset><url><loc>https://www.netdata.cloud/\u0001</loc></url></urlset>',
    '<!DOCTYPE urlset><urlset><url><loc>https://www.netdata.cloud/</loc></url></urlset>',
    ...contractTests.malformed_sitemaps,
  ]) {
    assert.throws(() => _test.sitemapUrls(xml, HOST), /Malformed sitemap XML/);
  }
});

test('sitemap URL and loc elements must remain in the root sitemap namespace', () => {
  const valid = [
    '<sm:urlset xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<sm:url><sm:loc>https://${HOST}/one/</sm:loc></sm:url>`,
    '</sm:urlset>',
  ].join('');
  assert.deepEqual(_test.sitemapUrls(valid, HOST), [`https://${HOST}/one/`]);

  for (const xml of [
    `<urlset xmlns=""><url><loc>https://${HOST}/one/</loc></url></urlset>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url xmlns=""><loc>https://${HOST}/one/</loc></url></urlset>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc xmlns="">https://${HOST}/one/</loc></url></urlset>`,
    `<sm:urlset xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:other="urn:other"><other:url><sm:loc>https://${HOST}/one/</sm:loc></other:url></sm:urlset>`,
    `<sm:urlset xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:other="urn:other"><sm:url><other:loc>https://${HOST}/one/</other:loc></sm:url></sm:urlset>`,
  ]) {
    assert.throws(() => _test.sitemapUrls(xml, HOST), /Malformed sitemap XML/);
  }
});

test('canonical state ordering is JavaScript code-unit ordering', () => {
  const hash = 'a'.repeat(64);
  const bytes = _test.stateBytes(HOST, {
    [`https://${HOST}/i/`]: hash,
    [`https://${HOST}/I/`]: hash,
  });
  assert.deepEqual(Object.keys(JSON.parse(bytes).pages), [
    `https://${HOST}/I/`,
    `https://${HOST}/i/`,
  ]);
});

test('page hashing supports Hugo trailing slashes, Docusaurus routes, and skips real non-HTML files', async (t) => {
  const dirs = await fixture(t);
  const urls = [
    `https://${HOST}/`,
    `https://${HOST}/one/`,
    `https://${HOST}/docs/two`,
    `https://${HOST}/llms.txt`,
  ];
  const {pages, skipped} = await _test.hashPublishedPages(dirs.publishDir, urls);
  assert.deepEqual(Object.keys(pages), urls.slice(0, 3));
  assert.deepEqual(skipped, [`https://${HOST}/llms.txt`]);
  assert.match(pages[`https://${HOST}/`], /^[0-9a-f]{64}$/);

  const routeShapes = [
    `https://${HOST}/docs/release.v1`,
    `https://${HOST}/direct`,
    `https://${HOST}/caf%C3%A9/`,
  ];
  const shaped = await _test.hashPublishedPages(dirs.publishDir, routeShapes);
  assert.deepEqual(Object.keys(shaped.pages), routeShapes);
  assert.deepEqual(shaped.skipped, []);
});

test('URL path mapping rejects ambiguous, duplicate, malformed, and unsafe paths', async (t) => {
  const dirs = await fixture(t);
  for (const pathname of contractTests.invalid_paths) {
    const url = `https://${HOST}${pathname}`;
    assert.deepEqual(_test.sitemapUrls(sitemap([url]), HOST), []);
    await assert.rejects(_test.publishedFileForUrl(dirs.publishDir, url), /Cannot map/);
  }

  await fs.writeFile(path.join(dirs.publishDir, 'one.html'), 'ambiguous one');
  await assert.rejects(
    _test.publishedFileForUrl(dirs.publishDir, `https://${HOST}/one/`),
    /maps to multiple files/,
  );
  await fs.rm(path.join(dirs.publishDir, 'one.html'));

  await assert.rejects(
    _test.hashPublishedPages(dirs.publishDir, [
      `https://${HOST}/one`,
      `https://${HOST}/one/`,
    ]),
    /map to the same HTML file/,
  );

  await fs.mkdir(path.join(dirs.publishDir, 'linked'), {recursive: true});
  await fs.symlink('../one/index.html', path.join(dirs.publishDir, 'linked', 'index.html'));
  await assert.rejects(
    _test.publishedFileForUrl(dirs.publishDir, `https://${HOST}/linked/`),
    /symbolic link/,
  );
});

test('built root key preflight rejects missing, changed, newline, directory, and symlink artifacts before state or network', async (t) => {
  for (const mutation of ['missing', 'changed', 'newline', 'directory', 'symlink']) {
    await t.test(mutation, async (t) => {
      const dirs = await fixture(t);
      const keyPath = path.join(dirs.publishDir, `${KEY}.txt`);
      if (mutation === 'missing') await fs.rm(keyPath);
      if (mutation === 'changed') await fs.writeFile(keyPath, `${KEY}x`);
      if (mutation === 'newline') await fs.writeFile(keyPath, `${KEY}\n`);
      if (mutation === 'directory') {
        await fs.rm(keyPath);
        await fs.mkdir(keyPath);
      }
      if (mutation === 'symlink') {
        await fs.rm(keyPath);
        await fs.writeFile(path.join(dirs.publishDir, 'key-target.txt'), KEY);
        await fs.symlink('key-target.txt', keyPath);
      }
      let fetches = 0;
      await assert.rejects(
        run(dirs, {fetchImpl: async () => { fetches += 1; }}),
        /built root key/,
      );
      assert.equal(fetches, 0);
      assert.equal(dirs.cache.saveCalls.length, 0);
      assert.equal(dirs.receiptStore.values.size, 0);
      await assert.rejects(fs.stat(dirs.statePath), {code: 'ENOENT'});
    });
  }
});

test('missing sitemap HTML fails before state or submission can advance', async (t) => {
  const dirs = await fixture(t);
  await fs.writeFile(
    path.join(dirs.publishDir, 'sitemap.xml'),
    sitemap([`https://${HOST}/missing/`]),
  );
  let fetches = 0;
  await assert.rejects(
    run(dirs, {fetchImpl: async () => { fetches += 1; }}),
    /No published file found/,
  );
  assert.equal(fetches, 0);
  await assert.rejects(fs.stat(dirs.statePath), {code: 'ENOENT'});
});

test('diff classifies added, updated, and removed URLs independently', () => {
  const changes = _test.diffPages(
    {'https://example/removed': 'a', 'https://example/updated': 'b', 'https://example/same': 'c'},
    {'https://example/added': 'd', 'https://example/updated': 'e', 'https://example/same': 'c'},
  );
  assert.deepEqual(changes, {
    added: ['https://example/added'],
    updated: ['https://example/updated'],
    removed: ['https://example/removed'],
    all: ['https://example/added', 'https://example/removed', 'https://example/updated'],
  });
  assert.deepEqual(_test.changedUrls(
    {'https://example/removed': 'a'},
    {'https://example/added': 'b'},
  ), ['https://example/added', 'https://example/removed']);
});

test('changed content and a removed or redirected URL are both submitted', async (t) => {
  const dirs = await fixture(t);
  await run(dirs);
  await fs.writeFile(path.join(dirs.publishDir, 'one', 'index.html'), 'one changed');
  await fs.writeFile(
    path.join(dirs.publishDir, 'sitemap.xml'),
    sitemap([`https://${HOST}/`, `https://${HOST}/one/`, `https://${HOST}/llms.txt`]),
  );
  const payloads = [];
  const output = logger();
  const result = await run(dirs, {
    fetchImpl: async (_url, request) => {
      payloads.push(JSON.parse(request.body));
      return {status: 202, text: async () => ''};
    },
    logger: output,
  });

  assert.deepEqual(result.changes, {
    added: [],
    updated: [`https://${HOST}/one/`],
    removed: [`https://${HOST}/docs/two`],
    all: [`https://${HOST}/docs/two`, `https://${HOST}/one/`],
  });
  assert.deepEqual(result.accepted, result.changes.all);
  assert.deepEqual(result.pending, []);
  assert.deepEqual(payloads, [{...INPUTS, urlList: result.changes.all}]);

  assert.equal(dirs.receiptStore.calls.length, 1);
  const [{key: receiptKey, value: manifestText, options}] = dirs.receiptStore.calls;
  assert.equal(receiptKey, `receipts/${result.receipt.sha256}.json`);
  assert.deepEqual(options, {
    onlyIfNew: true,
    metadata: {schema_version: 2, sha256: result.receipt.sha256},
  });
  assert.equal(
    crypto.createHash('sha256').update(manifestText).digest('hex'),
    result.receipt.sha256,
  );
  const manifest = JSON.parse(manifestText);
  assert.deepEqual(
    {
      batch_count: manifest.batch_count,
      accepted_url_count: manifest.accepted_url_count,
      pending_url_count: manifest.pending_url_count,
    },
    {batch_count: 1, accepted_url_count: 2, pending_url_count: 0},
  );
  const batch = manifest.batches[0];
  assert.deepEqual(batch.urls, result.changes.all);
  assert.equal(batch.status, 'accepted');
  assert.equal(batch.http_status, 202);
  assert.equal(manifest.site_id, 'site-test');
  assert.equal(manifest.deploy_id, 'deploy-test');
  assert.equal(manifest.commit_ref, 'commit-test');
  assert.doesNotMatch(manifestText, new RegExp(KEY));
  assert.doesNotMatch(manifestText, /keyLocation/);
  const combinedLog = [...output.messages.log, ...output.messages.error].join('\n');
  assert.match(combinedLog, new RegExp(result.receipt.sha256));
  assert.doesNotMatch(combinedLog, new RegExp(KEY));
  assert.doesNotMatch(combinedLog, /keyLocation/);
});

test('an unchanged deploy sends no request and keeps a valid current state', async (t) => {
  const dirs = await fixture(t);
  await run(dirs);
  const before = await fs.readFile(dirs.statePath, 'utf8');
  let fetches = 0;
  const result = await run(dirs, {fetchImpl: async () => { fetches += 1; }});
  assert.equal(fetches, 0);
  assert.deepEqual(result.changes.all, []);
  assert.equal(await fs.readFile(dirs.statePath, 'utf8'), before);
});

test('partial batch failure persists accepted state and retries only pending URLs', async (t) => {
  const dirs = await fixture(t);
  await run(dirs);
  const oldState = JSON.parse(await fs.readFile(dirs.statePath, 'utf8'));
  await fs.writeFile(path.join(dirs.publishDir, 'index.html'), 'home changed');
  await fs.writeFile(path.join(dirs.publishDir, 'one', 'index.html'), 'one changed');
  await fs.writeFile(path.join(dirs.publishDir, 'docs', 'two', 'index.html'), 'two changed');

  const statuses = [202, 500, 200];
  const first = await run(dirs, {
    batchSize: 1,
    fetchImpl: async () => ({status: statuses.shift(), text: async () => ''}),
  });
  assert.deepEqual(first.accepted, [`https://${HOST}/`, `https://${HOST}/one/`]);
  assert.deepEqual(first.pending, [`https://${HOST}/docs/two`]);
  assert.deepEqual(first.batches.map((batch) => ({
    status: batch.status,
    httpStatus: batch.httpStatus,
    reason: batch.reason,
    urls: batch.urls,
  })), [
    {status: 'accepted', httpStatus: 202, reason: null, urls: [`https://${HOST}/`]},
    {status: 'pending', httpStatus: 500, reason: 'http-error', urls: [`https://${HOST}/docs/two`]},
    {status: 'accepted', httpStatus: 200, reason: null, urls: [`https://${HOST}/one/`]},
  ]);

  const {pages: currentPages} = await _test.hashPublishedPages(dirs.publishDir, [
    `https://${HOST}/`, `https://${HOST}/docs/two`, `https://${HOST}/one/`,
  ]);
  const partialState = JSON.parse(await fs.readFile(dirs.statePath, 'utf8'));
  assert.equal(partialState.pages[`https://${HOST}/`], currentPages[`https://${HOST}/`]);
  assert.equal(partialState.pages[`https://${HOST}/one/`], currentPages[`https://${HOST}/one/`]);
  assert.equal(partialState.pages[`https://${HOST}/docs/two`], oldState.pages[`https://${HOST}/docs/two`]);

  const retried = [];
  const second = await run(dirs, {
    fetchImpl: async (_url, request) => {
      retried.push(...JSON.parse(request.body).urlList);
      return {status: 202, text: async () => ''};
    },
  });
  assert.deepEqual(retried, [`https://${HOST}/docs/two`]);
  assert.deepEqual(second.pending, []);
  assert.deepEqual(JSON.parse(await fs.readFile(dirs.statePath, 'utf8')).pages, currentPages);
});

test('cold-cache persistence false or exception restores the exact prior local state', async (t) => {
  for (const behavior of ['false', 'throw']) {
    await t.test(`missing state: ${behavior}`, async (t) => {
      const dirs = await fixture(t);
      const cache = {
        save: async () => {
          if (behavior === 'throw') throw new Error('cache unavailable');
          return false;
        },
      };
      await assert.rejects(run(dirs, {utils: {cache}}), /local state was rolled back/);
      await assert.rejects(fs.stat(dirs.statePath), {code: 'ENOENT'});
    });

    await t.test(`corrupt state: ${behavior}`, async (t) => {
      const dirs = await fixture(t);
      const corrupt = Buffer.from('{corrupt-state');
      await fs.mkdir(path.dirname(dirs.statePath), {recursive: true});
      await fs.writeFile(dirs.statePath, corrupt);
      const cache = {
        save: async () => {
          if (behavior === 'throw') throw new Error('cache unavailable');
          return false;
        },
      };
      await assert.rejects(run(dirs, {utils: {cache}}), /local state was rolled back/);
      assert.deepEqual(await fs.readFile(dirs.statePath), corrupt);
    });
  }
});

test('warm state rolls back exactly when receipt or state cache persistence fails', async (t) => {
  for (const stage of ['receipt', 'state']) {
    for (const behavior of ['false', 'throw']) {
      await t.test(`${stage} save ${behavior}`, async (t) => {
        const dirs = await fixture(t);
        await run(dirs);
        const before = await fs.readFile(dirs.statePath);
        await fs.writeFile(path.join(dirs.publishDir, 'index.html'), 'home changed');
        let cacheCalls = 0;
        const cache = {
          save: async () => {
            cacheCalls += 1;
            if (stage !== 'state') return true;
            if (behavior === 'throw') throw new Error('cache unavailable');
            return false;
          },
        };
        const receiptStore = stage === 'receipt' ? {
          set: async () => {
            if (behavior === 'throw') throw new Error('blob unavailable');
            return {modified: false};
          },
          get: async () => null,
        } : dirs.receiptStore;
        await assert.rejects(
          run(dirs, {utils: {cache}, receiptStore}),
          stage === 'receipt' ? /receipt persistence failed/ : /local state was rolled back/,
        );
        assert.deepEqual(await fs.readFile(dirs.statePath), before);
        assert.equal(cacheCalls, stage === 'receipt' ? 0 : 1);
        assert.equal(dirs.receiptStore.values.size, stage === 'receipt' ? 0 : 1);
      });
    }
  }
});

test('partial acceptance is rolled back on state cache false or exception and all changes retry', async (t) => {
  for (const behavior of ['false', 'throw']) {
    await t.test(behavior, async (t) => {
      const dirs = await fixture(t);
      await run(dirs);
      const before = await fs.readFile(dirs.statePath);
      await fs.writeFile(path.join(dirs.publishDir, 'index.html'), 'home changed');
      await fs.writeFile(path.join(dirs.publishDir, 'one', 'index.html'), 'one changed');
      let saves = 0;
      const statuses = [202, 500];
      await assert.rejects(
        run(dirs, {
          batchSize: 1,
          fetchImpl: async () => ({status: statuses.shift(), text: async () => ''}),
          utils: {cache: {save: async () => {
            saves += 1;
            if (behavior === 'throw') throw new Error('cache unavailable');
            return false;
          }}},
        }),
        /local state was rolled back/,
      );
      assert.deepEqual(await fs.readFile(dirs.statePath), before);

      const retried = [];
      await run(dirs, {
        fetchImpl: async (_endpoint, request) => {
          retried.push(...JSON.parse(request.body).urlList);
          return {status: 200, text: async () => ''};
        },
      });
      assert.deepEqual(retried, [`https://${HOST}/`, `https://${HOST}/one/`]);
    });
  }
});

test('batching enforces the protocol limit', () => {
  assert.deepEqual(
    _test.chunks(Array.from({length: 20_001}), 10_000).map((part) => part.length),
    [10_000, 10_000, 1],
  );
  assert.throws(() => _test.chunks(['url'], 10_001), /between 1 and 10000/);
  assert.throws(() => _test.chunks(['url'], 0), /between 1 and 10000/);
});

test('request and response-body timeouts leave only failed batches pending and continue', async () => {
  const urls = [
    `https://${HOST}/request-timeout/`,
    `https://${HOST}/body-timeout/`,
    `https://${HOST}/accepted-after-timeouts/`,
  ];
  const signals = [];
  let request = 0;
  const result = await _test.submitUrlBatches({
    urls,
    inputs: INPUTS,
    batchSize: 1,
    requestTimeoutMs: 10,
    logger: logger(),
    fetchImpl: async (_endpoint, options) => {
      signals.push(options.signal);
      request += 1;
      if (request === 1) return new Promise(() => {});
      if (request === 2) {
        return {status: 202, text: async () => new Promise(() => {})};
      }
      return {status: 200, text: async () => ''};
    },
  });
  assert.deepEqual(result.accepted, [urls[2]]);
  assert.deepEqual(result.pending, urls.slice(0, 2));
  assert.deepEqual(result.batches.map((batch) => batch.reason), [
    'timeout',
    'timeout',
    null,
  ]);
  assert.equal(signals[0].aborted, true);
  assert.equal(signals[1].aborted, true);
  assert.equal(signals[2].aborted, false);
});

test('transport and response-body failures remain pending without stopping later batches', async () => {
  const urls = [
    `https://${HOST}/transport-error/`,
    `https://${HOST}/body-error/`,
    `https://${HOST}/accepted/`,
  ];
  let request = 0;
  const result = await _test.submitUrlBatches({
    urls,
    inputs: INPUTS,
    batchSize: 1,
    logger: logger(),
    fetchImpl: async () => {
      request += 1;
      if (request === 1) throw new Error('offline');
      if (request === 2) return {status: 202, text: async () => { throw new Error('broken body'); }};
      return {status: 202, text: async () => ''};
    },
  });
  assert.deepEqual(result.accepted, [urls[2]]);
  assert.deepEqual(result.pending, urls.slice(0, 2));
  assert.deepEqual(result.batches.map((batch) => batch.reason), [
    'transport-error',
    'response-body-error',
    null,
  ]);
});

test('out-of-range and non-integer response statuses remain schema-valid invalid responses', async () => {
  for (const responseStatus of [undefined, null, '500', 99, 600, 200.5]) {
    const result = await _test.submitUrlBatches({
      urls: [`https://${HOST}/invalid-status/`],
      inputs: INPUTS,
      fetchImpl: async () => ({status: responseStatus, text: async () => ''}),
      logger: logger(),
    });
    assert.deepEqual(result.batches.map(({status, httpStatus, reason}) => ({
      status, httpStatus, reason,
    })), [{status: 'pending', httpStatus: null, reason: 'invalid-response'}]);
    assert.deepEqual(
      _test.receiptDocument({
        host: HOST,
        batches: result.batches,
        deployId: 'deploy-test',
        siteId: 'site-test',
        commitRef: null,
      }).batches[0],
      {
        batch: 1,
        batch_count: 1,
        status: 'pending',
        http_status: null,
        reason: 'invalid-response',
        url_count: 1,
        urls: [`https://${HOST}/invalid-status/`],
      },
    );
  }
});

test('host, key, key location, and payload validation fail before network access', async () => {
  for (const inputs of [
    {...INPUTS, host: 'LEARN.netdata.cloud'},
    {...INPUTS, host: 'https://learn.netdata.cloud'},
    {...INPUTS, host: 'learn.netdata.cloud:443'},
    {...INPUTS, key: 'short'},
    {...INPUTS, key: 'unsafe/key'},
    {...INPUTS, key: 'unsafe_key'},
    ...contractTests.invalid_keys.map((key) => ({...INPUTS, key})),
    {...INPUTS, keyLocation: `http://${HOST}/${KEY}.txt`},
    {...INPUTS, keyLocation: `https://www.netdata.cloud/${KEY}.txt`},
    {...INPUTS, keyLocation: `https://${HOST}/different.txt`},
    {...INPUTS, keyLocation: `https://${HOST}/keys/${KEY}.txt`},
  ]) {
    assert.throws(() => _test.validateInputs(inputs));
  }
  assert.deepEqual(_test.validateInputs({
    host: HOST,
    key: 'valid-key-123',
    keyLocation: `https://${HOST}/valid-key-123.txt`,
  }), {
    host: HOST,
    key: 'valid-key-123',
    keyLocation: `https://${HOST}/valid-key-123.txt`,
  });

  let fetches = 0;
  await assert.rejects(
    _test.submitUrlBatches({
      urls: ['https://attacker.example/page'],
      inputs: INPUTS,
      fetchImpl: async () => { fetches += 1; },
      logger: logger(),
    }),
    /not canonical HTTPS on learn\.netdata\.cloud/,
  );
  assert.equal(fetches, 0);

  await assert.rejects(
    _test.submitUrlBatches({
      urls: [`https://${HOST}/page?unexpected=payload`],
      inputs: INPUTS,
      fetchImpl: async () => { fetches += 1; },
      logger: logger(),
    }),
    /not canonical HTTPS on learn\.netdata\.cloud/,
  );
  assert.equal(fetches, 0);

  for (const value of [
    `https://WWW.netdata.cloud/one/`,
    `https://${HOST}:443/one/`,
    `https://${HOST}/a b/`,
    `https://${HOST}/a%2fb/`,
    `https://${HOST}/%7Euser/`,
    `https://${HOST}/a%2Fb/`,
  ]) {
    await assert.rejects(
      _test.submitUrlBatches({
        urls: [value],
        inputs: INPUTS,
        fetchImpl: async () => { fetches += 1; },
        logger: logger(),
      }),
      /not canonical HTTPS/,
    );
  }
  assert.equal(fetches, 0);
});

test('the configured public root key file exactly matches the submitted key', async () => {
  const keyFile = await fs.readFile(path.resolve('static', `${KEY}.txt`), 'utf8');
  assert.equal(keyFile, KEY);
  assert.equal(Buffer.byteLength(keyFile), KEY.length);
});

test('request logs never contain the public key or key location', async () => {
  const output = logger();
  await _test.submitUrlBatches({
    urls: [`https://${HOST}/one/`],
    inputs: INPUTS,
    fetchImpl: async () => ({status: 202, text: async () => ''}),
    logger: output,
  });
  const combined = [...output.messages.log, ...output.messages.error].join('\n');
  assert.doesNotMatch(combined, new RegExp(KEY));
  assert.doesNotMatch(combined, /keyLocation/);
});

test('a maximum-size batch keeps logs bounded while its result retains exact URL identity', async () => {
  const urls = Array.from(
    {length: 10_000},
    (_, index) => `https://${HOST}/receipt-${String(index).padStart(5, '0')}/`,
  );
  const output = logger();
  const result = await _test.submitUrlBatches({
    urls,
    inputs: INPUTS,
    fetchImpl: async () => ({status: 202, text: async () => ''}),
    logger: output,
  });
  assert.deepEqual(result.batches[0].urls, urls);
  const combined = [...output.messages.log, ...output.messages.error].join('\n');
  assert.ok(Buffer.byteLength(combined) < 1_000);
  assert.doesNotMatch(combined, /receipt-00000/);
  assert.doesNotMatch(combined, new RegExp(KEY));
  assert.doesNotMatch(combined, /keyLocation/);
});

test('receipt persistence is content-addressed, canonical, and verifies an existing blob', async () => {
  const store = blobStore();
  const input = {
    host: HOST,
    deployId: 'deploy-one',
    siteId: 'site-one',
    commitRef: null,
    batches: [{
      batch: 1,
      batchCount: 1,
      status: 'accepted',
      httpStatus: 200,
      reason: null,
      urls: [`https://${HOST}/one/`],
    }],
    store,
  };
  const first = await _test.persistSubmissionReceipt(input);
  const second = await _test.persistSubmissionReceipt(input);
  assert.equal(first.sha256, second.sha256);
  assert.equal(store.values.size, 1);
  const contents = store.values.get(first.blobKey);
  assert.equal(crypto.createHash('sha256').update(contents).digest('hex'), first.sha256);
  assert.equal(contents, _test.canonicalJson(JSON.parse(contents)));
});

test('receipt persistence refuses missing deploy identity and digest collisions', async () => {
  const batch = [{
    batch: 1,
    batchCount: 1,
    status: 'pending',
    httpStatus: 500,
    reason: 'http-error',
    urls: [`https://${HOST}/one/`],
  }];
  await assert.rejects(
    _test.persistSubmissionReceipt({host: HOST, batches: batch, deployId: '', siteId: 'site', commitRef: null, store: blobStore()}),
    /DEPLOY_ID and SITE_ID/,
  );
  await assert.rejects(
    _test.persistSubmissionReceipt({
      host: HOST,
      batches: batch,
      deployId: 'deploy',
      siteId: 'site',
      commitRef: null,
      store: {set: async () => ({modified: false}), get: async () => 'different'},
    }),
    /does not match its content digest/,
  );

  for (const commitRef of ['', ' ', ' commit', 'commit ', 42]) {
    await assert.rejects(
      _test.persistSubmissionReceipt({
        host: HOST,
        batches: batch,
        deployId: 'deploy',
        siteId: 'site',
        commitRef,
        store: blobStore(),
      }),
      /COMMIT_REF/,
    );
  }
});

test('pre-build cache restore failure is non-fatal', async () => {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (message) => warnings.push(message);
  try {
    await assert.doesNotReject(plugin.onPreBuild({
      utils: {cache: {restore: async () => { throw new Error('cache offline'); }}},
    }));
  } finally {
    console.warn = originalWarn;
  }
  assert.match(warnings.join('\n'), /deploy will continue/);
});

test('pre-build restores only cached diff state; receipts are deploy-specific blobs', async () => {
  const restored = [];
  await plugin.onPreBuild({
    utils: {cache: {restore: async (target) => { restored.push(target); return true; }}},
  });
  assert.deepEqual(restored, [
    path.resolve('.netlify/indexnow-state.json'),
  ]);
});

test('deploy hook skips non-production contexts', async () => {
  const previous = process.env.CONTEXT;
  const originalLog = console.log;
  const logs = [];
  process.env.CONTEXT = 'deploy-preview';
  console.log = (message) => logs.push(message);
  try {
    await assert.doesNotReject(plugin.onSuccess({}));
  } finally {
    console.log = originalLog;
    if (previous === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = previous;
  }
  assert.match(logs.join('\n'), /skipped non-production/);
});

test('deploy hook never invalidates a successful production deploy', async () => {
  const previous = process.env.CONTEXT;
  const originalError = console.error;
  const errors = [];
  process.env.CONTEXT = 'production';
  console.error = (message) => errors.push(message);
  try {
    await assert.doesNotReject(plugin.onSuccess({
      constants: {PUBLISH_DIR: '/path/that/does/not/exist'},
      inputs: INPUTS,
      utils: {cache: {save: async () => {}}},
    }));
  } finally {
    console.error = originalError;
    if (previous === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = previous;
  }
  assert.match(errors.join('\n'), /successful deploy remains valid/);
});
