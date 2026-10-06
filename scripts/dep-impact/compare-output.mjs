// Compares two rendered Learn builds file by file, ignoring content hashes in
// asset names, and reports which outputs a dependency change actually altered.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    a: { type: 'string' },
    b: { type: 'string' },
    'a-root': { type: 'string' },
    'b-root': { type: 'string' },
    config: { type: 'string' },
    json: { type: 'string' },
    markdown: { type: 'string' },
  },
});

for (const name of ['a', 'b', 'config', 'json', 'markdown']) {
  if (!args[name]) {
    console.error(`compare-output: missing --${name}`);
    process.exit(2);
  }
}

const config = JSON.parse(readFileSync(args.config, 'utf8'));
const ignorePaths = (config.outputIgnorePaths ?? []).map((pattern) => new RegExp(pattern));
const ignoreContent = (config.contentIgnorePatterns ?? []).map((pattern) => new RegExp(pattern, 'g'));
const featureMarkers = Object.entries(config.featureMarkers ?? {});

// Docusaurus embeds absolute paths of the build machine in the client bundle
// (preset options such as sidebarPath and customCss). A and B are built in
// different worktrees, so each side's root is replaced by one placeholder.
// Only the in-memory copy used for hashing changes; files on disk do not.
function rootVariants(root) {
  if (!root) return [];
  const variants = new Set([path.resolve(root)]);
  try {
    variants.add(realpathSync(root));
  } catch {
    // A missing root only means there is nothing to replace.
  }
  return [...variants];
}
const rootsA = rootVariants(args['a-root']);
const rootsB = rootVariants(args['b-root']);

const TEXT_EXTENSIONS = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg', '.map', '.mjs']);
const ASSET_HASH_IN_NAME = /\.[0-9a-f]{8,}(?=\.(?:js|css|map|json|txt)$)|-[0-9a-f]{8,}(?=\.\w+$)/;
const ASSET_HASH_IN_TEXT = [
  [/\.[0-9a-f]{8,}\.(js|css|map|json)\b/g, '.HASH.$1'],
  [/-[0-9a-f]{8,}\.(png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|eot)\b/g, '-HASH.$1'],
];

function walk(root) {
  const files = [];
  const stack = [''];
  while (stack.length > 0) {
    const relDir = stack.pop();
    for (const entry of readdirSync(path.join(root, relDir), { withFileTypes: true })) {
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
      if (entry.isDirectory()) stack.push(rel);
      else if (entry.isFile()) files.push(rel);
    }
  }
  return files;
}

// Maps hash-normalized paths to real paths. When two files normalize to the
// same name, both keep their real path so nothing is silently merged.
function indexBuild(root) {
  const index = new Map();
  const collisions = new Set();
  for (const rel of walk(root)) {
    if (ignorePaths.some((pattern) => pattern.test(rel))) continue;
    const key = rel.replace(ASSET_HASH_IN_NAME, '.HASH');
    if (index.has(key)) {
      collisions.add(key);
      index.set(index.get(key), index.get(key));
      index.set(rel, rel);
    } else {
      index.set(key, rel);
    }
  }
  for (const key of collisions) index.delete(key);
  return index;
}

function fingerprint(root, rel, worktreeRoots) {
  const absolute = path.join(root, rel);
  const size = statSync(absolute).size;
  let content = readFileSync(absolute);
  if (TEXT_EXTENSIONS.has(path.extname(rel))) {
    let text = content.toString('utf8');
    for (const [pattern, replacement] of ASSET_HASH_IN_TEXT) text = text.replace(pattern, replacement);
    for (const worktreeRoot of worktreeRoots) text = text.split(worktreeRoot).join('<root>');
    for (const pattern of ignoreContent) text = text.replace(pattern, '');
    content = Buffer.from(text, 'utf8');
  }
  return { size, hash: createHash('sha256').update(content).digest('hex') };
}

