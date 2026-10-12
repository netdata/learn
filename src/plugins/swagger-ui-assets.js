const fs = require('node:fs');
const path = require('node:path');

// static/api.html loads these files from swagger-ui-dist. They are copied from the
// installed package on every start/build, so /api always serves the version locked in
// yarn.lock and nothing from the distribution is committed.
const SWAGGER_UI_ASSETS = Object.freeze([
  'favicon-16x16.png',
  'favicon-32x32.png',
  'index.css',
  'swagger-ui.css',
  'swagger-ui.css.map',
  'swagger-ui-bundle.js',
  'swagger-ui-bundle.js.LICENSE.txt',
  'swagger-ui-bundle.js.map',
  'swagger-ui-standalone-preset.js',
  'swagger-ui-standalone-preset.js.LICENSE.txt',
  'swagger-ui-standalone-preset.js.map',
]);

// Listed in docusaurus.config.js staticDirectories; ignored by git.
const SWAGGER_UI_STATIC_DIR = 'generated-static/swagger-ui';

function stageSwaggerUiAssets(siteDir) {
  const packageJson = require.resolve('swagger-ui-dist/package.json', {paths: [siteDir]});
  const source = path.dirname(packageJson);
  const {version} = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  const target = path.join(siteDir, SWAGGER_UI_STATIC_DIR);

  fs.rmSync(target, {recursive: true, force: true});
  fs.mkdirSync(target, {recursive: true});
  for (const filename of SWAGGER_UI_ASSETS) {
    const file = path.join(source, filename);
    if (!fs.existsSync(file)) {
      throw new Error(`swagger-ui-dist@${version} no longer ships ${filename}; update static/api.html and ${__filename}`);
    }
    fs.copyFileSync(file, path.join(target, filename));
  }
  return {version, files: SWAGGER_UI_ASSETS.length};
}

// Runs while Docusaurus loads plugins, before it collects staticDirectories for the
// dev server or the build output.
function swaggerUiAssetsPlugin(context) {
  stageSwaggerUiAssets(context.siteDir);
  return {name: 'learn-swagger-ui-assets'};
}

module.exports = swaggerUiAssetsPlugin;
module.exports.SWAGGER_UI_ASSETS = SWAGGER_UI_ASSETS;
module.exports.SWAGGER_UI_STATIC_DIR = SWAGGER_UI_STATIC_DIR;
module.exports.stageSwaggerUiAssets = stageSwaggerUiAssets;
