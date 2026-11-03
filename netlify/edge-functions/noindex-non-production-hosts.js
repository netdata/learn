// Netlify serves every deploy of this site on extra hosts: deploy previews, branch deploys,
// deploy permalinks and the site's netlify.app name. They copy learn.netdata.cloud page for
// page, so only the canonical host may be indexed; every other host answers noindex.

export const INDEXABLE_HOST = 'learn.netdata.cloud';

export function isIndexableHost(hostname) {
  return hostname.toLowerCase() === INDEXABLE_HOST;
}

export default async function noindexNonProductionHosts(request, context) {
  // Returning nothing hands the request on untouched, so the canonical host keeps
  // Netlify's normal static serving, conditional requests included.
  if (isIndexableHost(new URL(request.url).hostname)) return undefined;

  // A conditional request keeps its 304 answer; the header is added to it too.
  const response = await context.next({sendConditionalRequest: true});
  response.headers.set('X-Robots-Tag', 'noindex');
  return response;
}

export const config = {
  path: '/*',
  // Hashed script and style bundles are never indexed; skipping them saves invocations.
  excludedPath: ['/assets/js/*', '/assets/css/*'],
};
