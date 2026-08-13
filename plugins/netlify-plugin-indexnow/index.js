const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const {getDeployStore} = require('@netlify/blobs');
const {SaxesParser} = require('saxes');

const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_REQUEST = 10_000;
const MAX_URL_LENGTH = 2_048;
const MAX_RECEIPT_BYTES = 24 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const STATE_PATH = path.resolve('.netlify/indexnow-state.json');
const STATE_VERSION = 2;
const RECEIPT_SCHEMA_VERSION = 2;
const RECEIPT_STORE = 'netdata-indexnow-receipts';
const SITEMAP_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9';

function codeUnitCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function validateInputs(inputs) {
  if (!inputs || typeof inputs !== 'object') {
    throw new Error('IndexNow plugin inputs are required');
  }

  const host = inputs.host;
  if (typeof host !== 'string' || host !== host.trim().toLowerCase()) {
    throw new Error('IndexNow host must be a lowercase hostname');
  }
  let hostUrl;
  try {
    hostUrl = new URL(`https://${host}/`);
  } catch {
    throw new Error('IndexNow host must be a valid hostname');
  }
  if (
    hostUrl.hostname !== host ||
    hostUrl.host !== host ||
    hostUrl.username ||
    hostUrl.password
  ) {
    throw new Error('IndexNow host must not contain a scheme, credentials, port, or path');
  }

  const key = inputs.key;
  if (typeof key !== 'string' || !/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    throw new Error('IndexNow key must contain 8-128 letters, digits, or dashes');
  }

  let keyLocation;
  try {
    keyLocation = new URL(inputs.keyLocation);
  } catch {
    throw new Error('IndexNow keyLocation must be a valid URL');
  }
  const expectedKeyLocation = `https://${host}/${key}.txt`;
  if (keyLocation.href !== expectedKeyLocation || inputs.keyLocation !== expectedKeyLocation) {
    throw new Error('IndexNow keyLocation must be the exact HTTPS root key file on the submitted host');
  }

  return {host, key, keyLocation: keyLocation.href};
}

function parseSitemapLocations(xml) {
  if (typeof xml !== 'string') throw new Error('Malformed sitemap XML: input is not text');
  const locations = [];
  const stack = [];
  let rootSeen = false;
  const fail = (message) => { throw new Error(`Malformed sitemap XML: ${message}`); };
  const parser = new SaxesParser({xmlns: true});

  parser.on('doctype', () => fail('DOCTYPE is not allowed'));
  parser.on('error', (error) => fail(error.message));
  parser.on('opentag', (node) => {
    const parent = stack.at(-1);
    if (!parent) {
      if (rootSeen || node.local !== 'urlset' || node.uri !== SITEMAP_NAMESPACE) {
        fail('expected one sitemap urlset root element');
      }
      rootSeen = true;
    } else if (parent.captureLocation) {
      fail('direct loc contains a child element');
    } else if (stack.length === 1 &&
        (node.local !== 'url' || node.uri !== SITEMAP_NAMESPACE)) {
      fail('urlset contains a non-sitemap URL child element');
    } else if (stack.length === 2 && parent.directUrl &&
        node.local === 'loc' && node.uri !== SITEMAP_NAMESPACE) {
      fail('direct loc is not in the sitemap root namespace');
    }

    const directUrl = stack.length === 1 && node.local === 'url' && node.uri === SITEMAP_NAMESPACE;
    const captureLocation = stack.length === 2 && parent.directUrl &&
      node.local === 'loc' && node.uri === SITEMAP_NAMESPACE;
    stack.push({
      name: node.name,
      localName: node.local,
      directUrl,
      captureLocation,
      location: directUrl ? null : undefined,
      text: captureLocation ? '' : undefined,
    });
  });
  const consumeText = (text) => {
    const current = stack.at(-1);
    if (current?.captureLocation) current.text += text;
    else if (!stack.length && text.trim()) fail('text outside the root element');
  };
  parser.on('text', consumeText);
  parser.on('cdata', consumeText);
  parser.on('closetag', (node) => {
    const current = stack.pop();
    if (!current || current.name !== node.name) fail(`mismatched closing tag ${node.name}`);
    if (current.captureLocation) {
      const parent = stack.at(-1);
      if (parent.location !== null) fail('URL contains multiple direct loc elements');
      parent.location = current.text.trim();
    }
    if (current.directUrl) {
      if (!current.location) fail('direct URL is missing a loc value');
      locations.push(current.location);
    }
  });

  try {
    parser.write(xml).close();
  } catch (error) {
    if (error.message.startsWith('Malformed sitemap XML:')) throw error;
    fail(error.message);
  }
  if (!rootSeen || stack.length) fail('incomplete document');
  return locations;
}

