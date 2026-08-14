import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  assertNoPublishedRedirects,
  firstMatch,
  parseRedirects,
  routeSet,
  ruleMatches,
  verifyRedirectGraph,
} = require('../../scripts/verify-redirect-graph');
const root = path.resolve(import.meta.dirname, '../..');
const temporaryDirectories = [];
const publishedRoutes = routeSet(path.join(root, 'build'));

const historicalNetworkFlowSuffixes = [
  '', '/anti-patterns', '/configuration', '/enrichment', '/enrichment-intel-downloader',
  '/enrichment-methods', '/enrichment-methods/aws-ip-ranges',
  '/enrichment-methods/azure-ip-ranges', '/enrichment-methods/bio-rd-ripe-ris',
  '/enrichment-methods/bmp-bgp-monitoring-protocol',
  '/enrichment-methods/caida-routeviews-prefix-to-as', '/enrichment-methods/classifiers',
  '/enrichment-methods/custom-mmdb-database', '/enrichment-methods/db-ip-ip-intelligence',
  '/enrichment-methods/decapsulation', '/enrichment-methods/gcp-ip-ranges',
  '/enrichment-methods/generic-json-over-http-ipam',
  '/enrichment-methods/ip2location-lite-ip-country',
  '/enrichment-methods/ipdeny-country-zones', '/enrichment-methods/ipip-country-database',
  '/enrichment-methods/iptoasn', '/enrichment-methods/maxmind-geoip-geolite2',
  '/enrichment-methods/netbox', '/enrichment-methods/static-metadata', '/field-reference',
  '/flow-protocols', '/flow-protocols/ipfix', '/flow-protocols/netflow',
  '/flow-protocols/sflow', '/installation', '/investigation-playbooks', '/quick-start',
  '/retention-and-tiers', '/sizing-and-capacity-planning', '/troubleshooting',
  '/validation-and-data-quality', '/visualization', '/visualization/filters-and-facets',
  '/visualization/maps-and-globe', '/visualization/plugin-health-charts',
  '/visualization/sankey-and-table', '/visualization/time-series',
];

function options(netlifyPath = path.join(root, 'netlify.toml')) {
  return {
    netlifyPath,
    staticPath: path.join(root, 'static.toml'),
    publishDir: path.join(root, 'build'),
    policyPath: path.join(root, 'config/redirect-policy.json'),
    publishedRoutes,
  };
}

async function mutatedNetlify(transform) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-redirect-graph-'));
  temporaryDirectories.push(directory);
  const filename = path.join(directory, 'netlify.toml');
  await fs.writeFile(filename, transform(await fs.readFile(path.join(root, 'netlify.toml'), 'utf8')));
  return filename;
}

function appendRule(text, from, to) {
  return text.replace(
    '# section: dynamic << END',
    `[[redirects]]\n  from="${from}"\n  to="${to}"\n\n# section: dynamic << END`,
  );
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => fs.rm(directory, {recursive: true, force: true})));
});

