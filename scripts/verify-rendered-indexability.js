const fs = require('node:fs');
const path = require('node:path');

const ROBOTS_NAMES = new Set(['robots', 'googlebot', 'bingbot']);

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

function verifyRenderedIndexability(publishDir, netlifyPath) {
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

  if (violations.length) {
    throw new Error(`Found noindex directive(s):\n  ${violations.join('\n  ')}`);
  }
  return {htmlFiles: htmlFiles.length, noindexDirectives: 0};
}

if (require.main === module) {
  try {
    const publishDir = path.resolve(process.argv[2] || 'build');
    const netlifyPath = path.resolve(process.argv[3] || 'netlify.toml');
    const result = verifyRenderedIndexability(publishDir, netlifyPath);
    console.log(`Verified zero noindex directives across ${result.htmlFiles} rendered HTML files.`);
  } catch (error) {
    console.error(`Rendered indexability verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  noindexMetaDirectives,
  noindexResponseHeaders,
  verifyRenderedIndexability,
};