function strictPublicUrl(value, host) {
  try {
    if (typeof value !== 'string') return null;
    const origin = `https://${host}`;
    if (!value.startsWith(`${origin}/`)) return null;
    const rawPathname = value.slice(origin.length);
    if (
      !rawPathname.startsWith('/') ||
      rawPathname.includes('?') ||
      rawPathname.includes('#') ||
      /\\/.test(rawPathname) ||
      /\/{2,}/.test(rawPathname) ||
      /%(?![0-9a-f]{2})/i.test(rawPathname) ||
      /%(?:2f|5c)/i.test(rawPathname)
    ) {
      return null;
    }
    const decodedPathname = decodeURIComponent(rawPathname);
    if (
      /[\u0000-\u001f\u007f-\u009f]/u.test(decodedPathname) ||
      /\\/.test(decodedPathname) ||
      /\/{2,}/.test(decodedPathname) ||
      decodedPathname.split('/').some((segment) => segment === '.' || segment === '..')
    ) {
      return null;
    }
    const url = new URL(value);
    const pathname = url.pathname;
    const normalizedPathname = pathname.replace(/%[0-9a-f]{2}/gi, (encoded) => {
      const character = String.fromCharCode(Number.parseInt(encoded.slice(1), 16));
      return /[A-Za-z0-9._~-]/.test(character) ? character : encoded.toUpperCase();
    });
    if (
      url.protocol !== 'https:' ||
      url.hostname !== host ||
      url.host !== host ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      pathname !== normalizedPathname ||
      value !== url.href ||
      value.length > MAX_URL_LENGTH
    ) {
      return null;
    }
    return {url, decodedPathname};
  } catch {
    return null;
  }
}

function canonicalPublicUrl(value, host) {
  return strictPublicUrl(value, host)?.url || null;
}

function sitemapUrls(xml, host) {
  const urls = [];
  for (const value of parseSitemapLocations(xml)) {
    const url = canonicalPublicUrl(value, host);
    if (url) urls.push(url.href);
  }
  return [...new Set(urls)].sort(codeUnitCompare);
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative !== '' &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== '..' &&
    !path.isAbsolute(relative)
  );
}

async function publishedFileForUrl(publishDir, value) {
  const root = path.resolve(publishDir);
  const realRoot = await fs.realpath(root);
  let candidateUrl;
  try {
    candidateUrl = new URL(value);
  } catch {
    throw new Error(`Cannot map published URL to a file: ${value}`);
  }
  const parsed = strictPublicUrl(value, candidateUrl.hostname);
  if (!parsed) {
    throw new Error(`Cannot map published URL to a file: ${value}`);
  }
  const relativePath = parsed.decodedPathname.replace(/^\/|\/$/g, '');
  const candidates = relativePath
    ? [
        path.resolve(root, relativePath, 'index.html'),
        path.resolve(root, `${relativePath}.html`),
        path.resolve(root, relativePath),
      ]
    : [path.resolve(root, 'index.html')];

  const matches = [];
  for (const candidate of [...new Set(candidates)]) {
    if (candidate !== root && !isWithin(root, candidate)) {
      throw new Error(`Published URL escapes the output directory: ${value}`);
    }
    try {
      const stat = await fs.lstat(candidate);
      if (stat.isSymbolicLink()) {
        throw new Error(`Published URL maps to a symbolic link: ${value}`);
      }
      if (!stat.isFile()) continue;
      const realCandidate = await fs.realpath(candidate);
      const expectedRealCandidate = path.resolve(realRoot, path.relative(root, candidate));
      if (realCandidate !== expectedRealCandidate) {
        throw new Error(`Published URL maps through a symbolic link: ${value}`);
      }
      matches.push({candidate, realCandidate});
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
    }
  }

  if (matches.length > 1) {
    throw new Error(`Published URL maps to multiple files: ${value}`);
  }
  if (matches.length === 1) {
    const {candidate, realCandidate} = matches[0];
    return path.extname(candidate).toLowerCase() === '.html'
      ? {htmlPath: candidate, resolvedPath: realCandidate, skipped: false}
      : {htmlPath: null, resolvedPath: realCandidate, skipped: true};
  }

  throw new Error(`No published file found for ${value}`);
}

