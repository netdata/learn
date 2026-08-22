#!/usr/bin/env node

import dns from 'node:dns/promises';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const INVENTORY_SCHEMA = 'netdata-rendered-link-inventory-v1';
export const POLICY_SCHEMA = 'netdata-rendered-link-policy-v1';
const SOURCE_EXAMPLE_LIMIT = 20;
const REPORT_ITEM_LIMIT = 100;

export class LinkIntegrityError extends Error {}
export class UnsafeTargetError extends LinkIntegrityError {}

function requireString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new LinkIntegrityError(`${label} must be a non-empty string`);
  }
  return value;
}

function requireInteger(value, label, minimum, maximum) {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new LinkIntegrityError(`${label} must be an integer from ${minimum} through ${maximum}`);
  }
  return value;
}

export function validatePolicy(policy) {
  if (!policy || policy.schema !== POLICY_SCHEMA) {
    throw new LinkIntegrityError(`policy schema must be ${POLICY_SCHEMA}`);
  }
  const origin = new URL(requireString(policy.site_origin, 'site_origin'));
  if (
    origin.protocol !== 'https:' || origin.username || origin.password ||
    origin.pathname !== '/' || origin.search || origin.hash
  ) {
    throw new LinkIntegrityError('site_origin must be an HTTPS origin without credentials, path, query, or fragment');
  }
  const domain = requireString(policy.netdata_domain, 'netdata_domain').toLowerCase();
  if (domain.startsWith('.') || domain.endsWith('.') || !domain.includes('.')) {
    throw new LinkIntegrityError('netdata_domain must be a DNS suffix without surrounding dots');
  }
  const request = policy.request ?? {};
  if (!Array.isArray(policy.opaque_fragment_hosts)) {
    throw new LinkIntegrityError('opaque_fragment_hosts must be an array');
  }
  const opaqueFragmentHosts = policy.opaque_fragment_hosts.map((value) => {
    const host = requireString(value, 'opaque_fragment_hosts entry').toLowerCase();
    if (!isNetdataHost(host, domain)) {
      throw new LinkIntegrityError(`opaque fragment host is outside netdata_domain: ${host}`);
    }
    return host;
  });
  if (new Set(opaqueFragmentHosts).size !== opaqueFragmentHosts.length) {
    throw new LinkIntegrityError('opaque_fragment_hosts contains a duplicate');
  }
  return {
    schema: POLICY_SCHEMA,
    site_origin: origin.origin,
    netdata_domain: domain,
    opaque_fragment_hosts: opaqueFragmentHosts.sort(),
    request: {
      concurrency: requireInteger(request.concurrency, 'request.concurrency', 1, 32),
      per_host_concurrency: requireInteger(
        request.per_host_concurrency,
        'request.per_host_concurrency',
        1,
        8,
      ),
      timeout_ms: requireInteger(request.timeout_ms, 'request.timeout_ms', 1000, 60000),
      max_redirects: requireInteger(request.max_redirects, 'request.max_redirects', 0, 10),
      max_body_bytes: requireInteger(
        request.max_body_bytes,
        'request.max_body_bytes',
        1024,
        8 * 1024 * 1024,
      ),
      user_agent: requireString(request.user_agent, 'request.user_agent'),
    },
  };
}

export async function readPolicy(filename) {
  return validatePolicy(JSON.parse(await fsp.readFile(filename, 'utf8')));
}

function sortedDirectoryEntries(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).sort((left, right) =>
    left.name.localeCompare(right.name, 'en'));
}

export function listBuildFiles(buildDirectory) {
  const root = path.resolve(buildDirectory);
  if (!fs.statSync(root).isDirectory()) {
    throw new LinkIntegrityError(`build directory is not a directory: ${root}`);
  }
  const files = [];
  const pending = [root];
  while (pending.length) {
    const directory = pending.pop();
    for (const entry of sortedDirectoryEntries(directory).reverse()) {
      const filename = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new LinkIntegrityError(`rendered output contains a symbolic link: ${filename}`);
      }
      if (entry.isDirectory()) pending.push(filename);
      else if (entry.isFile()) files.push(filename);
    }
  }
  return files.sort();
}

function slashPath(relativeFilename) {
  return `/${relativeFilename.split(path.sep).join('/')}`;
}

