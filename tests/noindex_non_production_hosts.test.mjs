import assert from 'node:assert/strict';
import test from 'node:test';

import noindexNonProductionHosts, {
  INDEXABLE_HOST,
  config,
  isIndexableHost,
} from '../netlify/edge-functions/noindex-non-production-hosts.js';

function contextServing(body = '<html></html>') {
  const calls = {next: 0};
  return {
    calls,
    context: {
      next: async () => {
        calls.next += 1;
        return new Response(body, {
          status: 200,
          headers: {'content-type': 'text/html; charset=UTF-8', 'cache-control': 'public'},
        });
      },
    },
  };
}

test('the production host stays indexable and is not intercepted', async () => {
  for (const url of [
    'https://learn.netdata.cloud/docs/ask-nedi',
    'https://LEARN.netdata.cloud/',
    'https://learn.netdata.cloud/sitemap.xml',
  ]) {
    const {calls, context} = contextServing();
    const result = await noindexNonProductionHosts(new Request(url), context);
    assert.equal(result, undefined, url);
    assert.equal(calls.next, 0, url);
  }
  assert.equal(INDEXABLE_HOST, 'learn.netdata.cloud');
});

test('every other host answers noindex with the original response kept', async () => {
  for (const url of [
    'https://deploy-preview-3175--netdata-docusaurus.netlify.app/docs/ask-nedi',
    'https://staging1--netdata-docusaurus.netlify.app/docs/ask-nedi',
    'https://master--netdata-docusaurus.netlify.app/',
    'https://0123456789abcdef01234567--netdata-docusaurus.netlify.app/',
    'https://netdata-docusaurus.netlify.app/docs/ask-nedi',
    'https://staging.learn.netdata.cloud/docs/ask-nedi',
    'https://learn.netdata.cloud.example.com/',
  ]) {
    const {calls, context} = contextServing('<p>page</p>');
    const response = await noindexNonProductionHosts(new Request(url), context);
    assert.equal(calls.next, 1, url);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex', url);
    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get('cache-control'), 'public', url);
    assert.equal(await response.text(), '<p>page</p>', url);
  }
});

test('host matching is exact', () => {
  assert.equal(isIndexableHost('learn.netdata.cloud'), true);
  assert.equal(isIndexableHost('www.netdata.cloud'), false);
  assert.equal(isIndexableHost('netdata-docusaurus.netlify.app'), false);
});

test('runs on every route except hashed script and style bundles', () => {
  assert.equal(config.path, '/*');
  assert.deepEqual(config.excludedPath, ['/assets/js/*', '/assets/css/*']);
});