async function hashPublishedPages(publishDir, urls) {
  const pages = {};
  const skipped = [];
  const fileOwners = new Map();
  for (const url of urls) {
    const published = await publishedFileForUrl(publishDir, url);
    if (published.skipped) {
      skipped.push(url);
      continue;
    }
    const owner = fileOwners.get(published.resolvedPath);
    if (owner) {
      throw new Error(`Published URLs map to the same HTML file: ${owner} and ${url}`);
    }
    fileOwners.set(published.resolvedPath, url);
    const html = await fs.readFile(published.htmlPath);
    pages[url] = crypto.createHash('sha256').update(html).digest('hex');
  }
  return {pages, skipped};
}

function diffPages(previousPages, currentPages) {
  const added = [];
  const updated = [];
  const removed = [];
  for (const [url, hash] of Object.entries(currentPages)) {
    if (!Object.hasOwn(previousPages, url)) added.push(url);
    else if (previousPages[url] !== hash) updated.push(url);
  }
  for (const url of Object.keys(previousPages)) {
    if (!Object.hasOwn(currentPages, url)) removed.push(url);
  }
  added.sort(codeUnitCompare);
  updated.sort(codeUnitCompare);
  removed.sort(codeUnitCompare);
  return {
    added,
    updated,
    removed,
    all: [...added, ...updated, ...removed].sort(codeUnitCompare),
  };
}

function changedUrls(previousPages, currentPages) {
  return diffPages(previousPages, currentPages).all;
}

function chunks(values, size = MAX_URLS_PER_REQUEST) {
  if (!Number.isInteger(size) || size < 1 || size > MAX_URLS_PER_REQUEST) {
    throw new Error(`IndexNow batch size must be between 1 and ${MAX_URLS_PER_REQUEST}`);
  }
  return Array.from(
    {length: Math.ceil(values.length / size)},
    (_, index) => values.slice(index * size, (index + 1) * size),
  );
}

function validState(state, host) {
  if (
    state?.version !== STATE_VERSION ||
    state.host !== host ||
    !state.pages ||
    typeof state.pages !== 'object' ||
    Array.isArray(state.pages) ||
    !Object.keys(state.pages).length
  ) {
    return false;
  }
  return Object.entries(state.pages).every(([value, hash]) => {
    return canonicalPublicUrl(value, host) !== null && /^[0-9a-f]{64}$/.test(hash);
  });
}

function sortedPages(pages) {
  return Object.fromEntries(
    Object.entries(pages).sort(([left], [right]) => codeUnitCompare(left, right)),
  );
}

function stateBytes(host, pages) {
  return `${JSON.stringify({version: STATE_VERSION, host, pages: sortedPages(pages)}, null, 2)}\n`;
}

async function readState(statePath, host) {
  try {
    const contents = await fs.readFile(statePath, 'utf8');
    const state = JSON.parse(contents);
    if (!validState(state, host) || contents !== stateBytes(host, state.pages)) return null;
    return state;
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) return null;
    throw error;
  }
}

async function writeState(statePath, host, pages) {
  await atomicWrite(statePath, stateBytes(host, pages));
}

async function atomicWrite(filename, contents) {
  await fs.mkdir(path.dirname(filename), {recursive: true});
  const temporaryPath = `${filename}.tmp-${process.pid}-${crypto.randomUUID()}`;
  try {
    await fs.writeFile(temporaryPath, contents);
    await fs.rename(temporaryPath, filename);
  } finally {
    await fs.rm(temporaryPath, {force: true});
  }
}

async function readFileIfPresent(filename) {
  try {
    return await fs.readFile(filename);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function restoreLocalFile(filename, contents) {
  if (contents === null) {
    await fs.rm(filename, {force: true});
  } else {
    await atomicWrite(filename, contents);
  }
}

async function validateBuiltKeyFile(publishDir, key) {
  const keyPath = path.join(path.resolve(publishDir), `${key}.txt`);
  let stat;
  try {
    stat = await fs.lstat(keyPath);
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`IndexNow built root key file is missing: ${keyPath}`);
    throw error;
  }
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`IndexNow built root key artifact is not a regular non-symlink file: ${keyPath}`);
  }
  const contents = await fs.readFile(keyPath);
  if (!contents.equals(Buffer.from(key, 'utf8'))) {
    throw new Error('IndexNow built root key file bytes do not exactly match the configured key');
  }
  return keyPath;
}

