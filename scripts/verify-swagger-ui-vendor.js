const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const packageName = 'swagger-ui-dist';
const contractPath = path.join(repositoryRoot, 'static', 'swagger-ui-vendor.json');
const assetFilenames = Object.freeze([
  'favicon-16x16.png',
  'favicon-32x32.png',
  'index.css',
  'oauth2-redirect.html',
  'oauth2-redirect.js',
  'swagger-ui-bundle.js',
  'swagger-ui-bundle.js.LICENSE.txt',
  'swagger-ui-bundle.js.map',
  'swagger-ui-es-bundle-core.js',
  'swagger-ui-es-bundle-core.js.LICENSE.txt',
  'swagger-ui-es-bundle-core.js.map',
  'swagger-ui-es-bundle.js',
  'swagger-ui-es-bundle.js.LICENSE.txt',
  'swagger-ui-es-bundle.js.map',
  'swagger-ui-standalone-preset.js',
  'swagger-ui-standalone-preset.js.LICENSE.txt',
  'swagger-ui-standalone-preset.js.map',
  'swagger-ui.css',
  'swagger-ui.css.map',
  'swagger-ui.js',
  'swagger-ui.js.map',
]);
const contractFields = Object.freeze([
  'algorithm',
  'files',
  'integrity',
  'local_overrides',
  'package',
  'resolved',
  'schema_version',
  'version',
]);
const localOverrides = Object.freeze({
  'oauth2-redirect.html':
    'Adds the non-empty document title required by the Learn static-site gate without changing OAuth redirect behavior.',
});

function sha256(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

function sha256File(filename) {
  return sha256(fs.readFileSync(filename));
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function yarnMetadata(version) {
  const lockfile = fs.readFileSync(path.join(repositoryRoot, 'yarn.lock'), 'utf8');
  const entry = new RegExp(
    `^${escapeRegExp(packageName)}@${escapeRegExp(version)}:\\n((?:^[ \\t].*(?:\\n|$))*)`,
    'm',
  ).exec(lockfile);
  if (!entry) throw new Error(`Missing ${packageName}@${version} from yarn.lock`);

  const section = entry[1];
  const lockedVersion = /^  version "([^"]+)"$/m.exec(section)?.[1];
  const resolved = /^  resolved "([^"]+)"$/m.exec(section)?.[1];
  const integrity = /^  integrity (sha512-\S+)$/m.exec(section)?.[1];
  if (lockedVersion !== version || !resolved || !integrity) {
    throw new Error(`Invalid ${packageName}@${version} yarn.lock entry`);
  }
  return {resolved, integrity};
}

function sourceContext() {
  const rootPackage = readJson(path.join(repositoryRoot, 'package.json'));
  const version = rootPackage.devDependencies?.[packageName];
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version || '')) {
    throw new Error(`${packageName} must be an exact root dev dependency`);
  }

  const sourcePackagePath = require.resolve(`${packageName}/package.json`, {paths: [repositoryRoot]});
  const sourceDirectory = path.dirname(sourcePackagePath);
  if (readJson(sourcePackagePath).version !== version) {
    throw new Error(`Installed ${packageName} does not match package.json`);
  }
  return {version, sourceDirectory, ...yarnMetadata(version)};
}

function validateFileMap(files) {
  if (!files || typeof files !== 'object' || Array.isArray(files)) {
    throw new Error('Swagger UI vendor contract has no file map');
  }
  const filenames = Object.keys(files).sort();
  if (JSON.stringify(filenames) !== JSON.stringify([...assetFilenames].sort())) {
    throw new Error('Swagger UI vendor contract does not cover the active distribution');
  }
  for (const [filename, expected] of Object.entries(files)) {
    if (path.basename(filename) !== filename || !/^[0-9a-f]{64}$/.test(expected)) {
      throw new Error(`Invalid Swagger UI vendor contract entry: ${filename}`);
    }
  }
}

function validateLocalOverrides(overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    throw new Error('Swagger UI vendor contract has no local override map');
  }
  if (
    JSON.stringify(Object.keys(overrides).sort()) !==
    JSON.stringify(Object.keys(localOverrides).sort())
  ) {
    throw new Error('Swagger UI vendor contract has unsupported local overrides');
  }
  for (const [filename, reason] of Object.entries(localOverrides)) {
    const override = overrides[filename];
    if (
      !override ||
      typeof override !== 'object' ||
      Array.isArray(override) ||
      override.reason !== reason ||
      !/^[0-9a-f]{64}$/.test(override.sha256 || '')
    ) {
      throw new Error(`Invalid Swagger UI local override: ${filename}`);
    }
  }
}

