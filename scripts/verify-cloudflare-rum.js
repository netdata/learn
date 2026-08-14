const fs = require('node:fs');
const path = require('node:path');
const {parse} = require('parse5');

const SOURCE = 'https://static.cloudflareinsights.com/beacon.min.js';
const SOURCE_URL = new URL(SOURCE);
const TOKEN = '7408c22ab930458a8467c91b5360b8f3';
const SITE_ORIGIN = 'https://learn.netdata.cloud';
const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const NESTED_DOCUMENT_ATTRIBUTES = new Map([
  ['iframe', 'src'],
  ['frame', 'src'],
  ['object', 'data'],
  ['embed', 'src'],
]);
const REPRESENTATIVE_ROUTES = [
  'index.html',
  'blog/index.html',
  'search/index.html',
  'docs/ask-netdata/index.html',
  'docs/collecting-metrics/collectors/index.html',
  'docs/netdata-agent/installation/linux/index.html',
];
const SENSITIVE_ROUTES = ['api.html', 'oauth2-redirect.html'];

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
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(filename);
      else if (!entry.isFile()) throw new Error(`Rendered output contains a non-regular file: ${filename}`);
    }
  }
  return files.sort();
}

function verifyPage(html, relative) {
  const scriptTags = [];
  let hasBaseUrlOverride = false;
  let hasIframeSrcdoc = false;
  let hasNestedDocument = false;
  let hasInlineNestedDocument = false;
  const visit = (node, inShadowTree = false) => {
    const nodeAttrs = node.attrs || [];
    const attrs = new Map(nodeAttrs.map(({name, value}) => [name, value]));
    if (node.nodeName === 'base' && attrs.has('href')) hasBaseUrlOverride = true;
    if (node.nodeName === 'iframe' && attrs.has('srcdoc')) hasIframeSrcdoc = true;
    const nestedDocumentAttribute = NESTED_DOCUMENT_ATTRIBUTES.get(node.nodeName);
    if (nestedDocumentAttribute && attrs.has(nestedDocumentAttribute)) {
      hasNestedDocument = true;
      const nestedDocumentUrl = scriptUrl(attrs.get(nestedDocumentAttribute));
      if (
        nestedDocumentUrl === false ||
        (nestedDocumentUrl.protocol !== 'http:' && nestedDocumentUrl.protocol !== 'https:')
      ) {
        hasInlineNestedDocument = true;
      }
    }
    if (node.nodeName === 'script') {
      const sources = nodeAttrs
        .filter(({name}) => name === 'src' || name === 'href')
        .map(({value}) => scriptUrl(value));
      scriptTags.push({attrs, inShadowTree, namespace: node.namespaceURI, sources});
    }
    for (const child of node.childNodes || []) visit(child, inShadowTree);
    const shadowRootMode = attrs.get('shadowrootmode')?.toLowerCase();
    if (
      node.nodeName === 'template' &&
      node.namespaceURI === HTML_NAMESPACE &&
      (shadowRootMode === 'open' || shadowRootMode === 'closed') &&
      node.content
    ) {
      visit(node.content, true);
    }
  };
  visit(parse(html));

  if (hasBaseUrlOverride || hasIframeSrcdoc || hasInlineNestedDocument) {
    throw new Error(
      `${relative}: analytics verification forbids base URL overrides and inline nested documents`,
    );
  }

  function scriptUrl(source) {
    try {
      return new URL(source, `${SITE_ORIGIN}/`);
    } catch {
      return false;
    }
  }
  function isCloudflareBeaconResource(url) {
    if (!url || url.origin !== SOURCE_URL.origin) return false;
    try {
      return decodeURIComponent(url.pathname) === SOURCE_URL.pathname;
    } catch {
      return false;
    }
  }
  if (SENSITIVE_ROUTES.includes(relative)) {
    const external = scriptTags.some(({sources}) =>
      sources.some((url) => url === false || url.origin !== SITE_ORIGIN),
    );
    if (hasNestedDocument || external || html.includes(SOURCE) || html.includes(TOKEN)) {
      throw new Error(`${relative}: credential-handling HTML must not load third-party code`);
    }
    return null;
  }
  const scripts = scriptTags.filter(({sources}) => sources.some(isCloudflareBeaconResource));
  if (scripts.length !== 1) {
    throw new Error(`${relative}: expected exactly one Cloudflare Web Analytics beacon, found ${scripts.length}`);
  }
  if (scripts[0].namespace !== HTML_NAMESPACE || scripts[0].inShadowTree) {
    throw new Error(`${relative}: Cloudflare Web Analytics beacon must be an HTML script in the document tree`);
  }
  const {attrs} = scripts[0];
  if (attrs.get('src') !== SOURCE) {
    throw new Error(`${relative}: Cloudflare Web Analytics beacon source must use the exact approved URL`);
  }
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
  return attrs;
}

function verifyCloudflareRum(publishDir) {
  const root = path.resolve(publishDir);
  const pages = htmlFilesUnder(root);
  if (!pages.length) throw new Error(`No rendered HTML found under ${root}`);
  const covered = new Set();
  const sensitive = new Set();
  for (const filename of pages) {
    const relative = path.relative(root, filename).split(path.sep).join('/');
    verifyPage(fs.readFileSync(filename, 'utf8'), relative);
    if (REPRESENTATIVE_ROUTES.includes(relative)) covered.add(relative);
    if (SENSITIVE_ROUTES.includes(relative)) sensitive.add(relative);
  }
  const missing = REPRESENTATIVE_ROUTES.filter((relative) => !covered.has(relative));
  if (missing.length) {
    throw new Error(`Missing representative rendered route(s): ${missing.join(', ')}`);
  }
  const missingSensitive = SENSITIVE_ROUTES.filter((relative) => !sensitive.has(relative));
  if (missingSensitive.length) {
    throw new Error(`Missing sensitive rendered route(s): ${missingSensitive.join(', ')}`);
  }
  return {
    htmlFiles: pages.length,
    representativeRoutes: covered.size,
    sensitiveRoutes: sensitive.size,
  };
}

if (require.main === module) {
  try {
    const result = verifyCloudflareRum(process.argv[2] || 'build');
    console.log(
      `Verified one Cloudflare Web Analytics beacon across ${result.htmlFiles} HTML files ` +
      `except ${result.sensitiveRoutes} credential-handling routes; ` +
      `${result.representativeRoutes} normal route classes are covered.`,
    );
  } catch (error) {
    console.error(`Cloudflare Web Analytics verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  SOURCE,
  TOKEN,
  REPRESENTATIVE_ROUTES,
  SENSITIVE_ROUTES,
  verifyCloudflareRum,
  verifyPage,
};
