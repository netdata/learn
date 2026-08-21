const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const {
  assetFilenames,
  verifyVendor,
} = require('../scripts/verify-swagger-ui-vendor.js');

test('the static Swagger UI distribution matches its locked provenance contract', () => {
  assert.deepEqual(verifyVendor(), {
    package: 'swagger-ui-dist',
    version: '5.32.14',
    files: assetFilenames.length,
  });
});

test('the custom API page uses the verified local Swagger UI assets', () => {
  const api = fs.readFileSync(path.join(root, 'static', 'api.html'), 'utf8');
  const oauthRedirect = fs.readFileSync(path.join(root, 'static', 'oauth2-redirect.html'), 'utf8');
  assert.match(api, /src="\.\/swagger-ui-bundle\.js"/);
  assert.match(api, /src="\.\/swagger-ui-standalone-preset\.js"/);
  assert.match(api, /src="\.\/swagger-initializer\.js"/);
  assert.match(oauthRedirect, /src="oauth2-redirect\.js"/);

  for (const filename of assetFilenames) {
    assert.ok(fs.existsSync(path.join(root, 'static', filename)), `${filename} must be published`);
  }
});
