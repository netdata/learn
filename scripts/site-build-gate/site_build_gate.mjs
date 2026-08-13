#!/usr/bin/env node
/** Fail a static site build when accepted technical defects regress. */

import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import * as csstree from "css-tree";
import { parse as parseHtml } from "parse5";
import { SaxesParser } from "saxes";

export const CONTRACT_SCHEMA = "netdata-site-build-gate-v1";
export const MANIFEST_SCHEMA = "netdata-site-build-gate-vendor-v2";
export const BASELINE_SCHEMA = "netdata-site-build-gate-baseline-v1";
export const REPORT_SCHEMA = "netdata-site-build-gate-report-v1";
export const RULESET_VERSION = 8;
export const REQUIRED_NODE_MAJOR = 22;
export const HEAVY_BYTES = 500_000;

const HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
const SITEMAP_NAMESPACE = "http://www.sitemaps.org/schemas/sitemap/0.9";
const HTML_SUFFIXES = new Set([".html", ".htm", ".xhtml"]);
const TRACKED_CSS_PROPERTIES = ["content-visibility", "display", "visibility"];
const UA_DISPLAY_NONE_TAGS = new Set(["datalist", "rp"]);
const SEMANTICALLY_INERT = new Set([
  "iframe",
  "noembed",
  "noframes",
  "noscript",
  "script",
  "style",
  "template",
  "xmp",
]);

export const RULES = Object.freeze({
  "missing-title": {
    classification: "accessibility",
    basis: "WCAG 2.4.2 Page Titled, Level A",
  },
  "images-missing-alt": {
    classification: "accessibility",
    basis: "WCAG 1.1.1 Non-text Content, Level A",
  },
  "missing-description": {
    classification: "presentation",
    basis: "Google may compose a snippet; an authored description is a presentation choice",
  },
  "missing-h1": {
    classification: "presentation",
    basis: "Neither WCAG nor Google requires one h1; the site contract requires a semantic heading",
  },
  "multiple-h1": {
    classification: "presentation",
    basis: "Neither WCAG nor Google requires one h1; the site contract keeps one document heading",
  },
  "duplicate-title": {
    classification: "presentation",
    basis: "Identical result titles are ambiguous to readers, not a Google penalty",
  },
  "duplicate-description": {
    classification: "presentation",
    basis: "Identical descriptions make distinct pages read as interchangeable",
  },
  "heavy-page": {
    classification: "diagnostic",
    basis: "500000 bytes is an estate performance guardrail, not a Google threshold",
  },
});

export class GateError extends Error {
  constructor(message) {
    super(message);
    this.name = "GateError";
  }
}

class MissingBuiltHtml extends GateError {}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, expected, label) {
  if (!isPlainObject(value)) throw new GateError(`${label} must be a JSON object`);
  const actual = Object.keys(value).sort(compareText);
  const wanted = [...expected].sort(compareText);
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
    throw new GateError(`${label} fields must be exactly: ${wanted.join(", ")}`);
  }
}

function loadJson(path, label) {
  try {
    const value = JSON.parse(readFileSync(path, "utf8"));
    if (!isPlainObject(value)) throw new GateError(`${label} must be a JSON object: ${path}`);
    return value;
  } catch (error) {
    if (error instanceof GateError) throw error;
    throw new GateError(`cannot read ${label} ${path}: ${error.message}`);
  }
}

function sha256Bytes(payload) {
  return createHash("sha256").update(payload).digest("hex");
}

function requireNode22() {
  const major = Number.parseInt(process.versions.node.split(".", 1)[0], 10);
  if (major !== REQUIRED_NODE_MAJOR) {
    throw new GateError(`Node.js ${REQUIRED_NODE_MAJOR}.x is required; running ${process.version}`);
  }
}

export function verifyContract(artifactPath, manifestPath) {
  requireNode22();
  let manifestFile;
  let runningArtifact;
  try {
    manifestFile = realpathSync(resolve(manifestPath));
    runningArtifact = realpathSync(resolve(artifactPath));
  } catch (error) {
    throw new GateError(`cannot resolve vendor contract paths: ${error.message}`);
  }
  const manifest = loadJson(manifestFile, "vendor manifest");
  exactKeys(manifest, ["schema", "contract", "ruleset_version", "node_major", "artifacts"], "vendor manifest");
  if (manifest.schema !== MANIFEST_SCHEMA || manifest.contract !== CONTRACT_SCHEMA) {
    throw new GateError("vendor manifest schema or contract is not supported");
  }
  if (manifest.ruleset_version !== RULESET_VERSION || manifest.node_major !== REQUIRED_NODE_MAJOR) {
    throw new GateError("vendor manifest ruleset or Node.js requirement does not match the checker");
  }
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) {
    throw new GateError("vendor manifest artifacts must be a non-empty list");
  }
  const root = dirname(manifestFile);
  const names = new Set();
  for (const entry of manifest.artifacts) {
    exactKeys(entry, ["path", "sha256"], "vendor artifact");
    if (typeof entry.path !== "string" || basename(entry.path) !== entry.path || entry.path === "manifest.json") {
      throw new GateError(`unsafe vendor artifact path: ${JSON.stringify(entry.path)}`);
    }
    if (names.has(entry.path)) throw new GateError(`duplicate vendor artifact: ${entry.path}`);
    names.add(entry.path);
    let payload;
    try {
      const candidate = join(root, entry.path);
      if (!lstatSync(candidate).isFile()) throw new GateError(`vendor artifact must be a regular file: ${entry.path}`);
      payload = readFileSync(candidate);
    } catch (error) {
      throw new GateError(`cannot read vendor artifact ${entry.path}: ${error.message}`);
    }
    const actual = sha256Bytes(payload);
    if (typeof entry.sha256 !== "string" || entry.sha256 !== actual) {
      throw new GateError(`vendor checksum mismatch for ${entry.path}: expected ${entry.sha256}, got ${actual}`);
    }
  }
  const boundArtifact = join(root, basename(runningArtifact));
  if (!names.has(basename(runningArtifact)) || realpathSync(boundArtifact) !== runningArtifact) {
    throw new GateError(`vendor manifest does not bind the running artifact: ${basename(runningArtifact)}`);
  }
  return manifest;
}

