const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const pluginDirectory = path.resolve('plugins/netlify-plugin-indexnow');
const contractPath = path.join(pluginDirectory, 'vendor-checksums.json');

try {
  const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  if (contract.algorithm !== 'sha256') {
    throw new Error(`Unsupported checksum algorithm: ${contract.algorithm}`);
  }

  for (const [filename, expected] of Object.entries(contract.files)) {
    const actual = crypto
      .createHash('sha256')
      .update(fs.readFileSync(path.join(pluginDirectory, filename)))
      .digest('hex');
    if (actual !== expected) {
      throw new Error(`${filename} does not match the website-owned vendor contract`);
    }
  }

  console.log(`Verified IndexNow vendor contract (${Object.keys(contract.files).length} files).`);
} catch (error) {
  console.error(`IndexNow vendor verification failed: ${error.message}`);
  process.exitCode = 1;
}