export function htmlRouteIdentity(relativeFilename) {
  const relative = relativeFilename.split(path.sep).join('/');
  if (relative === 'index.html') {
    return {source_route: '/', routes: ['/', '/index.html']};
  }
  if (relative.endsWith('/index.html')) {
    const directory = `/${relative.slice(0, -'index.html'.length)}`;
    return {
      source_route: directory,
      routes: [directory.slice(0, -1), directory, `${directory}index.html`],
    };
  }
  const exact = `/${relative}`;
  return {
    source_route: exact,
    routes: relative.endsWith('.html') ? [exact, exact.slice(0, -'.html'.length)] : [exact],
  };
}

function walkHtml(root, visitor) {
  const pending = [root];
  while (pending.length) {
    const node = pending.pop();
    visitor(node);
    for (let index = (node.childNodes?.length ?? 0) - 1; index >= 0; index -= 1) {
      pending.push(node.childNodes[index]);
    }
    if (node.content) pending.push(node.content);
  }
}

function attribute(node, name) {
  return node.attrs?.find((item) => item.name === name)?.value;
}

function inferInvalidScope(href, siteHost) {
  const value = href.trim().toLowerCase();
  if (/^(?:mailto|tel|sms|javascript|data|blob):/.test(value)) return 'ignored';
  if (value.startsWith('//')) {
    return value.startsWith(`//${siteHost.toLowerCase()}`) ? 'same-site' : 'network';
  }
  if (/^[a-z][a-z0-9+.-]*:/.test(value)) {
    return value.startsWith(`http://${siteHost.toLowerCase()}`) ||
      value.startsWith(`https://${siteHost.toLowerCase()}`) ? 'same-site' : 'network';
  }
  return 'same-site';
}

function addAggregatedLink(links, target, source) {
  let item = links.get(target);
  if (!item) {
    item = {url: target, occurrences: 0, sources: []};
    links.set(target, item);
  }
  item.occurrences += 1;
  if (item.sources.length < SOURCE_EXAMPLE_LIMIT && !item.sources.includes(source)) {
    item.sources.push(source);
  }
}

export function normalizeUrlPath(pathname) {
  const decoded = pathname.split('/').map((segment) => {
    let value;
    try {
      value = decodeURIComponent(segment);
    } catch {
      throw new LinkIntegrityError(`path contains an invalid percent escape: ${pathname}`);
    }
    if (value.includes('/') || value.includes('\\') || value.includes('\0')) {
      throw new LinkIntegrityError(`path contains an encoded separator or NUL: ${pathname}`);
    }
    return value;
  }).join('/');
  return decoded || '/';
}

export function decodeFragment(hash) {
  if (!hash || hash === '#') return '';
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    throw new LinkIntegrityError(`fragment contains an invalid percent escape: ${hash}`);
  }
}