describe('Netlify redirect graph gate', () => {
  it('verifies the complete current graph', () => {
    expect(verifyRedirectGraph(options())).toMatchObject({historicalRoutes: 42});
  });

  it('enumerates all 42 routes moved by the Network Flows relocation', async () => {
    const policy = JSON.parse(await fs.readFile(path.join(root, 'config/redirect-policy.json'), 'utf8'));
    expect(policy.network_flows.historical_suffixes).toEqual(historicalNetworkFlowSuffixes);
  });

  it('pins every archived request previously handled by the retired wildcard classes', async () => {
    const policy = JSON.parse(await fs.readFile(path.join(root, 'config/redirect-policy.json'), 'utf8'));
    expect(policy.archived_wildcard_requests).toHaveLength(6);
    expect(policy.required_exact_redirects).toHaveLength(27);
    expect(policy.same_class_exact_redirects).toHaveLength(6);
    const requiredSources = new Set(policy.required_exact_redirects.map(([source]) => source));
    expect(policy.archived_wildcard_requests.filter(([source]) => requiredSources.has(source))).toEqual([]);
  });

  it('uses an exact root and a bounded terminal wildcard', async () => {
    const rules = parseRedirects(await fs.readFile(path.join(root, 'netlify.toml'), 'utf8'));
    expect(firstMatch(rules, '/docs/network-flows')).toMatchObject({
      target: '/docs/network-performance-monitoring/network-flows',
    });
    expect(firstMatch(rules, '/docs/network-flows/visualization/maps-and-globe')).toMatchObject({
      target: '/docs/network-performance-monitoring/network-flows/visualization/maps-and-globe',
    });
    expect(firstMatch(rules, '/docs/network-flows-archive/example')).toBeNull();
    expect(ruleMatches({from: '/docs/network-flows/*'}, '/docs/network-flows-archive/example')).toBe(false);
  });

  it('permanently redirects the obsolete Ask Netdata route in one hop', async () => {
    const rules = parseRedirects(await fs.readFile(path.join(root, 'netlify.toml'), 'utf8'));
    expect(firstMatch(rules, '/docs/ask-netdata')).toMatchObject({target: '/docs/ask-nedi'});
    expect(publishedRoutes.has('/docs/ask-netdata')).toBe(false);
    expect(publishedRoutes.has('/docs/ask-nedi')).toBe(true);
    const robots = await fs.readFile(path.join(root, 'static/robots.txt'), 'utf8');
    expect(robots).not.toMatch(/^Disallow:\s*\/docs\/ask-netdata\/?$/m);
  });

  it.each([
    ['duplicate', '/docs/rest-api/netdata-badges', '/api', /Duplicate redirect identity/],
    ['conflict', '/docs/rest-api/netdata-badges', '/docs/getting-started', /Conflicting redirect identity/],
    ['malformed source', 'missing-leading-slash', '/docs/getting-started', /Malformed redirect source/],
    ['dead target', '/test/dead-target', '/docs/does-not-exist', /does not render/],
    ['chain', '/test/chain', '/docs/rest-api/netdata-badges', /chain or cycle/],
    ['rendered source', '/docs/alerts-&-notifications/notifications/agent-dispatched-notifications', '/docs/getting-started', /shadows rendered route/],
    ['retired wildcard', '/docs/agent/pt/*', '/docs/getting-started', /Retired wildcard returned/],
    ['bad percent escape', '/test/bad-%escape', '/docs/getting-started', /Malformed redirect source/],
    ['encoded separator', '/test/encoded%2Fseparator', '/docs/getting-started', /Malformed redirect source/],
    ['source query', '/test/query?value=1', '/docs/getting-started', /Malformed redirect source/],
    ['source fragment', '/test/fragment#part', '/docs/getting-started', /Malformed redirect source/],
    ['target query', '/test/target-query', '/docs/getting-started?value=1', /Malformed redirect target/],
    ['target fragment', '/test/target-fragment', '/docs/getting-started#part', /Malformed redirect target/],
    ['active wildcard source', '/docs/collecting-metrics/collectors/page/*', '/docs/getting-started', /Wildcard redirect source shadows rendered route/],
    ['wildcard to exact chain', '/test/wild/*', '/docs/rest-api/netdata-badges', /chain or cycle/],
    ['wildcard self-cycle', '/test/self/*', '/test/self/:splat', /chain or cycle/],
  ])('fails closed on a %s mutation', async (_name, from, to, message) => {
    const filename = await mutatedNetlify((text) => appendRule(text, from, to));
    expect(() => verifyRedirectGraph(options(filename))).toThrow(message);
  });

  it('rejects an earlier wildcard that shadows a later exact rule', async () => {
    const filename = await mutatedNetlify((text) => text.replace(
      '# section: dynamic << START',
      '# section: dynamic << START\n\n[[redirects]]\n  from="/docs/agent/*"\n  to="/docs/getting-started"',
    ));
    expect(() => verifyRedirectGraph(options(filename))).toThrow(/shadowed by wildcard/);
  });

  it('rejects wildcard-to-wildcard and exact-to-wildcard chains', async () => {
    const wildcardFilename = await mutatedNetlify((text) =>
      appendRule(appendRule(text, '/test/a/*', '/test/b/:splat'), '/test/b/*', '/docs/getting-started'),
    );
    expect(() => verifyRedirectGraph(options(wildcardFilename))).toThrow(/Wildcard redirect chain or cycle/);

    const exactFilename = await mutatedNetlify((text) =>
      appendRule(appendRule(text, '/test/destination/*', '/docs/getting-started'), '/test/exact', '/test/destination/value'),
    );
    expect(() => verifyRedirectGraph(options(exactFilename))).toThrow(/Redirect chain or cycle/);
  }, 15000);

  it('fails closed on unmodelled Netlify redirect fields', () => {
    expect(() => parseRedirects(
      '[[redirects]]\n  from="/old"\n  to="/new"\n  status=302\n',
    )).toThrow(/Unsupported or duplicate redirect field/);
  });

  it('requires the higher-precedence published _redirects file to be absent', async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-published-redirects-'));
    temporaryDirectories.push(directory);
    await fs.writeFile(path.join(directory, '_redirects'), '/old /new 301\n');
    expect(() => assertNoPublishedRedirects(directory)).toThrow(/would precede netlify\.toml/);
  });
});