async function persistState({statePath, host, pages, cache}) {
  const previousContents = await readFileIfPresent(statePath);
  await writeState(statePath, host, pages);
  try {
    const saved = await cache.save(statePath);
    if (saved !== true) throw new Error('Netlify cache save returned false');
  } catch (error) {
    try {
      await restoreLocalFile(statePath, previousContents);
    } catch (rollbackError) {
      throw new Error(
        `IndexNow state cache persistence failed (${error.message}) and local rollback failed (${rollbackError.message})`,
      );
    }
    throw new Error(`IndexNow state cache persistence failed; local state was rolled back: ${error.message}`);
  }
}

function validateSubmissionUrls(urls, host) {
  for (const value of urls) {
    if (!canonicalPublicUrl(value, host)) {
      throw new Error(`IndexNow payload URL is not canonical HTTPS on ${host}: ${value}`);
    }
  }
}

function requestDeadline(timeoutMs) {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    throw new Error('IndexNow request timeout must be a positive integer');
  }
  const controller = new AbortController();
  let expired = false;
  let rejectTimeout;
  const timeout = new Promise((_, reject) => {
    rejectTimeout = reject;
  });
  const timer = setTimeout(() => {
    expired = true;
    controller.abort();
    rejectTimeout(new Error(`IndexNow request exceeded ${timeoutMs}ms`));
  }, timeoutMs);
  return {
    signal: controller.signal,
    get expired() { return expired; },
    wait(promise) { return Promise.race([promise, timeout]); },
    clear() { clearTimeout(timer); },
  };
}