export function parseRedirectSources(text, siteOrigin) {
  const site = new URL(siteOrigin);
  const sources = [];
  for (const block of text.matchAll(/(?:^|\n)\s*\[\[redirects\]\]([\s\S]*?)(?=(?:\n\s*\[\[)|$)/g)) {
    const match = block[1].match(/(?:^|\n)\s*from\s*=\s*"([^"]+)"/);
    if (!match) continue;
    let source = match[1];
    if (/^https?:\/\//i.test(source)) {
      const absolute = new URL(source);
      if (absolute.hostname.toLowerCase() !== site.hostname.toLowerCase()) continue;
      source = absolute.pathname;
    }
    if (!source.startsWith('/') || /[?#]/.test(source)) continue;
    sources.push(normalizeUrlPath(source));
  }
  return [...new Set(sources)].sort();
}

function redirectPatternRegex(pattern) {
  let expression = '^';
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index];
    if (character === '*') {
      expression += '.*';
      continue;
    }
    if (character === ':') {
      let end = index + 1;
      while (end < pattern.length && /[a-z0-9_]/i.test(pattern[end])) end += 1;
      if (end > index + 1) {
        expression += '[^/]+';
        index = end - 1;
        continue;
      }
    }
    expression += character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`${expression}$`);
}

export function redirectMatches(pathname, patterns) {
  return patterns.some((pattern) => redirectPatternRegex(pattern).test(pathname));
}

export async function inventoryRenderedSite({buildDirectory, policy, redirectsFilename}) {
  const validatedPolicy = validatePolicy(policy);
  const buildRoot = path.resolve(buildDirectory);
  const files = listBuildFiles(buildRoot);
  const htmlFiles = files.filter((filename) => filename.toLowerCase().endsWith('.html'));
  if (htmlFiles.length === 0) {
    throw new LinkIntegrityError(`rendered output contains no HTML files: ${buildRoot}`);
  }
  const {parse} = await import('parse5');
  const site = new URL(validatedPolicy.site_origin);
  const links = new Map();
  const invalidLinks = [];
  const unsupportedSchemes = new Map();
  const htmlPages = [];

  for (const filename of htmlFiles) {
    const relative = path.relative(buildRoot, filename);
    const identity = htmlRouteIdentity(relative);
    const document = parse(await fsp.readFile(filename, 'utf8'));
    const fragments = new Set();
    let baseHref = null;
    let canonicalHref = null;
    walkHtml(document, (node) => {
      const id = attribute(node, 'id');
      if (id) fragments.add(id);
      if (node.nodeName === 'a') {
        const name = attribute(node, 'name');
        if (name) fragments.add(name);
      }
      if (baseHref === null && node.nodeName === 'base') {
        const href = attribute(node, 'href');
        if (href !== undefined) baseHref = href;
      }
      if (canonicalHref === null && node.nodeName === 'link') {
        const rel = attribute(node, 'rel') ?? '';
        const href = attribute(node, 'href');
        if (href !== undefined && rel.split(/\s+/).some((token) => token.toLowerCase() === 'canonical')) {
          canonicalHref = href;
        }
      }
    });

    let sourceUrl = new URL(identity.source_route, site);
    if (canonicalHref !== null) {
      try {
        const canonical = new URL(canonicalHref, sourceUrl);
        if (!['http:', 'https:'].includes(canonical.protocol) || canonical.username || canonical.password ||
            !sameHostname(canonical.hostname, site.hostname)) {
          throw new LinkIntegrityError('canonical URL is not credential-free HTTP(S) on the site host');
        }
        sourceUrl = canonical;
      } catch (error) {
        invalidLinks.push({
          source: identity.source_route,
          href: canonicalHref,
          scope: inferInvalidScope(canonicalHref, site.hostname),
          error: `invalid canonical href: ${error.message}`,
        });
      }
    }
    const sourceRoute = `${sourceUrl.pathname}${sourceUrl.search}`;
    let baseUrl = sourceUrl;
    if (baseHref !== null) {
      try {
        baseUrl = new URL(baseHref, baseUrl);
        if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password) {
          throw new LinkIntegrityError('base URL is not credential-free HTTP(S)');
        }
      } catch (error) {
        invalidLinks.push({
          source: sourceRoute,
          href: baseHref,
          scope: inferInvalidScope(baseHref, site.hostname),
          error: `invalid base href: ${error.message}`,
        });
        baseUrl = sourceUrl;
      }
    }

    walkHtml(document, (node) => {
      if (node.nodeName !== 'a' && node.nodeName !== 'area') return;
      const href = attribute(node, 'href');
      if (href === undefined) return;
      try {
        const target = new URL(href, baseUrl);
        if (!['http:', 'https:'].includes(target.protocol)) {
          unsupportedSchemes.set(
            target.protocol,
            (unsupportedSchemes.get(target.protocol) ?? 0) + 1,
          );
          return;
        }
        if (target.username || target.password) {
          throw new LinkIntegrityError('URL credentials are not supported');
        }
        addAggregatedLink(links, target.href, sourceRoute);
      } catch (error) {
        const scope = inferInvalidScope(href, site.hostname);
        if (scope !== 'ignored') {
          invalidLinks.push({
            source: sourceRoute,
            href,
            scope,
            error: error.message,
          });
        }
      }
    });
    htmlPages.push({
      source_route: sourceRoute,
      routes: [...new Set(identity.routes)].sort(),
      fragments: [...fragments].sort(),
    });
  }

  const fileRoutes = files.map((filename) => slashPath(path.relative(buildRoot, filename))).sort();
  const redirects = redirectsFilename
    ? parseRedirectSources(await fsp.readFile(redirectsFilename, 'utf8'), site.origin)
    : [];
  return {
    schema: INVENTORY_SCHEMA,
    site_origin: site.origin,
    html_files: htmlFiles.length,
    rendered_files: files.length,
    file_routes: fileRoutes,
    html_pages: htmlPages.sort((left, right) => left.source_route.localeCompare(right.source_route, 'en')),
    redirect_sources: redirects,
    links: [...links.values()].map((item) => ({...item, sources: item.sources.sort()}))
      .sort((left, right) => left.url.localeCompare(right.url, 'en')),
    invalid_links: invalidLinks.sort((left, right) =>
      `${left.source}\0${left.href}`.localeCompare(`${right.source}\0${right.href}`, 'en')),
    unsupported_schemes: Object.fromEntries([...unsupportedSchemes].sort()),
  };
}

