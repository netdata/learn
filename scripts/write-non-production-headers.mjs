// Deploy previews and branch deploys copy learn.netdata.cloud page for page, so their
// builds publish a static noindex header rule. A static rule costs nothing per request,
// unlike an edge function. Netlify headers in netlify.toml apply to every deploy context,
// so the rule has to come from the build output of non-production builds only.
import {existsSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const NOINDEX_HEADERS = '/*\n  X-Robots-Tag: noindex\n';

// Netlify sets CONTEXT during builds; local builds leave it unset and stay production-like.
export function needsNoindex(context) {
  return Boolean(context) && context !== 'production';
}

export function writeNonProductionHeaders({publishDir, context}) {
  if (!needsNoindex(context)) return false;
  const headersPath = path.join(publishDir, '_headers');
  if (existsSync(headersPath)) {
    throw new Error(`Refusing to overwrite an existing published headers file: ${headersPath}`);
  }
  writeFileSync(headersPath, NOINDEX_HEADERS);
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const context = process.env.CONTEXT;
  const written = writeNonProductionHeaders({publishDir: path.join(repositoryRoot, 'build'), context});
  console.log(written
    ? `Deploy context ${context}: published build/_headers with X-Robots-Tag: noindex`
    : `Deploy context ${context || '(unset)'}: no noindex header rule published`);
}