async function submitUrlBatches({
  urls,
  inputs,
  fetchImpl,
  logger,
  batchSize = MAX_URLS_PER_REQUEST,
  requestTimeoutMs = REQUEST_TIMEOUT_MS,
}) {
  const normalizedInputs = validateInputs(inputs);
  validateSubmissionUrls(urls, normalizedInputs.host);
  const batches = chunks(urls, batchSize);
  const accepted = [];
  const pending = [];
  const batchResults = [];

  for (const [index, urlList] of batches.entries()) {
    logger.log(`IndexNow request ${index + 1}/${batches.length}: ${urlList.length} URL(s).`);
    const deadline = requestDeadline(requestTimeoutMs);
    let phase = 'request';
    let httpStatus = null;
    let status = 'pending';
    let reason = 'transport-error';
    try {
      const response = await deadline.wait(
        Promise.resolve().then(() => fetchImpl(ENDPOINT, {
          method: 'POST',
          headers: {'content-type': 'application/json; charset=utf-8'},
          body: JSON.stringify({...normalizedInputs, urlList}),
          signal: deadline.signal,
        })),
      );
      httpStatus = Number.isInteger(response?.status) &&
        response.status >= 100 && response.status <= 599
        ? response.status
        : null;
      phase = 'response-body';
      if (typeof response?.text === 'function') {
        await deadline.wait(Promise.resolve().then(() => response.text()));
      }
      if (httpStatus === null) {
        reason = 'invalid-response';
      } else if (![200, 202].includes(httpStatus)) {
        reason = 'http-error';
      } else {
        status = 'accepted';
        reason = null;
        accepted.push(...urlList);
        logger.log(
          `IndexNow request ${index + 1}/${batches.length} returned HTTP ${httpStatus}; durable receipt pending.`,
        );
      }
    } catch {
      reason = deadline.expired
        ? 'timeout'
        : phase === 'response-body'
          ? 'response-body-error'
          : 'transport-error';
    } finally {
      deadline.clear();
    }
    if (status === 'pending') {
      pending.push(...urlList);
      logger.error(
        `IndexNow request ${index + 1}/${batches.length} failed for ${urlList.length} URL(s): ${reason}${httpStatus === null ? '' : ` (HTTP ${httpStatus})`}.`,
      );
    }
    batchResults.push({
      batch: index + 1,
      batchCount: batches.length,
      status,
      httpStatus,
      reason,
      urls: [...urlList],
    });
  }

  return {accepted, pending, batches: batchResults};
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort(codeUnitCompare).map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

function validateReceiptIdentity(deployId, siteId, commitRef) {
  if (typeof deployId !== 'string' || !deployId || typeof siteId !== 'string' || !siteId) {
    throw new Error('IndexNow receipt persistence requires Netlify DEPLOY_ID and SITE_ID');
  }
  if (
    commitRef !== null &&
    (typeof commitRef !== 'string' || !commitRef || commitRef !== commitRef.trim())
  ) {
    throw new Error('IndexNow receipt COMMIT_REF must be a non-empty string or null');
  }
}

function receiptDocument({host, batches, deployId, siteId, commitRef}) {
  validateReceiptIdentity(deployId, siteId, commitRef);
  const acceptedCount = batches
    .filter((batch) => batch.status === 'accepted')
    .reduce((total, batch) => total + batch.urls.length, 0);
  const pendingCount = batches
    .filter((batch) => batch.status === 'pending')
    .reduce((total, batch) => total + batch.urls.length, 0);
  return {
    schema_version: RECEIPT_SCHEMA_VERSION,
    producer: 'netdata/website-indexnow',
    endpoint: ENDPOINT,
    site_id: siteId,
    deploy_id: deployId,
    commit_ref: commitRef,
    host,
    batch_count: batches.length,
    accepted_url_count: acceptedCount,
    pending_url_count: pendingCount,
    url_count: acceptedCount + pendingCount,
    batches: batches.map((batch) => ({
      batch: batch.batch,
      batch_count: batch.batchCount,
      status: batch.status,
      http_status: batch.httpStatus,
      reason: batch.reason,
      url_count: batch.urls.length,
      urls: [...batch.urls],
    })),
  };
}

async function persistSubmissionReceipt({host, batches, deployId, siteId, commitRef, store}) {
  validateReceiptIdentity(deployId, siteId, commitRef);
  const receipt = receiptDocument({host, batches, deployId, siteId, commitRef});
  const contents = canonicalJson(receipt);
  if (Buffer.byteLength(contents) > MAX_RECEIPT_BYTES) {
    throw new Error(`IndexNow receipt exceeds ${MAX_RECEIPT_BYTES} bytes`);
  }
  const sha256 = crypto.createHash('sha256').update(contents).digest('hex');
  const blobKey = `receipts/${sha256}.json`;
  const receiptStore = store || getDeployStore({
    name: RECEIPT_STORE,
    deployID: deployId,
    siteID: siteId,
    consistency: 'strong',
  });
  try {
    const result = await receiptStore.set(blobKey, contents, {
      onlyIfNew: true,
      metadata: {schema_version: RECEIPT_SCHEMA_VERSION, sha256},
    });
    if (!result || typeof result.modified !== 'boolean') {
      throw new Error('Netlify Blob set returned an invalid result');
    }
    if (!result.modified) {
      const existing = await receiptStore.get(blobKey, {consistency: 'strong'});
      if (existing !== contents) {
        throw new Error('existing Netlify Blob does not match its content digest');
      }
    }
  } catch (error) {
    throw new Error(`IndexNow receipt persistence failed: ${error.message}`);
  }
  return {
    sha256,
    blobKey,
    batchCount: batches.length,
    acceptedCount: receipt.accepted_url_count,
    pendingCount: receipt.pending_url_count,
    urlCount: receipt.url_count,
    receipt,
  };
}

function advanceState(previousPages, currentPages, accepted) {
  const pages = {...previousPages};
  for (const url of accepted) {
    if (Object.hasOwn(currentPages, url)) pages[url] = currentPages[url];
    else delete pages[url];
  }
  return sortedPages(pages);
}

async function runOnSuccess({
  constants,
  inputs,
  utils,
  statePath = STATE_PATH,
  fetchImpl = globalThis.fetch,
  logger = console,
  batchSize = MAX_URLS_PER_REQUEST,
  requestTimeoutMs = REQUEST_TIMEOUT_MS,
  deployId = process.env.DEPLOY_ID,
  siteId = process.env.SITE_ID,
  commitRef = process.env.COMMIT_REF === undefined ? null : process.env.COMMIT_REF,
  receiptStore,
}) {
  const normalizedInputs = validateInputs(inputs);
  await validateBuiltKeyFile(constants.PUBLISH_DIR, normalizedInputs.key);
  validateReceiptIdentity(deployId, siteId, commitRef);
  const sitemapPath = path.join(constants.PUBLISH_DIR, 'sitemap.xml');
  const xml = await fs.readFile(sitemapPath, 'utf8');
  const urls = sitemapUrls(xml, normalizedInputs.host);
  if (!urls.length) {
    throw new Error(`No ${normalizedInputs.host} URLs found in ${sitemapPath}`);
  }

  const {pages: currentPages, skipped} = await hashPublishedPages(constants.PUBLISH_DIR, urls);
  if (!Object.keys(currentPages).length) {
    throw new Error(`No published HTML pages found for ${normalizedInputs.host}`);
  }
  if (skipped.length) {
    logger.log(`IndexNow ignored ${skipped.length} non-HTML sitemap URL(s).`);
  }

  const previousState = await readState(statePath, normalizedInputs.host);
  if (!previousState) {
    await persistState({
      statePath,
      host: normalizedInputs.host,
      pages: currentPages,
      cache: utils.cache,
    });
    logger.log(
      `IndexNow cache seeded with ${Object.keys(currentPages).length} published HTML pages; no bulk submission sent.`,
    );
    return {
      seeded: true,
      changes: {added: [], updated: [], removed: [], all: []},
      accepted: [],
      pending: [],
      batches: [],
      receipt: null,
    };
  }

  const changes = diffPages(previousState.pages, currentPages);
  logger.log(
    `IndexNow found ${changes.added.length} added, ${changes.updated.length} updated, and ${changes.removed.length} removed HTML URL(s).`,
  );

  const result = changes.all.length
    ? await submitUrlBatches({
        urls: changes.all,
        inputs: normalizedInputs,
        fetchImpl,
        logger,
        batchSize,
        requestTimeoutMs,
      })
    : {accepted: [], pending: [], batches: []};
  if (!changes.all.length) {
    logger.log(`IndexNow found no changed pages among ${Object.keys(currentPages).length} HTML URLs.`);
  }

  let receipt = null;
  if (result.batches.length) {
    receipt = await persistSubmissionReceipt({
      host: normalizedInputs.host,
      batches: result.batches,
      deployId,
      siteId,
      commitRef,
      store: receiptStore,
    });
    const status = receipt.pendingCount ? 'partial' : 'accepted';
    logger.log(
      `IndexNow receipt deploy=${deployId} digest=${receipt.sha256} urls=${receipt.urlCount} batches=${receipt.batchCount} accepted=${receipt.acceptedCount} pending=${receipt.pendingCount} status=${status}.`,
    );
  }

  const nextPages = advanceState(previousState.pages, currentPages, result.accepted);
  await persistState({
    statePath,
    host: normalizedInputs.host,
    pages: nextPages,
    cache: utils.cache,
  });
  if (result.pending.length) {
    logger.error(
      `IndexNow left ${result.pending.length} URL(s) pending after partial submission failure; accepted URLs were persisted.`,
    );
  }
  return {seeded: false, changes, ...result, receipt};
}

module.exports = {
  onPreBuild: async ({utils}) => {
    try {
      await utils.cache.restore(STATE_PATH);
    } catch (error) {
      console.warn(
        `IndexNow cache restore failed for ${path.basename(STATE_PATH)}; the deploy will continue: ${error.message}`,
      );
    }
  },
  onSuccess: async (event) => {
    const context = process.env.CONTEXT || event.netlifyConfig?.build?.environment?.CONTEXT;
    if (context !== 'production') {
      console.log(`IndexNow skipped non-production deploy context: ${context || 'unknown'}.`);
      return;
    }
    try {
      await runOnSuccess(event);
    } catch (error) {
      console.error(`IndexNow submission failed; the successful deploy remains valid: ${error.message}`);
    }
  },
  _test: {
    advanceState,
    canonicalJson,
    changedUrls,
    chunks,
    diffPages,
    hashPublishedPages,
    persistSubmissionReceipt,
    publishedFileForUrl,
    readState,
    receiptDocument,
    runOnSuccess,
    sitemapUrls,
    stateBytes,
    submitUrlBatches,
    validateBuiltKeyFile,
    validateInputs,
    validateSubmissionUrls,
  },
};