export function validateInventory(inventory) {
  if (!inventory || inventory.schema !== INVENTORY_SCHEMA) {
    throw new LinkIntegrityError(`inventory schema must be ${INVENTORY_SCHEMA}`);
  }
  if (!Array.isArray(inventory.file_routes) || !Array.isArray(inventory.html_pages) ||
      !Array.isArray(inventory.links) || !Array.isArray(inventory.invalid_links) ||
      !Array.isArray(inventory.redirect_sources)) {
    throw new LinkIntegrityError('inventory arrays are missing or malformed');
  }
  const origin = new URL(inventory.site_origin);
  return {...inventory, site_origin: origin.origin};
}

function htmlRouteMap(inventory) {
  const routes = new Map();
  for (const page of inventory.html_pages) {
    const fragments = new Set(page.fragments);
    for (const route of page.routes) {
      const existing = routes.get(route);
      if (existing && existing.page.source_route !== page.source_route) {
        throw new LinkIntegrityError(
          `rendered HTML route ${route} is owned by both ${existing.page.source_route} and ${page.source_route}`,
        );
      }
      routes.set(route, {page, fragments});
    }
  }
  return routes;
}

function sameHostname(left, right) {
  return left.toLowerCase() === right.toLowerCase();
}

export function checkSameSite(inventoryInput) {
  const inventory = validateInventory(inventoryInput);
  const site = new URL(inventory.site_origin);
  const files = new Set(inventory.file_routes);
  const htmlRoutes = htmlRouteMap(inventory);
  const findings = inventory.invalid_links
    .filter((item) => item.scope === 'same-site')
    .map((item) => ({kind: 'invalid-link', ...item}));
  let checked = 0;
  for (const link of inventory.links) {
    const target = new URL(link.url);
    if (!sameHostname(target.hostname, site.hostname)) continue;
    checked += 1;
    if (target.port) {
      findings.push({
        kind: 'invalid-target',
        target: link.url,
        sources: link.sources,
        error: `same-site URL uses non-default port ${target.port}`,
      });
      continue;
    }
    let pathname;
    let fragment;
    try {
      pathname = normalizeUrlPath(target.pathname);
      fragment = decodeFragment(target.hash);
    } catch (error) {
      findings.push({kind: 'invalid-target', target: link.url, sources: link.sources, error: error.message});
      continue;
    }
    const html = htmlRoutes.get(pathname);
    const exists = Boolean(html) || files.has(pathname) || redirectMatches(pathname, inventory.redirect_sources);
    if (!exists) {
      findings.push({kind: 'missing-path', target: link.url, pathname, sources: link.sources});
      continue;
    }
    if (fragment && !fragment.startsWith(':~:text=') && html && !html.fragments.has(fragment)) {
      findings.push({kind: 'missing-fragment', target: link.url, pathname, fragment, sources: link.sources});
    }
  }
  return {checked, findings};
}

export function isNetdataHost(hostname, domain) {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  const suffix = domain.toLowerCase().replace(/\.$/, '');
  return host === suffix || host.endsWith(`.${suffix}`);
}