function kind(rel) {
  const extension = path.extname(rel);
  if (extension === '.html') return 'html';
  if (extension === '.css') return 'css';
  if (extension === '.js' || extension === '.mjs') return 'js';
  return 'other';
}

function markersIn(root, rel) {
  if (kind(rel) !== 'js') return [];
  const text = readFileSync(path.join(root, rel), 'utf8');
  return featureMarkers.filter(([, marker]) => text.includes(marker)).map(([feature]) => feature);
}

const indexA = indexBuild(args.a);
const indexB = indexBuild(args.b);
const kinds = ['html', 'css', 'js', 'other'];
const totals = Object.fromEntries(kinds.map((k) => [k, { files: 0, changed: 0, added: 0, removed: 0, bytesA: 0, bytesB: 0 }]));
const changed = [];
const added = [];
const removed = [];
const touchedFeatures = new Set();

for (const [key, relA] of indexA) {
  const fpA = fingerprint(args.a, relA, rootsA);
  const bucket = totals[kind(relA)];
  bucket.files += 1;
  bucket.bytesA += fpA.size;
  const relB = indexB.get(key);
  if (relB === undefined) {
    bucket.removed += 1;
    removed.push(relA);
    continue;
  }
  const fpB = fingerprint(args.b, relB, rootsB);
  bucket.bytesB += fpB.size;
  if (fpA.hash !== fpB.hash) {
    bucket.changed += 1;
    changed.push(relB);
    for (const feature of markersIn(args.b, relB)) touchedFeatures.add(feature);
  }
}

for (const [key, relB] of indexB) {
  if (indexA.has(key)) continue;
  const bucket = totals[kind(relB)];
  bucket.added += 1;
  bucket.bytesB += statSync(path.join(args.b, relB)).size;
  added.push(relB);
  for (const feature of markersIn(args.b, relB)) touchedFeatures.add(feature);
}

const identical = changed.length === 0 && added.length === 0 && removed.length === 0;
const result = {
  identical,
  totals,
  touchedFeatures: [...touchedFeatures].sort(),
  changed: changed.sort(),
  added: added.sort(),
  removed: removed.sort(),
};
writeFileSync(args.json, `${JSON.stringify(result, null, 2)}\n`);

const kib = (bytes) => `${(bytes / 1024).toFixed(0)} KiB`;
const delta = (a, b) => (a === 0 ? (b === 0 ? '0%' : 'new') : `${(((b - a) / a) * 100).toFixed(2)}%`);
const sample = (list) => list.slice(0, 20).map((rel) => `- \`${rel}\``).concat(list.length > 20 ? [`- ... and ${list.length - 20} more`] : []);

const lines = ['## Rendered output', ''];
if (identical) {
  lines.push('**Identical.** The dependency change does not alter any rendered file.', '');
} else {
  lines.push('| Type | Files | Changed | Added | Removed | Size A | Size B | Size change |');
  lines.push('|---|---|---|---|---|---|---|---|');
  for (const k of kinds) {
    const t = totals[k];
    lines.push(`| ${k} | ${t.files} | ${t.changed} | ${t.added} | ${t.removed} | ${kib(t.bytesA)} | ${kib(t.bytesB)} | ${delta(t.bytesA, t.bytesB)} |`);
  }
  lines.push('');
  if (result.touchedFeatures.length > 0) {
    lines.push(`Changed JavaScript contains code of: **${result.touchedFeatures.join(', ')}**. Check those features in the browser results.`, '');
  }
  for (const [title, list] of [['Changed files', changed], ['Added files', added], ['Removed files', removed]]) {
    if (list.length === 0) continue;
    lines.push(`### ${title} (${list.length})`, '', ...sample(list), '');
  }
}
writeFileSync(args.markdown, `${lines.join('\n')}\n`);
console.log(identical ? 'Rendered output identical.' : `Rendered output differs: ${changed.length} changed, ${added.length} added, ${removed.length} removed.`);
