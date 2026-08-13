import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {isSitemapIncludedRoute, normalizeRoutePath} = require('../../seo.config');

describe('SEO sitemap configuration', () => {
  it('normalizes absolute URLs and trailing slashes', () => {
    expect(normalizeRoutePath('https://learn.netdata.cloud/docs/example/')).toBe('/docs/example');
  });

  it('excludes only functional and canonical replacement routes', () => {
    expect(isSitemapIncludedRoute('/blog/')).toBe(false);
    expect(isSitemapIncludedRoute('/search')).toBe(false);
    expect(isSitemapIncludedRoute('/docs/ask-netdata')).toBe(false);
  });

  it('includes normal documentation and all libnetdata routes', () => {
    expect(isSitemapIncludedRoute('/')).toBe(true);
    expect(isSitemapIncludedRoute('/docs/netdata-agent/quickstart-deployment')).toBe(true);
    expect(isSitemapIncludedRoute('/docs/developer-and-contributor-corner/libnetdata')).toBe(true);
    expect(isSitemapIncludedRoute('/docs/developer-and-contributor-corner/libnetdata/socket')).toBe(true);
  });
});