export function networkTargets(inventoryInput, policyInput, kind) {
  const inventory = validateInventory(inventoryInput);
  const policy = validatePolicy(policyInput);
  if (inventory.site_origin !== policy.site_origin) {
    throw new LinkIntegrityError('inventory site_origin does not match policy site_origin');
  }
  const site = new URL(inventory.site_origin);
  return inventory.links.filter((item) => {
    const target = new URL(item.url);
    const sameSite = sameHostname(target.hostname, site.hostname);
    const netdata = isNetdataHost(target.hostname, policy.netdata_domain);
    if (kind === 'cross-site') return !sameSite && netdata;
    if (kind === 'third-party') return !sameSite && !netdata;
    throw new LinkIntegrityError(`unsupported network target kind: ${kind}`);
  });
}

function invalidNetworkIdentities(inventory) {
  return new Set(inventory.invalid_links
    .filter((item) => item.scope === 'network')
    .map((item) => `${item.href}\0${item.error}`));
}

export function newlyIntroducedThirdParty(headInput, baseInput, policyInput) {
  const head = validateInventory(headInput);
  const base = validateInventory(baseInput);
  const policy = validatePolicy(policyInput);
  const baseTargets = new Set(networkTargets(base, {...policy, site_origin: base.site_origin}, 'third-party')
    .map((item) => item.url));
  const targets = networkTargets(head, policy, 'third-party')
    .filter((item) => !baseTargets.has(item.url));
  const baseInvalid = invalidNetworkIdentities(base);
  const invalid = head.invalid_links.filter((item) =>
    item.scope === 'network' && !baseInvalid.has(`${item.href}\0${item.error}`));
  return {targets, invalid};
}

const blockedIPv4Addresses = new net.BlockList();
for (const [network, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
  ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
  ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24],
  ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) blockedIPv4Addresses.addSubnet(network, prefix, 'ipv4');
const blockedIPv6Addresses = new net.BlockList();
for (const [network, prefix] of [
  ['::', 128], ['::1', 128], ['100::', 64], ['2001:db8::', 32],
  ['fc00::', 7], ['fe80::', 10], ['ff00::', 8],
]) blockedIPv6Addresses.addSubnet(network, prefix, 'ipv6');

export function isPublicAddress(address, family = net.isIP(address)) {
  if (family !== 4 && family !== 6) return false;
  if (family === 6 && address.toLowerCase().startsWith('::ffff:')) return false;
  return family === 4 ?
    !blockedIPv4Addresses.check(address, 'ipv4') :
    !blockedIPv6Addresses.check(address, 'ipv6');
}

function unbracket(hostname) {
  return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
}

export async function resolvePublicDestination(hostname, lookup = dns.lookup) {
  const host = unbracket(hostname);
  const literalFamily = net.isIP(host);
  const addresses = literalFamily ? [{address: host, family: literalFamily}] :
    await lookup(host, {all: true, verbatim: true});
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error(`DNS returned no addresses for ${hostname}`);
  }
  const unsafe = addresses.find(({address, family}) => !isPublicAddress(address, family));
  if (unsafe) {
    throw new UnsafeTargetError(`destination ${hostname} resolves to non-public address ${unsafe.address}`);
  }
  return addresses[0];
}

export function fixedDestinationLookup(resolved) {
  return (_hostname, options, callback) => {
    if (options?.all) {
      callback(null, [resolved]);
      return;
    }
    callback(null, resolved.address, resolved.family);
  };
}

export function classifyHttpStatus(status) {
  if (status >= 200 && status < 300) return 'ok';
  if (status === 404 || status === 410) return 'broken';
  return 'inconclusive';
}

export function boundedResponseIsPartial(status, headers) {
  const contentRange = String(headers['content-range'] ?? '');
  const rangeMatch = /^bytes\s+\d+-(\d+)\/(\d+|\*)$/i.exec(contentRange);
  return status === 206 && (
    !rangeMatch || rangeMatch[2] === '*' || Number(rangeMatch[1]) + 1 < Number(rangeMatch[2])
  );
}

async function responseFragments(html) {
  const {parse} = await import('parse5');
  const fragments = new Set();
  walkHtml(parse(html), (node) => {
    const id = attribute(node, 'id');
    if (id) fragments.add(id);
    if (node.nodeName === 'a') {
      const name = attribute(node, 'name');
      if (name) fragments.add(name);
    }
  });
  return fragments;
}

function defaultPort(url) {
  return url.protocol === 'https:' ? '443' : '80';
}

