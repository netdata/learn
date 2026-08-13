const fs = require('node:fs');
const path = require('node:path');

const SOURCE = 'https://static.cloudflareinsights.com/beacon.min.js';
const TOKEN = '7408c22ab930458a8467c91b5360b8f3';
const REPRESENTATIVE_ROUTES = [
  'index.html',
  'blog/index.html',
  'search/index.html',
  'docs/ask-netdata/index.html',
  'docs/collecting-metrics/collectors/index.html',
  'docs/netdata-agent/installation/linux/index.html',
];

function decodeAttribute(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&#x22;', '"')
    .replaceAll('&amp;', '&');
}

function attributes(tag) {
  const result = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of tag.matchAll(pattern)) {
    result.set(match[1].toLowerCase(), decodeAttribute(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return result;
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

function verifyPage(html, relative) {
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)]
    .map((match) => ({tag: match[0], attrs: attributes(match[0])}))
    .filter(({attrs}) => attrs.get('src') === SOURCE);
  if (scripts.length !== 1) {
    throw new Error(`${relative}: expected exactly one Cloudflare Web Analytics beacon, found ${scripts.length}`);
  }
  const {tag, attrs} = scripts[0];
  if (attrs.get('type') !== 'module' || !attrs.has('defer')) {
    throw new Error(`${relative}: Cloudflare Web Analytics beacon must be a deferred module`);
  }
  if (attrs.has('integrity')) {
    throw new Error(`${relative}: unversioned Cloudflare Web Analytics beacon cannot use integrity`);
  }
  let payload;
  try {
    payload = JSON.parse(attrs.get('data-cf-beacon') || '');
  } catch {
    throw new Error(`${relative}: Cloudflare Web Analytics beacon payload is not valid JSON`);
  }
  if (Object.keys(payload).length !== 1 || payload.token !== TOKEN) {
    throw new Error(`${relative}: Cloudflare Web Analytics beacon token does not match the approved public token`);
  }
  if (html.split(SOURCE).length !== 2 || html.split(TOKEN).length !== 2) {
    throw new Error(`${relative}: Cloudflare Web Analytics source or token occurs more than once`);
  }
  return tag;
}

function verifyCloudflareRum(publishDir) {
  const root = path.resolve(publishDir);
  const pages = htmlFilesUnder(root);
  if (!pages.length) throw new Error(`No rendered HTML found under ${root}`);
  const covered = new Set();
  for (const filename of pages) {
    const relative = path.relative(root, filename).split(path.sep).join('/');
    verifyPage(fs.readFileSync(filename, 'utf8'), relative);
    if (REPRESENTATIVE_ROUTES.includes(relative)) covered.add(relative);
  }
  const missing = REPRESENTATIVE_ROUTES.filter((relative) => !covered.has(relative));
  if (missing.length) {
    throw new Error(`Missing representative rendered route(s): ${missing.join(', ')}`);
  }
  return {htmlFiles: pages.length, representativeRoutes: covered.size};
}

if (require.main === module) {
  try {
    const result = verifyCloudflareRum(process.argv[2] || 'build');
    console.log(
      `Verified one Cloudflare Web Analytics beacon across ${result.htmlFiles} HTML files ` +
      `and ${result.representativeRoutes} route classes.`,
    );
  } catch (error) {
    console.error(`Cloudflare Web Analytics verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {SOURCE, TOKEN, REPRESENTATIVE_ROUTES, attributes, verifyCloudflareRum, verifyPage};
