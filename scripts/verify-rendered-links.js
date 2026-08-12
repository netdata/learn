const fs = require('node:fs');
const path = require('node:path');

const HOST = 'learn.netdata.cloud';

function decodeHtml(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function normalizePathname(value) {
  let pathname;
  try {
    pathname = decodeURIComponent(value);
  } catch {
    pathname = value;
  }
  return pathname || '/';
}

function exactRedirectSources(netlifyToml) {
  const sources = new Set();
  for (const match of netlifyToml.matchAll(/(?:^|\n)\s*\[\[redirects\]\]([\s\S]*?)(?=(?:\n\s*\[\[)|$)/g)) {
    const from = match[1].match(/(?:^|\n)\s*from\s*=\s*"([^"]+)"/);
    if (!from) continue;
    let source = decodeHtml(from[1]);
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const url = new URL(source);
      if (url.hostname !== HOST) continue;
      source = url.pathname;
    }
    if (!source.startsWith('/') || /[*:]/.test(source)) continue;
    sources.add(normalizePathname(source));
  }
  return sources;
}

function routeForFile(publishDir, filename) {
  const relative = path.relative(publishDir, filename).split(path.sep).join('/');
  if (relative === 'index.html') return '/';
  if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'/index.html'.length)}`;
  return `/${relative.replace(/\.html$/i, '')}`;
}

function renderedInternalLinks(html, sourceRoute, host = HOST) {
  const source = new URL(sourceRoute, `https://${host}/`);
  const links = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)) {
    const href = decodeHtml(match[1] ?? match[2] ?? '').trim();
    if (!href || href.startsWith('#')) continue;
    try {
      const target = new URL(href, source);
      if (target.protocol !== 'https:' || target.hostname !== host) continue;
      links.push({href, pathname: normalizePathname(target.pathname)});
    } catch {
      // Invalid hrefs belong to the broader link checker, not this exact redirect gate.
    }
  }
  return links;
}

function verifyRenderedLinks(publishDir, netlifyPath, host = HOST) {
  const redirectSources = exactRedirectSources(fs.readFileSync(netlifyPath, 'utf8'));
  const htmlFiles = [];
  const stack = [publishDir];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(filename);
      else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(filename);
    }
  }

  const violations = [];
  let internalLinks = 0;
  for (const filename of htmlFiles.sort()) {
    const sourceRoute = routeForFile(publishDir, filename);
    for (const link of renderedInternalLinks(fs.readFileSync(filename, 'utf8'), sourceRoute, host)) {
      internalLinks += 1;
      if (redirectSources.has(link.pathname)) {
        violations.push({sourceRoute, href: link.href, redirectSource: link.pathname});
      }
    }
  }
  if (violations.length) {
    const detail = violations
      .map(({sourceRoute, href, redirectSource}) => `  ${sourceRoute}: ${href} -> ${redirectSource}`)
      .join('\n');
    throw new Error(`Rendered links target exact redirect sources:\n${detail}`);
  }
  return {htmlFiles: htmlFiles.length, internalLinks, redirectSources: redirectSources.size};
}

if (require.main === module) {
  try {
    const publishDir = path.resolve(process.argv[2] || 'build');
    const netlifyPath = path.resolve(process.argv[3] || 'netlify.toml');
    const result = verifyRenderedLinks(publishDir, netlifyPath);
    console.log(
      `Verified ${result.internalLinks} rendered internal links across ${result.htmlFiles} HTML files avoid ${result.redirectSources} exact redirect sources.`,
    );
  } catch (error) {
    console.error(`Rendered link verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  exactRedirectSources,
  normalizePathname,
  renderedInternalLinks,
  routeForFile,
  verifyRenderedLinks,
};