async function requestOnce(url, requestPolicy, dependencies = {}) {
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new UnsafeTargetError(`unsupported network protocol ${url.protocol}`);
  }
  if (url.username || url.password) throw new UnsafeTargetError('URL credentials are not supported');
  if (url.port && url.port !== defaultPort(url)) {
    throw new UnsafeTargetError(`non-default network port is not allowed: ${url.port}`);
  }
  const resolved = await resolvePublicDestination(url.hostname, dependencies.lookup ?? dns.lookup);
  const transport = url.protocol === 'https:' ? https : http;
  return await new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      callback(value);
    };
    const request = transport.request({
      protocol: url.protocol,
      hostname: unbracket(url.hostname),
      port: url.port || defaultPort(url),
      path: `${url.pathname}${url.search}`,
      method: 'GET',
      headers: {
        'User-Agent': requestPolicy.user_agent,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
        'Accept-Encoding': 'identity',
        Range: `bytes=0-${requestPolicy.max_body_bytes - 1}`,
      },
      lookup: fixedDestinationLookup(resolved),
    }, (response) => {
      const status = response.statusCode ?? 0;
      const location = response.headers.location;
      const redirect = [301, 302, 303, 307, 308].includes(status) && typeof location === 'string';
      if (redirect) {
        response.destroy();
        finish(resolve, {status, location});
        return;
      }
      const classification = classifyHttpStatus(status);
      if (classification !== 'ok' || !url.hash) {
        response.destroy();
        finish(resolve, {status, classification, headers: response.headers});
        return;
      }
      const contentType = String(response.headers['content-type'] ?? '').toLowerCase();
      const encoding = String(response.headers['content-encoding'] ?? 'identity').toLowerCase();
      const partialBody = boundedResponseIsPartial(status, response.headers);
      if ((!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) ||
          (encoding && encoding !== 'identity')) {
        response.destroy();
        finish(resolve, {
          status,
          classification: 'inconclusive',
          reason: 'fragment target did not return uncompressed HTML',
        });
        return;
      }
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > requestPolicy.max_body_bytes) {
          response.destroy();
          finish(resolve, {
            status,
            classification: 'inconclusive',
            reason: `fragment response exceeded ${requestPolicy.max_body_bytes} bytes`,
          });
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', async () => {
        try {
          const fragment = decodeFragment(url.hash);
          const fragments = await responseFragments(Buffer.concat(chunks).toString('utf8'));
          if (fragments.has(fragment)) {
            finish(resolve, {status, classification: 'ok'});
          } else if (partialBody) {
            finish(resolve, {
              status,
              classification: 'inconclusive',
              reason: 'fragment was not present in the bounded partial response',
            });
          } else {
            finish(resolve, {status, classification: 'broken', reason: `fragment not found: #${fragment}`});
          }
        } catch (error) {
          finish(reject, error);
        }
      });
      response.on('error', (error) => finish(reject, error));
    });
    request.on('error', (error) => finish(reject, error));
    const deadline = setTimeout(() => {
      request.destroy(new Error(`request exceeded ${requestPolicy.timeout_ms} ms`));
    }, requestPolicy.timeout_ms);
    request.end();
  });
}

export async function probeUrl(target, requestPolicy, dependencies = {}) {
  let current;
  try {
    current = new URL(target);
  } catch (error) {
    return {url: target, status: 'unsafe', reason: `invalid URL: ${error.message}`};
  }
  const seen = new Set();
  try {
    for (let redirects = 0; redirects <= requestPolicy.max_redirects; redirects += 1) {
      const identity = current.href;
      if (seen.has(identity)) {
        return {url: target, final_url: identity, status: 'broken', reason: 'redirect cycle'};
      }
      seen.add(identity);
      const response = await (dependencies.requestOnce ?? requestOnce)(current, requestPolicy, dependencies);
      if (response.location) {
        if (redirects === requestPolicy.max_redirects) {
          return {url: target, final_url: identity, status: 'broken', reason: 'redirect limit exceeded'};
        }
        const redirected = new URL(response.location, current);
        if (current.hash && !response.location.includes('#')) redirected.hash = current.hash;
        current = redirected;
        continue;
      }
      return {
        url: target,
        final_url: current.href,
        http_status: response.status,
        status: response.classification,
        ...(response.reason ? {reason: response.reason} : {}),
      };
    }
  } catch (error) {
    return {
      url: target,
      final_url: current.href,
      status: error instanceof UnsafeTargetError ? 'unsafe' : 'inconclusive',
      reason: error.message,
    };
  }
  return {url: target, final_url: current.href, status: 'inconclusive', reason: 'probe ended unexpectedly'};
}

