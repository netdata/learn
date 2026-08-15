const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_ROUTES = ['/blog'];

function renderedFile(publishDir, route) {
  const pathname = route.replace(/^\/+|\/+$/g, '');
  return pathname
    ? path.join(publishDir, pathname, 'index.html')
    : path.join(publishDir, 'index.html');
}

function h1Count(html) {
  return [...html.matchAll(/<h1\b[^>]*>/gi)].length;
}

function verifyFunctionalHeadings(publishDir, routes = REQUIRED_ROUTES) {
  const results = [];
  for (const route of routes) {
    const filename = renderedFile(publishDir, route);
    if (!fs.existsSync(filename)) {
      throw new Error(`No rendered HTML found for ${route}`);
    }
    const count = h1Count(fs.readFileSync(filename, 'utf8'));
    if (count !== 1) {
      throw new Error(`${route} rendered ${count} H1 elements; expected exactly one`);
    }
    results.push({route, h1Count: count});
  }
  return results;
}

if (require.main === module) {
  try {
    const results = verifyFunctionalHeadings(path.resolve(process.argv[2] || 'build'));
    console.log(`Verified exactly one H1 on ${results.length} functional routes.`);
  } catch (error) {
    console.error(`Functional heading verification failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {h1Count, renderedFile, verifyFunctionalHeadings};
