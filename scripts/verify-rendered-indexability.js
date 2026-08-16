const fs = require('node:fs');
const path = require('node:path');

const {sitemapUrls} = require('./verify-rendered-titles');

const ROBOTS_NAMES = new Set(['robots', 'googlebot', 'bingbot']);
const SITE_HOST = 'learn.netdata.cloud';

function attributes(tag) {
  const result = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of tag.matchAll(pattern)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}

function containsNoindex(value) {
  return /(?:^|[\s,])noindex(?:$|[\s,])/i.test(value);
}

function noindexMetaDirectives(html) {
  const directives = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attributes(match[0]);
    const metadataName = (attrs.get('name') || attrs.get('property') || '').toLowerCase();
    const httpEquiv = (attrs.get('http-equiv') || '').toLowerCase();
    const content = attrs.get('content') || '';
    if (
      containsNoindex(content) &&
      (ROBOTS_NAMES.has(metadataName) || httpEquiv === 'x-robots-tag')
    ) {
      directives.push(match[0]);
    }
  }
  return directives;
}

function noindexResponseHeaders(netlifyToml) {
  const directives = [];
  for (const [index, line] of netlifyToml.split(/\r?\n/).entries()) {
    const match = line.match(/^\s*["']?x-robots-tag["']?\s*=\s*(.*?)\s*(?:#.*)?$/i);
    if (!match) continue;
    const value = match[1].replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, '$1$2');
    if (!containsNoindex(value)) continue;
    directives.push({
      line: index + 1,
      value,
    });
  }
  return directives;
}

function wildcardRobotsRules(robotsText) {
  const rules = [];
  let userAgents = [];
  let rulesStarted = false;

  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) {
      userAgents = [];
      rulesStarted = false;
      continue;
    }

    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'user-agent') {
      if (rulesStarted) {
        userAgents = [];
        rulesStarted = false;
      }
      userAgents.push(value.toLowerCase());
      continue;
    }

    if (field !== 'allow' && field !== 'disallow') continue;
    rulesStarted = true;
    if (!userAgents.includes('*') || !value) continue;
    rules.push({allow: field === 'allow', pattern: value});
  }

  return rules;
}

function robotsRuleRegex(pattern) {
  const endAnchored = pattern.endsWith('$');
  const body = endAnchored ? pattern.slice(0, -1) : pattern;
  const source = body
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${source}${endAnchored ? '$' : ''}`);
}

function wildcardRobotsAllows(pathname, rules) {
  const matches = rules
    .filter((rule) => robotsRuleRegex(rule.pattern).test(pathname))
    .map((rule) => ({
      ...rule,
      specificity: rule.pattern.length,
    }));

  if (!matches.length) return true;
  const mostSpecific = Math.max(...matches.map((rule) => rule.specificity));
  return matches.some((rule) => rule.specificity === mostSpecific && rule.allow);
}

function sitemapRobotsViolations(sitemapXml, robotsText, host = SITE_HOST) {
  const rules = wildcardRobotsRules(robotsText);
  return sitemapUrls(sitemapXml, host).filter((value) => {
    const url = new URL(value);
    return !wildcardRobotsAllows(`${url.pathname}${url.search}`, rules);
  });
}

function regularFile(filename) {
  const stat = fs.lstatSync(filename);
  if (stat.isSymbolicLink()) throw new Error(`Rendered output contains a symbolic link: ${filename}`);
  if (!stat.isFile()) throw new Error(`Expected a regular file: ${filename}`);
}

function htmlFilesUnder(root) {
  const files = [];
  const stack = [root];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const filename = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Rendered output contains a symbolic link: ${filename}`);
      }
      if (entry.isDirectory()) stack.push(filename);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(filename);
      else if (!entry.isFile()) throw new Error(`Rendered output contains a non-regular file: ${filename}`);
    }
  }
  return files.sort();
}

function verifyRenderedIndexability(
  publishDir,
  netlifyPath,
  robotsPath = path.resolve('static/robots.txt'),
  host = SITE_HOST,
) {
  const violations = [];
  const htmlFiles = htmlFilesUnder(publishDir);
  for (const filename of htmlFiles) {
    const directives = noindexMetaDirectives(fs.readFileSync(filename, 'utf8'));
    if (directives.length) {
      violations.push(`${path.relative(publishDir, filename)}: ${directives.join(' ')}`);
    }
  }

  regularFile(netlifyPath);
  const responseHeaders = noindexResponseHeaders(fs.readFileSync(netlifyPath, 'utf8'));
  for (const directive of responseHeaders) {
    violations.push(`X-Robots-Tag at ${netlifyPath}:${directive.line}: ${directive.value}`);
  }

  const sitemapPath = path.join(publishDir, 'sitemap.xml');
  regularFile(sitemapPath);
  regularFile(robotsPath);
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  const robotsText = fs.readFileSync(robotsPath, 'utf8');
  const urls = sitemapUrls(sitemapXml, host);
  if (!urls.length) {
    throw new Error(`No ${host} URLs found in ${sitemapPath}`);
  }
  const blockedSitemapUrls = sitemapRobotsViolations(sitemapXml, robotsText, host);
  if (blockedSitemapUrls.length) {
    throw new Error(
      'Sitemap URL(s) are blocked by the wildcard robots.txt policy:\n  ' +
      `${blockedSitemapUrls.join('\n  ')}\n` +
      'Remove the URL from the sitemap when the block is intentional. ' +
      'Change the robots crawling policy only when crawling is intended and explicitly approved. ' +
      'Do not weaken this gate to make the build pass without explicit user approval.',
    );
  }

  if (violations.length) {
    throw new Error(`Found noindex directive(s):\n  ${violations.join('\n  ')}`);
  }
  return {
    htmlFiles: htmlFiles.length,
    noindexDirectives: 0,
    sitemapUrls: urls.length,
    blockedSitemapUrls: 0,
  };
}

if (require.main === module) {
  try {
    const publishDir = path.resolve(process.argv[2] || 'build');
    const netlifyPath = path.resolve(process.argv[3] || 'netlify.toml');
    const robotsPath = path.resolve(process.argv[4] || 'static/robots.txt');
    const result = verifyRenderedIndexability(publishDir, netlifyPath, robotsPath);
    console.log(
      `Verified zero noindex directives across ${result.htmlFiles} rendered HTML files and ` +
      `zero robots-blocked URLs across ${result.sitemapUrls} sitemap URLs.`,
    );
  } catch (error) {
    console.error(`Rendered indexability verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  noindexMetaDirectives,
  noindexResponseHeaders,
  sitemapRobotsViolations,
  verifyRenderedIndexability,
  wildcardRobotsAllows,
  wildcardRobotsRules,
};