export async function runWithLimits(items, {concurrency, perHostConcurrency}, worker) {
  const pending = items.map((item, index) => ({item, index}));
  const results = new Array(items.length);
  const activeByHost = new Map();
  let active = 0;
  return await new Promise((resolve, reject) => {
    const pump = () => {
      if (pending.length === 0 && active === 0) {
        resolve(results);
        return;
      }
      let started = false;
      while (active < concurrency) {
        const position = pending.findIndex(({item}) => {
          const host = new URL(item.url).hostname.toLowerCase();
          return (activeByHost.get(host) ?? 0) < perHostConcurrency;
        });
        if (position < 0) break;
        const [{item, index}] = pending.splice(position, 1);
        const host = new URL(item.url).hostname.toLowerCase();
        active += 1;
        activeByHost.set(host, (activeByHost.get(host) ?? 0) + 1);
        started = true;
        Promise.resolve(worker(item)).then((result) => {
          results[index] = result;
        }, reject).finally(() => {
          active -= 1;
          activeByHost.set(host, activeByHost.get(host) - 1);
          pump();
        });
      }
      if (!started && active === 0 && pending.length) {
        reject(new LinkIntegrityError('request scheduler could not make progress'));
      }
    };
    pump();
  });
}

export async function probeTargets(targets, policyInput, probe = probeUrl) {
  const policy = validatePolicy(policyInput);
  const unique = [...new Map(targets.map((item) => [item.url, item])).values()]
    .sort((left, right) => left.url.localeCompare(right.url, 'en'));
  const results = await runWithLimits(unique, {
    concurrency: policy.request.concurrency,
    perHostConcurrency: policy.request.per_host_concurrency,
  }, async (item) => {
    const target = new URL(item.url);
    const opaqueFragment = target.hash && (
      target.hash.startsWith('#:~:text=') ||
      policy.opaque_fragment_hosts.includes(target.hostname.toLowerCase())
    );
    if (opaqueFragment) target.hash = '';
    return {
      ...await probe(target.href, policy.request),
      url: item.url,
      ...(opaqueFragment ? {probed_url: target.href} : {}),
      occurrences: item.occurrences,
      sources: item.sources,
    };
  });
  return {
    checked: results.length,
    findings: results.filter((item) => item.status === 'broken' || item.status === 'unsafe'),
    warnings: results.filter((item) => item.status === 'inconclusive'),
    results,
  };
}

function commandLine(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--') || index + 1 >= rest.length || rest[index + 1].startsWith('--')) {
      throw new LinkIntegrityError(`expected --name value, received ${token}`);
    }
    const name = token.slice(2);
    if (Object.hasOwn(options, name)) throw new LinkIntegrityError(`duplicate option --${name}`);
    options[name] = rest[index + 1];
    index += 1;
  }
  return {command, options};
}

function option(options, name) {
  return requireString(options[name], `--${name}`);
}

async function readInventory(filename) {
  return validateInventory(JSON.parse(await fsp.readFile(filename, 'utf8')));
}

function displayItem(item) {
  const target = item.target ?? item.url ?? item.href ?? '(unknown target)';
  const reason = item.reason ?? item.error ?? item.kind ?? item.status;
  const sources = item.sources ?? (item.source ? [item.source] : []);
  return `${target} — ${reason}${sources.length ? ` — from ${sources.slice(0, 3).join(', ')}` : ''}`;
}

function markdownCode(value) {
  return String(value).replaceAll('`', '\\`').replaceAll('\r', ' ').replaceAll('\n', ' ');
}

