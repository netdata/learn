const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS_PER_REQUEST = 10_000;
const STATE_PATH = path.resolve('.netlify/indexnow-state.json');

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function sitemapUrls(xml, host) {
  const urls = [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()))
    .filter((value) => {
      try {
        return new URL(value).hostname === host;
      } catch {
        return false;
      }
    });
  return [...new Set(urls)].sort();
}

async function htmlPathForUrl(publishDir, url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  const relativePath = pathname.replace(/^\/+|\/+$/g, '');
  const candidates = relativePath
    ? [
        path.join(publishDir, relativePath, 'index.html'),
        path.join(publishDir, `${relativePath}.html`),
      ]
    : [path.join(publishDir, 'index.html')];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        return candidate;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  throw new Error(`No published HTML file found for ${url}`);
}

async function hashPublishedPages(publishDir, urls) {
  const pages = {};
  for (const url of urls) {
    const htmlPath = await htmlPathForUrl(publishDir, url);
    const html = await fs.readFile(htmlPath);
    pages[url] = crypto.createHash('sha256').update(html).digest('hex');
  }
  return pages;
}

function changedUrls(previousPages, currentPages) {
  const changed = Object.entries(currentPages)
    .filter(([url, hash]) => previousPages[url] !== hash)
    .map(([url]) => url);
  const removed = Object.keys(previousPages).filter((url) => !(url in currentPages));
  return [...new Set([...changed, ...removed])].sort();
}

function chunks(values, size = MAX_URLS_PER_REQUEST) {
  return Array.from(
    {length: Math.ceil(values.length / size)},
    (_, index) => values.slice(index * size, (index + 1) * size),
  );
}

async function readState(statePath) {
  try {
    const state = JSON.parse(await fs.readFile(statePath, 'utf8'));
    return state?.version === 1 && state.pages && typeof state.pages === 'object'
      ? state
      : null;
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return null;
    }
    throw error;
  }
}

async function writeState(statePath, pages) {
  await fs.mkdir(path.dirname(statePath), {recursive: true});
  await fs.writeFile(
    statePath,
    `${JSON.stringify({version: 1, pages}, null, 2)}\n`,
    'utf8',
  );
}

async function submitUrls({urls, inputs, fetchImpl, logger}) {
  for (const [index, urlList] of chunks(urls).entries()) {
    logger.log(
      `IndexNow request ${index + 1}: ${urlList.length} URL(s):\n${urlList.join('\n')}`,
    );
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: {'content-type': 'application/json; charset=utf-8'},
      body: JSON.stringify({
        host: inputs.host,
        key: inputs.key,
        keyLocation: inputs.keyLocation,
        urlList,
      }),
    });
    const responseBody = (await response.text()).slice(0, 500);
    logger.log(
      `IndexNow response ${index + 1}: HTTP ${response.status}${
        responseBody ? `: ${responseBody}` : ''
      }`,
    );
    if (![200, 202].includes(response.status)) {
      throw new Error(`IndexNow rejected request ${index + 1} with HTTP ${response.status}`);
    }
  }
}

async function runOnSuccess({
  constants,
  inputs,
  utils,
  statePath = STATE_PATH,
  fetchImpl = globalThis.fetch,
  logger = console,
}) {
  const sitemapPath = path.join(constants.PUBLISH_DIR, 'sitemap.xml');
  const xml = await fs.readFile(sitemapPath, 'utf8');
  const urls = sitemapUrls(xml, inputs.host);
  if (!urls.length) {
    throw new Error(`No ${inputs.host} URLs found in ${sitemapPath}`);
  }

  const currentPages = await hashPublishedPages(constants.PUBLISH_DIR, urls);
  const previousState = await readState(statePath);
  if (!previousState) {
    await writeState(statePath, currentPages);
    await utils.cache.save(statePath);
    logger.log(`IndexNow cache seeded with ${urls.length} published pages; no bulk submission sent.`);
    return {seeded: true, submitted: []};
  }

  const submitted = changedUrls(previousState.pages, currentPages);
  if (submitted.length) {
    await submitUrls({urls: submitted, inputs, fetchImpl, logger});
  } else {
    logger.log(`IndexNow found no changed pages among ${urls.length} sitemap URLs.`);
  }

  await writeState(statePath, currentPages);
  await utils.cache.save(statePath);
  return {seeded: false, submitted};
}

module.exports = {
  onPreBuild: async ({utils}) => {
    try {
      await utils.cache.restore(STATE_PATH);
    } catch (error) {
      console.warn(`IndexNow cache restore failed; the deploy will continue: ${error.message}`);
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
    changedUrls,
    chunks,
    hashPublishedPages,
    runOnSuccess,
    sitemapUrls,
  },
};
