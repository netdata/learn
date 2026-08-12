import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {isIndexableRoute, normalizeRoutePath} = require('../../seo.config');

describe('SEO indexability configuration', () => {
  it('normalizes absolute URLs and trailing slashes', () => {
    expect(normalizeRoutePath('https://learn.netdata.cloud/docs/example/')).toBe('/docs/example');
  });

  it('excludes functional and libnetdata stub routes', () => {
    expect(isIndexableRoute('/')).toBe(false);
    expect(isIndexableRoute('/blog/')).toBe(false);
    expect(isIndexableRoute('/search')).toBe(false);
    expect(isIndexableRoute('/docs/developer-and-contributor-corner/libnetdata/socket')).toBe(false);
  });

  it('keeps normal documentation routes indexable', () => {
    expect(isIndexableRoute('/docs/netdata-agent/quickstart-deployment')).toBe(true);
  });
});
