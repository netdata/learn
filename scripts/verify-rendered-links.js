const fs = require('node:fs');
const path = require('node:path');

const HOST = 'learn.netdata.cloud';

function allowedRenderedRedirectSources(policy) {
  const configured = policy.allowed_rendered_redirect_sources ?? [];
  if (!Array.isArray(configured)) {
    throw new Error('allowed_rendered_redirect_sources must be an array');
  }
  const allowed = new Set();
  for (const source of configured) {
    if (
      typeof source !== 'string' ||
      !source.startsWith('/') ||
      /[*:?#]/.test(source) ||
      normalizePathname(source) !== source ||
      allowed.has(source)
    ) {
      throw new Error(`Invalid allowed rendered redirect source: ${JSON.stringify(source)}`);
    }
    allowed.add(source);
  }
  return allowed;
}

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

function redirectSourceRules(netlifyToml, host = HOST) {
  const exact = new Set();
  const terminalWildcards = new Set();
  for (const match of netlifyToml.matchAll(/(?:^|\n)\s*\[\[redirects\]\]([\s\S]*?)(?=(?:\n\s*\[\[)|$)/g)) {
    const from = match[1].match(/(?:^|\n)\s*from\s*=\s*"([^"]+)"/);
    if (!from) continue;
    let source = decodeHtml(from[1]);
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const url = new URL(source);
      if (url.hostname !== host) continue;
      source = url.pathname;
    }
    if (!source.startsWith('/')) continue;

    if (source.endsWith('*') && !/[*:]/.test(source.slice(0, -1))) {
      terminalWildcards.add(normalizePathname(source.slice(0, -1)));
    } else if (!/[*:]/.test(source)) {
      exact.add(normalizePathname(source));
    }
  }
  return {exact, terminalWildcards};
}

function exactRedirectSources(netlifyToml, host = HOST) {
  return redirectSourceRules(netlifyToml, host).exact;
}

function redirectSourceForPath(pathname, rules) {
  if (rules.exact.has(pathname)) return pathname;
  for (const prefix of rules.terminalWildcards) {
    if (pathname.startsWith(prefix)) return `${prefix}*`;
  }
  return null;
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
  // Docusaurus emits quoted href attributes. Keeping this boundary explicit avoids
  // pretending this small verifier is a general-purpose HTML parser.
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>/gi)) {
    const href = decodeHtml(match[1] ?? match[2] ?? '').trim();
    if (!href || href.startsWith('#')) continue;
    try {
      const target = new URL(href, source);
      if (!['http:', 'https:'].includes(target.protocol) || target.hostname !== host) continue;
      links.push({href, pathname: normalizePathname(target.pathname)});
    } catch {
      // Invalid hrefs belong to the broader link checker, not this exact redirect gate.
    }
  }
  return links;
}

function verifyRenderedLinks(
  publishDir,
  netlifyPath,
  host = HOST,
  allowedRedirectSources = new Set(),
) {
  const redirectRules = redirectSourceRules(fs.readFileSync(netlifyPath, 'utf8'), host);
  for (const source of allowedRedirectSources) {
    if (!redirectRules.exact.has(source)) {
      throw new Error(`Allowed rendered redirect source is not an exact redirect: ${source}`);
    }
  }
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
  let allowedRedirectLinks = 0;
  for (const filename of htmlFiles.sort()) {
    const sourceRoute = routeForFile(publishDir, filename);
    for (const link of renderedInternalLinks(fs.readFileSync(filename, 'utf8'), sourceRoute, host)) {
      internalLinks += 1;
      const redirectSource = redirectSourceForPath(link.pathname, redirectRules);
      if (redirectSource) {
        if (allowedRedirectSources.has(redirectSource)) {
          allowedRedirectLinks += 1;
          continue;
        }
        violations.push({sourceRoute, href: link.href, redirectSource});
      }
    }
  }
  if (violations.length) {
    const detail = violations
      .map(({sourceRoute, href, redirectSource}) => `  ${sourceRoute}: ${href} -> ${redirectSource}`)
      .join('\n');
    throw new Error(`Rendered links target redirect sources:\n${detail}`);
  }
  return {
    htmlFiles: htmlFiles.length,
    internalLinks,
    redirectSources: redirectRules.exact.size + redirectRules.terminalWildcards.size,
    exactRedirectSources: redirectRules.exact.size,
    wildcardRedirectSources: redirectRules.terminalWildcards.size,
    allowedRedirectLinks,
    allowedRedirectSources: allowedRedirectSources.size,
  };
}

if (require.main === module) {
  try {
    const publishDir = path.resolve(process.argv[2] || 'build');
    const netlifyPath = path.resolve(process.argv[3] || 'netlify.toml');
    const policyPath = path.resolve(process.argv[4] || 'config/redirect-policy.json');
    const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
    const allowedRedirectSources = allowedRenderedRedirectSources(policy);
    const result = verifyRenderedLinks(
      publishDir,
      netlifyPath,
      HOST,
      allowedRedirectSources,
    );
    console.log(
      `Verified ${result.internalLinks} rendered internal links across ${result.htmlFiles} HTML files avoid ${result.exactRedirectSources} exact and ${result.wildcardRedirectSources} terminal-wildcard redirect sources, except ${result.allowedRedirectLinks} links to ${result.allowedRedirectSources} policy-owned entrypoint.`,
    );
  } catch (error) {
    console.error(`Rendered link verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  allowedRenderedRedirectSources,
  exactRedirectSources,
  normalizePathname,
  redirectSourceForPath,
  redirectSourceRules,
  renderedInternalLinks,
  routeForFile,
  verifyRenderedLinks,
};
