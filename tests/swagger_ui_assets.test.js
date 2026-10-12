const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const {
  SWAGGER_UI_ASSETS,
  SWAGGER_UI_STATIC_DIR,
  stageSwaggerUiAssets,
} = require('../src/plugins/swagger-ui-assets.js');

test('the API page loads only Learn-owned files and staged Swagger UI assets', () => {
  const api = fs.readFileSync(path.join(root, 'static', 'api.html'), 'utf8');
  const localReferences = [...api.matchAll(/(?:src|href)="\.?\/?([^"/:]+\.(?:css|js|png))"/g)]
    .map((match) => match[1])
    .filter((filename) => !fs.existsSync(path.join(root, 'static', filename)));
  assert.deepEqual(
    localReferences.sort(),
    ['favicon-16x16.png', 'favicon-32x32.png', 'index.css', 'swagger-ui-bundle.js', 'swagger-ui-standalone-preset.js', 'swagger-ui.css'],
  );
  for (const filename of localReferences) {
    assert.ok(SWAGGER_UI_ASSETS.includes(filename), `${filename} must be staged from swagger-ui-dist`);
  }
});

test('the installed swagger-ui-dist provides every staged asset', () => {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-swagger-ui-'));
  try {
    fs.symlinkSync(path.join(root, 'node_modules'), path.join(siteDir, 'node_modules'), 'dir');
    const {version} = require('swagger-ui-dist/package.json');
    assert.deepEqual(stageSwaggerUiAssets(siteDir), {version, files: SWAGGER_UI_ASSETS.length});
    assert.deepEqual(
      fs.readdirSync(path.join(siteDir, SWAGGER_UI_STATIC_DIR)).sort(),
      [...SWAGGER_UI_ASSETS].sort(),
    );
  } finally {
    fs.rmSync(siteDir, {recursive: true, force: true});
  }
});

test('Learn does not publish the unused Swagger UI OAuth2 redirect page', () => {
  assert.ok(!SWAGGER_UI_ASSETS.some((filename) => filename.startsWith('oauth2-redirect')));
  assert.ok(!fs.existsSync(path.join(root, 'static', 'oauth2-redirect.html')));
});