function preNormalizationPath(value, label) {
  if (/[\\\u0000-\u0020\u007f]/u.test(value)) {
    throw new GateError(`unsafe ${label}: raw controls, whitespace, and backslashes are forbidden`);
  }
  const match = /^[A-Za-z][A-Za-z0-9+.-]*:\/\/([^/?#]*)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/su.exec(value);
  if (!match) throw new GateError(`${label} must be an absolute HTTP(S) URL: ${JSON.stringify(value)}`);
  if (match[1].includes("@")) throw new GateError(`${label} cannot contain user information: ${JSON.stringify(value)}`);
  if (match[3] !== undefined || match[4] !== undefined) {
    throw new GateError(`${label} cannot carry a query or fragment: ${JSON.stringify(value)}`);
  }
  const rawPath = match[2] || "/";
  if (rawPath.includes("//") || rawPath.includes("\\") || rawPath.includes("\0") || /%(?:2f|5c)/iu.test(rawPath)) {
    throw new GateError(`unsafe ${label} path: ${JSON.stringify(rawPath)}`);
  }
  for (const rawPart of rawPath.split("/")) {
    let decoded;
    try {
      decoded = decodeURIComponent(rawPart);
    } catch {
      throw new GateError(`${label} path has malformed or non-UTF-8 percent encoding: ${JSON.stringify(rawPath)}`);
    }
    if (decoded === "." || decoded === ".." || decoded.includes("\\") || decoded.includes("\0")) {
      throw new GateError(`unsafe ${label} path: ${JSON.stringify(rawPath)}`);
    }
  }
  return rawPath;
}

function checkedUrl(value, expectedOrigin, label) {
  preNormalizationPath(value, label);
  let parsed;
  try {
    parsed = new URL(value);
  } catch (error) {
    throw new GateError(`${label} is not a valid URL: ${JSON.stringify(value)} (${error.message})`);
  }
  if (!new Set(["http:", "https:"]).has(parsed.protocol) || !parsed.hostname) {
    throw new GateError(`${label} must be an absolute HTTP(S) URL: ${JSON.stringify(value)}`);
  }
  if (parsed.username || parsed.password) {
    throw new GateError(`${label} cannot contain user information: ${JSON.stringify(value)}`);
  }
  if (expectedOrigin !== null && parsed.origin !== expectedOrigin) {
    throw new GateError(`${label} origin ${JSON.stringify(parsed.origin)} does not match site origin ${JSON.stringify(expectedOrigin)}: ${JSON.stringify(value)}`);
  }
  if (parsed.search || parsed.hash) {
    throw new GateError(`${label} cannot carry a query or fragment: ${JSON.stringify(value)}`);
  }
  return parsed;
}

export function normalizeSiteOrigin(value) {
  const parsed = checkedUrl(value, null, "site origin");
  if (parsed.pathname !== "/") {
    throw new GateError(`site origin must not contain a path, query, or fragment: ${JSON.stringify(value)}`);
  }
  return parsed.origin;
}

function safeUrlPath(parsed, label) {
  const rawPath = parsed.pathname || "/";
  const parts = [];
  for (const rawPart of rawPath.split("/")) {
    if (!rawPart) continue;
    let decoded;
    try {
      decoded = decodeURIComponent(rawPart);
    } catch {
      throw new GateError(`${label} path is not UTF-8: ${JSON.stringify(rawPath)}`);
    }
    if (decoded === "." || decoded === ".." || decoded.includes("/") || decoded.includes("\\") || decoded.includes("\0")) {
      throw new GateError(`unsafe ${label} path: ${JSON.stringify(rawPath)}`);
    }
    parts.push(decoded);
  }
  const trailingSlash = rawPath.endsWith("/") && parts.length > 0;
  return { parts, decodedPath: parts.length ? `/${parts.join("/")}${trailingSlash ? "/" : ""}` : "/" };
}

function insideRoot(root, candidate) {
  const delta = relative(root, candidate);
  return delta === "" || (!delta.startsWith(`..${sep}`) && delta !== ".." && !delta.startsWith(sep));
}

function exactLexicalPath(buildRoot, parts, location) {
  let lexical = buildRoot;
  for (const part of parts) {
    let names;
    try {
      if (!statSync(lexical).isDirectory()) return null;
      names = readdirSync(lexical);
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
      throw new GateError(`cannot enumerate built path for ${JSON.stringify(location)}: ${error.message}`);
    }
    if (!names.includes(part)) return null;
    lexical = join(lexical, part);
    const actual = realpathSync(lexical);
    if (!insideRoot(buildRoot, actual)) throw new GateError(`path symlink escapes build directory: ${JSON.stringify(location)}`);
  }
  return lexical;
}

function safeExistingArtifact(buildRoot, parts, location) {
  const lexical = exactLexicalPath(buildRoot, parts, location);
  if (lexical === null) return null;
  if (!insideRoot(buildRoot, lexical)) throw new GateError(`path escapes build directory: ${JSON.stringify(location)}`);
  const actual = realpathSync(lexical);
  if (!insideRoot(buildRoot, actual)) throw new GateError(`path symlink escapes build directory: ${JSON.stringify(location)}`);
  return statSync(actual).isFile() ? { publicPath: lexical, file: actual } : null;
}

function safeExistingPath(buildRoot, parts, location) {
  return safeExistingArtifact(buildRoot, parts, location)?.file || null;
}

function safeExistingDirectory(buildRoot, parts, location) {
  const lexical = exactLexicalPath(buildRoot, parts, location);
  if (lexical === null) return null;
  const actual = realpathSync(lexical);
  if (!insideRoot(buildRoot, actual)) throw new GateError(`path symlink escapes build directory: ${JSON.stringify(location)}`);
  return statSync(actual).isDirectory() ? actual : null;
}

function parseStrictSitemap(xml, label) {
  const stack = [];
  let root = null;
  let failure = null;
  const parser = new SaxesParser({ xmlns: true });
  parser.on("error", (error) => {
    failure ||= new GateError(`cannot parse local sitemap ${label}: ${error.message}`);
  });
  parser.on("opentag", (tag) => {
    const node = { local: tag.local, uri: tag.uri, text: "", directLocs: [] };
    if (stack.length === 0) root = node;
    stack.push(node);
  });
  parser.on("text", (value) => {
    if (stack.length) stack.at(-1).text += value;
  });
  parser.on("cdata", (value) => {
    if (stack.length) stack.at(-1).text += value;
  });
  parser.on("closetag", () => {
    const node = stack.pop();
    const parent = stack.at(-1);
    if (node?.local === "loc" && node.uri === SITEMAP_NAMESPACE && parent) {
      parent.directLocs.push(node.text.trim());
    }
  });
  try {
    parser.write(xml).close();
  } catch (error) {
    failure ||= new GateError(`cannot parse local sitemap ${label}: ${error.message}`);
  }
  if (failure) throw failure;
  if (!root || root.uri !== SITEMAP_NAMESPACE || !new Set(["urlset", "sitemapindex"]).has(root.local)) {
    throw new GateError(`unsupported sitemap root or namespace: ${label}`);
  }

  // Parse again to retain only direct root/entry/loc elements and reject malformed entries.
  const entries = [];
  const frames = [];
  const direct = new SaxesParser({ xmlns: true });
  direct.on("error", (error) => { throw error; });
  direct.on("opentag", (tag) => frames.push({ local: tag.local, uri: tag.uri, text: "", locs: [] }));
  direct.on("text", (value) => { if (frames.length) frames.at(-1).text += value; });
  direct.on("cdata", (value) => { if (frames.length) frames.at(-1).text += value; });
  direct.on("closetag", () => {
    const node = frames.pop();
    const parent = frames.at(-1);
    if (node.local === "loc" && node.uri === SITEMAP_NAMESPACE && frames.length === 2) {
      parent.locs.push(node.text.trim());
    }
    const expectedEntry = root.local === "urlset" ? "url" : "sitemap";
    if (node.local === expectedEntry && node.uri === SITEMAP_NAMESPACE && frames.length === 1) {
      if (node.locs.length !== 1 || !node.locs[0]) {
        throw new GateError(`sitemap ${expectedEntry} must contain exactly one direct loc element`);
      }
      entries.push(node.locs[0]);
    }
  });
  try {
    direct.write(xml).close();
  } catch (error) {
    if (error instanceof GateError) throw error;
    throw new GateError(`cannot parse local sitemap ${label}: ${error.message}`);
  }
  if (entries.length === 0) throw new GateError(`sitemap has no usable locations: ${label}`);
  return { kind: root.local, locations: entries };
}

function localSitemapPath(buildRoot, location, siteOrigin) {
  const parsed = checkedUrl(location, siteOrigin, "sitemap location");
  const safe = safeUrlPath(parsed, "sitemap URL");
  const path = safeExistingPath(buildRoot, safe.parts, location);
  if (path === null) throw new GateError(`local sitemap does not exist: ${location}`);
  return path;
}

export function sitemapUrls(buildDir, siteOrigin) {
  const buildRoot = realpathSync(resolve(buildDir));
  const origin = typeof siteOrigin === "string" ? normalizeSiteOrigin(siteOrigin) : siteOrigin;
  const rootSitemap = safeExistingPath(buildRoot, ["sitemap.xml"], "sitemap.xml");
  if (rootSitemap === null) throw new GateError("local root sitemap does not exist: sitemap.xml");
  const pending = [rootSitemap];
  const visited = new Set();
  const urls = [];
  while (pending.length) {
    const sitemap = realpathSync(pending.pop());
    if (!insideRoot(buildRoot, sitemap)) throw new GateError(`sitemap escapes build directory: ${sitemap}`);
    if (visited.has(sitemap)) throw new GateError(`sitemap index cycle or duplicate: ${sitemap}`);
    visited.add(sitemap);
    let parsed;
    try {
      parsed = parseStrictSitemap(readFileSync(sitemap, "utf8"), sitemap);
    } catch (error) {
      if (error instanceof GateError) throw error;
      throw new GateError(`cannot read local sitemap ${sitemap}: ${error.message}`);
    }
    if (parsed.kind === "sitemapindex") {
      for (const value of parsed.locations) pending.push(localSitemapPath(buildRoot, value, origin));
    } else {
      for (const value of parsed.locations) {
        checkedUrl(value, origin, "page location");
        urls.push(value);
      }
    }
  }
  const duplicates = urls.filter((value, index) => urls.indexOf(value) !== index);
  if (duplicates.length) throw new GateError(`duplicate sitemap URL: ${[...new Set(duplicates)].sort(compareText).slice(0, 5).join(", ")}`);
  return urls.sort(compareText);
}

function htmlFilesWithStem(buildRoot, directoryParts, stem, location) {
  const directory = safeExistingDirectory(buildRoot, directoryParts, location);
  if (directory === null) return [];
  let children;
  try {
    children = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    throw new GateError(`cannot enumerate built HTML directory ${directory}: ${error.message}`);
  }
  return children
    .filter((entry) => entry.isFile() || entry.isSymbolicLink())
    .filter((entry) => basename(entry.name, extname(entry.name)) === stem && HTML_SUFFIXES.has(extname(entry.name).toLowerCase()))
    .map((entry) => safeExistingPath(buildRoot, [...directoryParts, entry.name], location))
    .filter((path) => path !== null)
    .sort(compareText);
}

function pageFile(buildRoot, location, siteOrigin) {
  const parsed = checkedUrl(location, siteOrigin, "page location");
  const route = parsed.pathname || "/";
  const safe = safeUrlPath(parsed, "page URL");
  const parts = safe.parts;
  let candidates;
  if (route.endsWith("/")) {
    candidates = htmlFilesWithStem(buildRoot, parts, "index", location);
  } else if (parts.length && HTML_SUFFIXES.has(extname(parts.at(-1)).toLowerCase())) {
    candidates = [join(buildRoot, ...parts)];
  } else {
    const nested = htmlFilesWithStem(buildRoot, parts, "index", location);
    const flat = htmlFilesWithStem(buildRoot, parts.slice(0, -1), parts.at(-1) || "index", location);
    candidates = [...nested, ...flat];
  }
  const existing = [];
  for (const candidate of candidates) {
    const actual = safeExistingPath(buildRoot, relative(buildRoot, candidate).split(sep), location);
    if (actual !== null && !existing.includes(actual)) existing.push(actual);
  }
  if (existing.length === 0) throw new MissingBuiltHtml(`missing built HTML for ${JSON.stringify(location)}`);
  if (existing.length !== 1) throw new GateError(`ambiguous built HTML for ${JSON.stringify(location)}`);
  return { route, policyPath: safe.decodedPath, file: existing[0] };
}

function exactBuiltArtifact(buildRoot, location, siteOrigin) {
  const parsed = checkedUrl(location, siteOrigin, "page location");
  if (parsed.pathname.endsWith("/")) return null;
  return safeExistingArtifact(buildRoot, safeUrlPath(parsed, "page URL").parts, location);
}

function encodedRelativeRoute(relativePath) {
  return relativePath.split(sep).map((part) => encodeURIComponent(part)).join("/");
}

function inferredRoute(buildRoot, publicFile) {
  const relativePath = relative(buildRoot, publicFile);
  const sourceSuffix = extname(relativePath);
  const suffix = sourceSuffix.toLowerCase();
  const stem = basename(relativePath, sourceSuffix);
  if (HTML_SUFFIXES.has(suffix) && stem === "index") {
    const parent = dirname(relativePath);
    return {
      route: parent === "." ? "/" : `/${encodedRelativeRoute(parent)}/`,
      policyPath: parent === "." ? "/" : `/${parent.split(sep).join("/")}/`,
    };
  }
  return { route: `/${encodedRelativeRoute(relativePath)}`, policyPath: `/${relativePath.split(sep).join("/")}` };
}

function allBuiltHtml(buildRoot) {
  const output = [];
  const seenFiles = new Set();
  const seenDirectories = new Set();
  function visit(publicDirectory) {
    const actualDirectory = realpathSync(publicDirectory);
    if (!insideRoot(buildRoot, actualDirectory)) throw new GateError(`built HTML symlink escapes build directory: ${publicDirectory}`);
    if (seenDirectories.has(actualDirectory)) throw new GateError(`built directory symlink creates a cycle or duplicate: ${publicDirectory}`);
    seenDirectories.add(actualDirectory);
    const entries = readdirSync(publicDirectory, { withFileTypes: true }).sort((a, b) => compareText(a.name, b.name));
    for (const entry of entries) {
      const publicPath = join(publicDirectory, entry.name);
      const info = entry.isSymbolicLink() ? statSync(publicPath) : null;
      if (entry.isDirectory() || info?.isDirectory()) {
        visit(publicPath);
      } else if ((entry.isFile() || info?.isFile()) && HTML_SUFFIXES.has(extname(entry.name).toLowerCase())) {
        const actual = realpathSync(publicPath);
        if (!insideRoot(buildRoot, actual)) throw new GateError(`built HTML symlink escapes build directory: ${publicPath}`);
        if (seenFiles.has(actual)) throw new GateError(`more than one built path maps to the same HTML file: ${publicPath}`);
        seenFiles.add(actual);
        output.push({ file: actual, publicFile: publicPath });
      }
    }
  }
  visit(buildRoot);
  if (output.length === 0) throw new GateError(`build directory contains no HTML files: ${buildRoot}`);
  return output;
}

function attrsOf(node) {
  const attrs = new Map();
  for (const attr of node.attrs || []) if (!attrs.has(attr.name.toLowerCase())) attrs.set(attr.name.toLowerCase(), attr.value);
  return attrs;
}

function normalizedWhitespace(value) {
  return value.replace(/[\t\n\f\r ]+/gu, " ").trim();
}

function normalizedTitleWhitespace(value) {
  return value.replace(/[\t\n\f\r ]+/gu, " ").replace(/^ /u, "").replace(/ $/u, "");
}

function textContent(node) {
  if (node.nodeName === "#text") return node.value || "";
  return (node.childNodes || []).map(textContent).join("");
}

function htmlElements(root) {
  const result = [];
  function visit(node) {
    if (node.tagName && node.namespaceURI === HTML_NAMESPACE) result.push(node);
    for (const child of node.childNodes || []) visit(child);
  }
  visit(root);
  return result;
}

function cssValueTokens(value) {
  const tokens = [];
  csstree.tokenize(value, (type, start, end) => tokens.push({ type, text: value.slice(start, end) }));
  return tokens;
}

function decodedFunctionName(token) {
  return csstree.ident.decode(token.text.slice(0, -1)).toLowerCase();
}

function matchingFunctionEnd(tokens, start) {
  let depth = 1;
  for (let index = start + 1; index < tokens.length; index += 1) {
    if (tokens[index].type === csstree.tokenTypes.Function || tokens[index].type === csstree.tokenTypes.LeftParenthesis) depth += 1;
    else if (tokens[index].type === csstree.tokenTypes.RightParenthesis) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function significantCssTokens(tokens) {
  return tokens.filter((token) => token.type !== csstree.tokenTypes.WhiteSpace && token.type !== csstree.tokenTypes.Comment);
}

function topLevelComma(tokens, start, end) {
  let depth = 0;
  for (let index = start; index < end; index += 1) {
    const type = tokens[index].type;
    if (type === csstree.tokenTypes.Function || type === csstree.tokenTypes.LeftParenthesis) depth += 1;
    else if (type === csstree.tokenTypes.RightParenthesis) depth -= 1;
    else if (type === csstree.tokenTypes.Comma && depth === 0) return index;
  }
  return end;
}

function validDynamicFunction(tokens, start, end, name) {
  const comma = topLevelComma(tokens, start + 1, end);
  const head = significantCssTokens(tokens.slice(start + 1, comma));
  if (name === "var") {
    return head.length === 1
      && head[0].type === csstree.tokenTypes.Ident
      && csstree.ident.decode(head[0].text).startsWith("--")
      && csstree.ident.decode(head[0].text).length > 2;
  }
  if (name === "env") {
    if (!head.length || head[0].type !== csstree.tokenTypes.Ident) return false;
    return head.slice(1).every((token) => token.type === csstree.tokenTypes.Number && /^\+?[0-9]+$/u.test(token.text));
  }
  if (!head.length || head[0].type !== csstree.tokenTypes.Ident) return false;
  const type = head.slice(1);
  if (type.length === 0) return true;
  if (type.length === 1) {
    return type[0].type === csstree.tokenTypes.Ident
      || (type[0].type === csstree.tokenTypes.Delim && type[0].text === "%");
  }
  return type[0].type === csstree.tokenTypes.Function
    && decodedFunctionName(type[0]) === "type"
    && matchingFunctionEnd(type, 0) === type.length - 1
    && significantCssTokens(type.slice(1, -1)).length > 0;
}

function dynamicCssSyntax(value) {
  const tokens = cssValueTokens(value);
  let contains = false;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.type !== csstree.tokenTypes.Function) continue;
    const name = decodedFunctionName(token);
    if (!new Set(["var", "env", "attr"]).has(name)) continue;
    contains = true;
    const end = matchingFunctionEnd(tokens, index);
    if (end < 0 || !validDynamicFunction(tokens, index, end, name)) return { contains, valid: false };
  }
  return { contains, valid: true };
}

function inlineDeclarations(style) {
  if (!style) return { display: null, visibility: null, contentVisibility: null };
  let ast;
  try {
    ast = csstree.parse(style, { context: "declarationList", positions: false });
  } catch (error) {
    throw new GateError(`cannot parse inline style: ${JSON.stringify(style)} (${error.message})`);
  }
  const winners = new Map();
  for (const declaration of ast.children.toArray()) {
    if (declaration.type !== "Declaration") continue;
    const property = csstree.ident.decode(declaration.property).toLowerCase();
    if (property !== "all" && !TRACKED_CSS_PROPERTIES.includes(property)) continue;
    const decodedValue = csstree.clone(declaration.value);
    csstree.walk(decodedValue, (node) => {
      if (node.type === "Identifier" || node.type === "Function") node.name = csstree.ident.decode(node.name);
    });
    let valid = false;
    try {
      valid = csstree.lexer.matchProperty(property, decodedValue).matched !== null;
    } catch {
      valid = false;
    }
    const dynamicSyntax = dynamicCssSyntax(csstree.generate(decodedValue));
    if (!dynamicSyntax.valid || (!valid && !dynamicSyntax.contains)) continue;
    const dynamic = dynamicSyntax.contains;
    const targets = property === "all" ? TRACKED_CSS_PROPERTIES : [property];
    for (const target of targets) {
      const prior = winners.get(target);
      if (!prior || declaration.important || !prior.important) {
        winners.set(target, { decodedValue, important: Boolean(declaration.important), dynamic, sourceProperty: property });
      }
    }
  }
  const output = { display: null, visibility: null, contentVisibility: null };
  for (const [property, winner] of winners) {
    if (winner.dynamic) throw new GateError(`cannot resolve dynamic inline ${winner.sourceProperty} declaration affecting ${property}`);
    const nodes = winner.decodedValue.children?.toArray?.() || [];
    if (nodes.length !== 1 || nodes[0].type !== "Identifier") {
      // Multi-keyword display values cannot hide an element. Visibility accepts one keyword only.
      if (property !== "display") throw new GateError(`cannot resolve inline ${property} declaration: ${csstree.generate(winner.decodedValue)}`);
      output.display = csstree.generate(winner.decodedValue).toLowerCase();
      continue;
    }
    const value = csstree.ident.decode(nodes[0].name).toLowerCase();
    if (value === "revert-layer") throw new GateError(`cannot resolve inline ${winner.sourceProperty} declaration using revert-layer`);
    if (property === "content-visibility") output.contentVisibility = value;
    else output[property] = value;
  }
  return output;
}

function initialCssValue(property) {
  if (property === "display") return "inline";
  return "visible";
}

function resolvedCssValue(property, authored, parent, userAgent) {
  if (authored === null || authored === "revert") return userAgent;
  if (authored === "initial") return initialCssValue(property);
  if (authored === "inherit") return parent;
  if (authored === "unset") return property === "visibility" ? parent : initialCssValue(property);
  return authored;
}

function userAgentDefaults(node, attrs, isHtml, parent) {
  const defaults = { display: "inline", visibility: parent.visibility, contentVisibility: "visible" };
  if (!isHtml) return defaults;
  if (attrs.has("hidden")) {
    if ((attrs.get("hidden") || "").toLowerCase() === "until-found") defaults.contentVisibility = "hidden";
    else defaults.display = "none";
  }
  if ((node.tagName === "dialog" && !attrs.has("open")) || attrs.has("popover") || UA_DISPLAY_NONE_TAGS.has(node.tagName)) {
    defaults.display = "none";
  }
  return defaults;
}

function elementState(node, attrs, parent) {
  const isHtml = node.namespaceURI === HTML_NAMESPACE;
  const inline = inlineDeclarations(attrs.get("style") || "");
  const userAgent = userAgentDefaults(node, attrs, isHtml, parent);
  const display = resolvedCssValue("display", inline.display, parent.display, userAgent.display);
  const contentVisibility = resolvedCssValue(
    "content-visibility",
    inline.contentVisibility,
    parent.contentVisibility,
    userAgent.contentVisibility,
  );
  const visibility = resolvedCssValue("visibility", inline.visibility, parent.visibility, userAgent.visibility);
  const hard = parent.hard
    || (isHtml && attrs.has("inert"))
    || (attrs.get("aria-hidden") || "").trim().toLowerCase() === "true"
    || display === "none"
    || contentVisibility === "hidden";
  if (!new Set(["hidden", "collapse", "visible"]).has(visibility)) {
    throw new GateError(`cannot resolve inline visibility declaration: ${visibility}`);
  }
  return { hard, display, visibility, contentVisibility };
}

function htmlNonNegativeInteger(value) {
  if (value === undefined) return null;
  const match = /^[\t\n\f\r ]*\+?([0-9]+)/u.exec(value);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isSafeInteger(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function isTrackingImage(attrs) {
  const width = htmlNonNegativeInteger(attrs.get("width"));
  const height = htmlNonNegativeInteger(attrs.get("height"));
  return width !== null && height !== null && width <= 2 && height <= 2;
}

export function robotsDisallowIndexing(values) {
  const tokens = new Set(values.flatMap((value) => value.trim().toLowerCase().split(/[,\s]+/u).filter(Boolean)));
  return tokens.has("noindex") || tokens.has("none");
}

function normalizedOpenDetails(document) {
  const open = new Set();
  const named = new Set();
  function visit(node) {
    if (node.tagName === "details" && node.namespaceURI === HTML_NAMESPACE) {
      const attrs = attrsOf(node);
      if (attrs.has("open")) {
        const name = attrs.get("name") || "";
        if (!name || !named.has(name)) {
          open.add(node);
          if (name) named.add(name);
        }
      }
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(document);
  return open;
}

function firstDirectSummary(details) {
  return (details.childNodes || []).find((node) => node.tagName === "summary" && node.namespaceURI === HTML_NAMESPACE) || null;
}

export function parsePage(route, file, { inSitemap, policyPath = route }) {
  let payload;
  try {
    payload = readFileSync(file);
  } catch (error) {
    throw new GateError(`cannot read built HTML ${file}: ${error.message}`);
  }
  let document;
  try {
    document = parseHtml(payload.toString("utf8"), { scriptingEnabled: true });
  } catch (error) {
    throw new GateError(`cannot parse built HTML ${file}: ${error.message}`);
  }
  const elements = htmlElements(document);
  const titleNode = elements.find((node) => node.tagName === "title");
  const title = titleNode ? normalizedTitleWhitespace(textContent(titleNode)) : null;
  let description = null;
  const robots = [];
  const head = elements.find((node) => node.tagName === "head");
  for (const node of head?.childNodes || []) {
    if (node.namespaceURI !== HTML_NAMESPACE) continue;
    if (node.tagName !== "meta") continue;
    const attrs = attrsOf(node);
    const name = (attrs.get("name") || "").toLowerCase();
    const content = (attrs.get("content") || "").trim();
    if (name === "description" && description === null) description = content;
    if (name === "robots" || name === "googlebot") robots.push(content);
  }

  const h1Records = [];
  let imagesWithoutAlt = 0;
  const activeH1s = [];
  const openDetails = normalizedOpenDetails(document);
  function visit(node, parentState, inertContext) {
    if (node.nodeName === "#text") {
      if (!inertContext && !parentState.hard && parentState.visibility === "visible") {
        for (const record of activeH1s) record.parts.push(node.value || "");
      }
      return;
    }
    if (!node.tagName) {
      for (const child of node.childNodes || []) visit(child, parentState, inertContext);
      return;
    }
    const attrs = attrsOf(node);
    const isHtml = node.namespaceURI === HTML_NAMESPACE;
    const state = elementState(node, attrs, parentState);
    const nextInert = inertContext || (isHtml && SEMANTICALLY_INERT.has(node.tagName));
    const isH1 = isHtml && node.tagName === "h1" && !nextInert && !state.hard;
    let record = null;
    if (isH1) {
      record = { parts: [], exposed: state.visibility === "visible" };
      h1Records.push(record);
      activeH1s.push(record);
    }
    if (!nextInert && !state.hard && state.visibility === "visible") {
      for (const active of activeH1s) active.exposed = true;
      if (isHtml && node.tagName === "img" && !attrs.has("alt") && !isTrackingImage(attrs)) {
        imagesWithoutAlt += 1;
      }
    }
    const closedDetails = isHtml && node.tagName === "details" && !openDetails.has(node);
    const summary = closedDetails ? firstDirectSummary(node) : null;
    for (const child of node.childNodes || []) {
      const childState = closedDetails && child !== summary ? { ...state, hard: true } : state;
      visit(child, childState, nextInert);
    }
    if (record !== null) {
      activeH1s.pop();
    }
  }
  visit(document, { hard: false, display: "block", visibility: "visible", contentVisibility: "visible" }, false);
  const h1s = h1Records.filter((record) => record.exposed).map((record) => normalizedWhitespace(record.parts.join("")));

  return {
    route,
    policy_path: policyPath,
    file,
    in_sitemap: inSitemap,
    html_bytes: payload.length,
    title,
    description,
    noindex: robotsDisallowIndexing(robots),
    h1s,
    images_without_alt: imagesWithoutAlt,
  };
}

export function titleIsOnlyTheSiteSuffix(title) {
  const index = title.lastIndexOf("|");
  return index >= 0 && normalizedTitleWhitespace(title.slice(0, index)) === "";
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort(compareText).map((key) => [key, stableObject(value[key])]));
}

function stateSignature(state) {
  return JSON.stringify(stableObject(state));
}

function finding(rule, path, message, signature = null) {
  if (!(rule in RULES)) throw new GateError(`unclassified gate rule: ${rule}`);
  let identity = `${rule}|${path}`;
  if (signature !== null) identity += `|${sha256Bytes(Buffer.from(signature, "utf8"))}`;
  return { identity, rule, classification: RULES[rule].classification, path, message };
}

function sortedFindings(findings) {
  return findings.sort((a, b) => compareText(a.rule, b.rule) || compareText(a.path, b.path) || compareText(a.identity, b.identity));
}

export function scanBuiltHtml(buildDir, siteOrigin) {
  const rootInput = resolve(buildDir);
  if (!existsSync(rootInput) || !statSync(rootInput).isDirectory()) throw new GateError(`build directory does not exist: ${buildDir}`);
  const root = realpathSync(rootInput);
  const origin = typeof siteOrigin === "string" ? normalizeSiteOrigin(siteOrigin) : siteOrigin;
  const sitemapRoutes = new Map();
  const sitemapArtifacts = new Map();
  for (const location of sitemapUrls(root, origin)) {
    const artifact = exactBuiltArtifact(root, location, origin);
    if (artifact !== null) {
      if (sitemapArtifacts.has(artifact.file)) {
        throw new GateError(`more than one sitemap URL maps to ${artifact.file}: ${JSON.stringify(sitemapArtifacts.get(artifact.file))} and ${JSON.stringify(location)}`);
      }
      sitemapArtifacts.set(artifact.file, location);
      if (!HTML_SUFFIXES.has(extname(artifact.publicPath).toLowerCase())) continue;
    }
    const mapped = pageFile(root, location, origin);
    if (sitemapRoutes.has(mapped.file)) {
      throw new GateError(`more than one sitemap URL maps to ${mapped.file}: ${JSON.stringify(sitemapRoutes.get(mapped.file))} and ${JSON.stringify(mapped.route)}`);
    }
    sitemapRoutes.set(mapped.file, mapped);
  }

  const pages = [];
  const seenRoutes = new Set();
  for (const item of allBuiltHtml(root)) {
    const mapped = sitemapRoutes.get(item.file) || inferredRoute(root, item.publicFile);
    if (seenRoutes.has(mapped.route)) throw new GateError(`more than one built HTML file maps to route ${JSON.stringify(mapped.route)}`);
    seenRoutes.add(mapped.route);
    pages.push(parsePage(mapped.route, item.file, { inSitemap: sitemapRoutes.has(item.file), policyPath: mapped.policyPath }));
  }

  const findings = [];
  for (const page of pages) {
    if (!page.title || titleIsOnlyTheSiteSuffix(page.title)) findings.push(finding("missing-title", page.route, "title is empty"));
    if (page.images_without_alt) {
      findings.push(finding("images-missing-alt", page.route, `${page.images_without_alt} statically exposed HTML image(s) lack an alt attribute`, stateSignature({ count: page.images_without_alt })));
    }
    if (page.html_bytes > HEAVY_BYTES) {
      findings.push(finding("heavy-page", page.route, `${page.html_bytes} bytes exceeds the ${HEAVY_BYTES}-byte estate guardrail`, stateSignature({ bytes: page.html_bytes })));
    }
    const guide = page.policy_path === "/guides" || page.policy_path === "/guides/" || page.policy_path.startsWith("/guides/");
    if ((!page.in_sitemap || page.noindex) && !guide) continue;
    if (page.in_sitemap && !page.noindex && !page.description) findings.push(finding("missing-description", page.route, "meta description is empty"));
    if (!page.h1s.length || !page.h1s[0]) {
      const signature = stateSignature({ count: page.h1s.length, first: page.h1s.length ? "empty" : "absent" });
      findings.push(finding("missing-h1", page.route, "first h1 is absent or empty", signature));
    }
    else if (page.h1s.length > 1) findings.push(finding("multiple-h1", page.route, `found ${page.h1s.length} h1 elements`, stateSignature({ count: page.h1s.length })));
  }

  for (const [field, rule] of [["title", "duplicate-title"], ["description", "duplicate-description"]]) {
    const groups = new Map();
    for (const page of pages) {
      if (!page.in_sitemap || page.noindex) continue;
      const value = (page[field] || "").trim();
      if (!value) continue;
      if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(page);
    }
    for (const [value, group] of groups) {
      if (group.length < 2) continue;
      const paths = group.map((page) => page.route).sort(compareText);
      const signature = stateSignature({ count: group.length, paths, value });
      for (const page of group) findings.push(finding(rule, page.route, `value is shared by ${group.length} pages`, signature));
    }
  }
  return { pages: pages.sort((a, b) => compareText(a.route, b.route)), findings: sortedFindings(findings) };
}

export function loadBaseline(path) {
  if (path === null || path === undefined) return new Map();
  const value = loadJson(path, "gate baseline");
  exactKeys(value, ["schema", "contract", "ruleset_version", "allowed"], "gate baseline");
  if (value.schema !== BASELINE_SCHEMA || value.contract !== CONTRACT_SCHEMA) throw new GateError("gate baseline schema or contract is not supported");
  if (value.ruleset_version !== RULESET_VERSION) throw new GateError(`baseline ruleset ${JSON.stringify(value.ruleset_version)} does not match ${RULESET_VERSION}`);
  if (!Array.isArray(value.allowed)) throw new GateError("gate baseline allowed field must be a list");
  const allowed = new Map();
  for (const entry of value.allowed) {
    exactKeys(entry, ["identity", "reason"], "baseline entry");
    if (typeof entry.identity !== "string" || !entry.identity || typeof entry.reason !== "string" || !entry.reason.trim()) {
      throw new GateError("baseline identity and reason must be non-empty strings");
    }
    if (!(entry.identity.split("|", 1)[0] in RULES)) throw new GateError(`baseline identity names an unknown rule: ${entry.identity}`);
    if (allowed.has(entry.identity)) throw new GateError(`duplicate baseline identity: ${entry.identity}`);
    allowed.set(entry.identity, entry.reason.trim());
  }
  return allowed;
}

export function runGate(buildDir, { siteOrigin, baselinePath = null }) {
  requireNode22();
  const origin = normalizeSiteOrigin(siteOrigin);
  const { pages, findings } = scanBuiltHtml(buildDir, origin);
  const allowed = loadBaseline(baselinePath);
  const identities = new Set(findings.map((item) => item.identity));
  const regressions = findings.filter((item) => !allowed.has(item.identity));
  const accepted = findings.filter((item) => allowed.has(item.identity)).map((item) => ({ ...item, baseline_reason: allowed.get(item.identity) }));
  const stale = [...allowed.entries()].filter(([identity]) => !identities.has(identity)).sort(([a], [b]) => compareText(a, b)).map(([identity, reason]) => ({ identity, reason }));
  const counts = {};
  for (const item of findings) counts[item.rule] = (counts[item.rule] || 0) + 1;
  return {
    schema: REPORT_SCHEMA,
    contract: CONTRACT_SCHEMA,
    ruleset_version: RULESET_VERSION,
    site_origin: origin,
    checked_pages: pages.length,
    checked_index_pages: pages.filter((page) => page.in_sitemap && !page.noindex).length,
    counts: Object.fromEntries(Object.entries(counts).sort(([a], [b]) => compareText(a, b))),
    findings,
    accepted_findings: accepted,
    regressions,
    stale_baseline: stale,
  };
}

function printText(report) {
  console.log(`site build gate v${report.ruleset_version}: ${report.checked_pages} pages, ${report.regressions.length} regression(s), ${report.accepted_findings.length} accepted finding(s)`);
  for (const item of report.regressions) console.log(`ERROR ${item.rule} [${item.classification}] ${item.path}: ${item.message}`);
  for (const item of report.accepted_findings) console.log(`ACCEPTED ${item.rule} ${item.path}: ${item.baseline_reason}`);
  for (const item of report.stale_baseline) console.log(`RESOLVED ${item.identity}: baseline entry can be removed`);
}

function parseArgs(argv) {
  const args = { buildDir: null, siteOrigin: null, baseline: null, manifest: join(dirname(fileURLToPath(import.meta.url)), "manifest.json"), format: "text" };
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index];
    const value = argv[index + 1];
    if (!value || !new Set(["--build-dir", "--site-origin", "--baseline", "--manifest", "--format"]).has(name)) throw new GateError(`invalid or incomplete argument: ${name || "<missing>"}`);
    if (name === "--build-dir") args.buildDir = value;
    else if (name === "--site-origin") args.siteOrigin = value;
    else if (name === "--baseline") args.baseline = value;
    else if (name === "--manifest") args.manifest = value;
    else args.format = value;
  }
  if (!args.buildDir || !args.siteOrigin) throw new GateError("--build-dir and --site-origin are required");
  if (!new Set(["text", "json"]).has(args.format)) throw new GateError("--format must be text or json");
  return args;
}

export function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArgs(argv);
    const artifact = fileURLToPath(import.meta.url);
    verifyContract(artifact, resolve(args.manifest));
    const report = runGate(args.buildDir, { siteOrigin: args.siteOrigin, baselinePath: args.baseline });
    if (args.format === "json") console.log(JSON.stringify(report, null, 2));
    else printText(report);
    return report.regressions.length ? 1 : 0;
  } catch (error) {
    console.error(`site build gate contract error: ${error.message}`);
    return 2;
  }
}

function isDirectInvocation() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(process.argv[1]));
  } catch {
    return false;
  }
}

if (isDirectInvocation()) {
  process.exitCode = main();
}