async function appendJobSummary(title, report) {
  const filename = process.env.GITHUB_STEP_SUMMARY;
  if (!filename) return;
  const lines = [
    `## ${title}`,
    '',
    `- Checked: ${report.checked ?? 0}`,
    `- Confirmed failures: ${report.findings.length}`,
    `- Inconclusive warnings: ${report.warnings?.length ?? 0}`,
  ];
  if (report.findings.length) {
    lines.push('', '### Confirmed failures', '');
    for (const item of report.findings.slice(0, REPORT_ITEM_LIMIT)) {
      lines.push(`- \`${markdownCode(displayItem(item))}\``);
    }
  }
  if (report.warnings?.length) {
    lines.push('', '### Inconclusive', '');
    for (const item of report.warnings.slice(0, REPORT_ITEM_LIMIT)) {
      lines.push(`- \`${markdownCode(displayItem(item))}\``);
    }
  }
  if (report.findings.length > REPORT_ITEM_LIMIT || (report.warnings?.length ?? 0) > REPORT_ITEM_LIMIT) {
    lines.push('', 'The JSON report contains the complete result set.');
  }
  await fsp.appendFile(filename, `${lines.join('\n')}\n`);
}

async function finishReport(title, report, reportFilename) {
  const normalized = {warnings: [], ...report};
  if (reportFilename) await fsp.writeFile(reportFilename, `${JSON.stringify(normalized, null, 2)}\n`);
  await appendJobSummary(title, normalized);
  console.log(`${title}: checked=${normalized.checked ?? 0} failures=${normalized.findings.length} warnings=${normalized.warnings.length}`);
  for (const item of normalized.findings.slice(0, REPORT_ITEM_LIMIT)) console.error(`FAIL ${displayItem(item)}`);
  for (const item of normalized.warnings.slice(0, REPORT_ITEM_LIMIT)) console.warn(`WARN ${displayItem(item)}`);
  return normalized.findings.length ? 1 : 0;
}

function usage() {
  return [
    'Usage:',
    '  check.mjs inventory --build-dir DIR --redirects FILE --policy FILE --output FILE',
    '  check.mjs same-site --inventory FILE [--report FILE]',
    '  check.mjs cross-site --inventory FILE --policy FILE [--report FILE]',
    '  check.mjs new-third-party --head-inventory FILE --base-inventory FILE --policy FILE [--report FILE]',
  ].join('\n');
}

export async function main(argv = process.argv.slice(2)) {
  const {command, options} = commandLine(argv);
  if (command === 'inventory') {
    const policy = await readPolicy(option(options, 'policy'));
    const inventory = await inventoryRenderedSite({
      buildDirectory: option(options, 'build-dir'),
      redirectsFilename: option(options, 'redirects'),
      policy,
    });
    await fsp.writeFile(option(options, 'output'), `${JSON.stringify(inventory, null, 2)}\n`);
    console.log(`Inventoried ${inventory.html_files} HTML files, ${inventory.rendered_files} rendered files, and ${inventory.links.length} unique HTTP(S) targets.`);
    return 0;
  }
  if (command === 'same-site') {
    const result = checkSameSite(await readInventory(option(options, 'inventory')));
    return await finishReport('Required same-site links', {...result, warnings: []}, options.report);
  }
  if (command === 'cross-site') {
    const policy = await readPolicy(option(options, 'policy'));
    const targets = networkTargets(await readInventory(option(options, 'inventory')), policy, 'cross-site');
    return await finishReport(
      'Advisory cross-site links',
      await probeTargets(targets, policy),
      options.report,
    );
  }
  if (command === 'new-third-party') {
    const policy = await readPolicy(option(options, 'policy'));
    const introduced = newlyIntroducedThirdParty(
      await readInventory(option(options, 'head-inventory')),
      await readInventory(option(options, 'base-inventory')),
      policy,
    );
    const report = await probeTargets(introduced.targets, policy);
    report.findings.unshift(...introduced.invalid.map((item) => ({
      status: 'unsafe',
      reason: item.error,
      url: item.href,
      sources: [item.source],
    })));
    return await finishReport('Advisory new third-party links', report, options.report);
  }
  throw new LinkIntegrityError(`${usage()}\n\nUnknown command: ${command ?? '(missing)'}`);
}

const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invoked === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = await main();
  } catch (error) {
    console.error(`Link integrity contract error: ${error.message}`);
    process.exitCode = 2;
  }
}