function validateContract(contract, context) {
  if (!contract || typeof contract !== 'object' || Array.isArray(contract)) {
    throw new Error('Swagger UI vendor contract is not an object');
  }
  if (JSON.stringify(Object.keys(contract).sort()) !== JSON.stringify(contractFields)) {
    throw new Error('Swagger UI vendor contract has unsupported fields');
  }
  if (
    contract.schema_version !== 2 ||
    contract.algorithm !== 'sha256' ||
    contract.package !== packageName ||
    contract.version !== context.version ||
    contract.resolved !== context.resolved ||
    contract.integrity !== context.integrity
  ) {
    throw new Error('Swagger UI vendor contract does not match the locked distribution');
  }
  validateFileMap(contract.files);
  validateLocalOverrides(contract.local_overrides);
}

function publishedAsset(filename, source) {
  if (filename !== 'oauth2-redirect.html') return source;
  const sourceText = source.toString('utf8');
  const marker = '<html lang="en-US">\n<body>';
  if (sourceText.split(marker).length !== 2) {
    throw new Error(`Unexpected ${packageName} OAuth redirect document`);
  }
  return Buffer.from(
    sourceText.replace(
      marker,
      '<html lang="en-US">\n<head>\n  <title>Swagger UI OAuth2 Redirect</title>\n</head>\n<body>',
    ),
    'utf8',
  );
}

function createContract(context) {
  const files = {};
  const publishedOverrides = {};
  for (const filename of assetFilenames) {
    const source = path.join(context.sourceDirectory, filename);
    if (!fs.existsSync(source)) {
      throw new Error(`Published ${packageName} distribution is missing ${filename}`);
    }
    const sourceContents = fs.readFileSync(source);
    files[filename] = sha256(sourceContents);
    if (localOverrides[filename]) {
      publishedOverrides[filename] = {
        reason: localOverrides[filename],
        sha256: sha256(publishedAsset(filename, sourceContents)),
      };
    }
  }
  return {
    schema_version: 2,
    package: packageName,
    version: context.version,
    resolved: context.resolved,
    integrity: context.integrity,
    algorithm: 'sha256',
    files,
    local_overrides: publishedOverrides,
  };
}

function writeVendor() {
  const context = sourceContext();
  const contract = createContract(context);
  for (const filename of assetFilenames) {
    const source = fs.readFileSync(path.join(context.sourceDirectory, filename));
    fs.writeFileSync(
      path.join(repositoryRoot, 'static', filename),
      publishedAsset(filename, source),
    );
  }
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  verifyVendor();
  return contract;
}

function verifyVendor() {
  const context = sourceContext();
  const contract = readJson(contractPath);
  validateContract(contract, context);
  for (const filename of assetFilenames) {
    const source = path.join(context.sourceDirectory, filename);
    const staticAsset = path.join(repositoryRoot, 'static', filename);
    if (!fs.existsSync(source) || !fs.existsSync(staticAsset)) {
      throw new Error(`Missing Swagger UI vendor asset: ${filename}`);
    }
    const sourceContents = fs.readFileSync(source);
    const sourceHash = sha256(sourceContents);
    const expectedPublished = publishedAsset(filename, sourceContents);
    const staticHash = sha256File(staticAsset);
    const expectedPublishedHash = localOverrides[filename]
      ? contract.local_overrides[filename].sha256
      : sourceHash;
    if (
      contract.files[filename] !== sourceHash ||
      expectedPublishedHash !== sha256(expectedPublished) ||
      staticHash !== expectedPublishedHash
    ) {
      throw new Error(`${filename} does not match the locked Swagger UI distribution contract`);
    }
  }
  return {package: packageName, version: context.version, files: assetFilenames.length};
}

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--write')) {
    throw new Error('Usage: node scripts/verify-swagger-ui-vendor.js [--write]');
  }
  const result = args[0] === '--write' ? writeVendor() : verifyVendor();
  console.log(
    args[0] === '--write'
      ? `Vendored ${result.package}@${result.version} (${Object.keys(result.files).length} files).`
      : `Verified ${result.package}@${result.version} static distribution (${result.files} files).`,
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Swagger UI vendor verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  assetFilenames,
  createContract,
  verifyVendor,
  writeVendor,
};
