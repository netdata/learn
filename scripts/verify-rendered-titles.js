const fs = require('node:fs');
const path = require('node:path');

const HOST = 'learn.netdata.cloud';

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function sitemapUrls(xml, host = HOST) {
  return [...xml.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeHtml(match[1].trim()))
    .filter((value) => {
      try {
        const url = new URL(value);
        return url.protocol === 'https:' && url.hostname === host && !url.search && !url.hash;
      } catch {
        return false;
      }
    });
}

function renderedFile(publishDir, value) {
  const url = new URL(value);
  const pathname = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '');
  const candidates = pathname
    ? [path.join(publishDir, pathname, 'index.html'), path.join(publishDir, `${pathname}.html`)]
    : [path.join(publishDir, 'index.html')];
  const output = candidates.find((candidate) => fs.existsSync(candidate));
  if (!output) {
    throw new Error(`No rendered HTML found for ${value}`);
  }
  return output;
}

function renderedTitle(html) {
  const match = html.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1]).replace(/\s+/g, ' ').trim() : '';
}

function verifyRenderedTitles(publishDir, host = HOST) {
  const sitemapPath = path.join(publishDir, 'sitemap.xml');
  const urls = sitemapUrls(fs.readFileSync(sitemapPath, 'utf8'), host);
  if (!urls.length) {
    throw new Error(`No ${host} URLs found in ${sitemapPath}`);
  }
  if (new Set(urls).size !== urls.length) {
    throw new Error('The sitemap contains duplicate URLs');
  }

  const byTitle = new Map();
  for (const value of urls) {
    const title = renderedTitle(fs.readFileSync(renderedFile(publishDir, value), 'utf8'));
    if (!title) {
      throw new Error(`Missing rendered title for ${value}`);
    }
    const pages = byTitle.get(title) ?? [];
    pages.push(value);
    byTitle.set(title, pages);
  }

  const duplicates = [...byTitle.entries()].filter(([, pages]) => pages.length > 1);
  if (duplicates.length) {
    const detail = duplicates
      .map(([title, pages]) => `${title}\n${pages.map((value) => `  ${value}`).join('\n')}`)
      .join('\n');
    throw new Error(`Duplicate rendered titles:\n${detail}`);
  }

  return {urls: urls.length, titles: byTitle.size};
}

if (require.main === module) {
  try {
    const result = verifyRenderedTitles(path.resolve(process.argv[2] || 'build'));
    console.log(`Verified ${result.titles} unique rendered titles across ${result.urls} sitemap URLs.`);
  } catch (error) {
    console.error(`Rendered title verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {decodeHtml, renderedFile, renderedTitle, sitemapUrls, verifyRenderedTitles};
