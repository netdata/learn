const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const pluginDirectory = path.resolve('plugins/netlify-plugin-indexnow');
const contractPath = path.join(pluginDirectory, 'vendor-checksums.json');

try {
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  if (
    contract.schema_version !== 2 ||
    contract.owner !== 'netdata/website' ||
    contract.algorithm !== 'sha256'
  ) {
    throw new Error('Unsupported IndexNow vendor contract');
  }
  const filenames = Object.keys(contract.files || {}).sort();
  const required = 'contract-tests.json,index.js,manifest.yml,package.json,receipt-schema.json';
  if (filenames.join(',') !== required) {
    throw new Error(`IndexNow vendor contract must cover ${required}`);
  }

  const expectedDependencies = {'@netlify/blobs': '10.7.13', saxes: '6.0.0'};
  if (JSON.stringify(contract.dependencies) !== JSON.stringify(expectedDependencies)) {
    throw new Error('IndexNow vendor dependency contract is invalid');
  }
  const pluginPackage = JSON.parse(
    fs.readFileSync(path.join(pluginDirectory, 'package.json'), 'utf8'),
  );
  const rootPackage = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
  for (const [name, version] of Object.entries(expectedDependencies)) {
    if (pluginPackage.dependencies?.[name] !== version || rootPackage.dependencies?.[name] !== version) {
      throw new Error(`IndexNow dependency ${name} must be pinned to ${version} in both package files`);
    }
  }
  const receiptSchema = JSON.parse(
    fs.readFileSync(path.join(pluginDirectory, 'receipt-schema.json'), 'utf8'),
  );
  const testContract = JSON.parse(
    fs.readFileSync(path.join(pluginDirectory, 'contract-tests.json'), 'utf8'),
  );
  if (receiptSchema.properties?.schema_version?.const !== contract.receipt_schema_version ||
      testContract.schema_version !== contract.contract_tests_schema_version ||
      testContract.receipt_schema_version !== contract.receipt_schema_version) {
    throw new Error('IndexNow receipt or test schema does not match the vendor contract');
  }

  for (const [filename, expected] of Object.entries(contract.files)) {
    if (path.basename(filename) !== filename || !/^[0-9a-f]{64}$/.test(expected)) {
      throw new Error(`Invalid IndexNow vendor contract entry: ${filename}`);
    }
    const actual = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(pluginDirectory, filename)))
      .digest('hex');
    if (actual !== expected) {
      throw new Error(`${filename} does not match the website-owned vendor contract`);
    }
  }

  console.log(`Verified IndexNow vendor contract (${filenames.length} files).`);
} catch (error) {
  console.error(`IndexNow vendor verification failed: ${error.message}`);
  process.exitCode = 1;
}
