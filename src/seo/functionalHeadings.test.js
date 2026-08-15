import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {verifyFunctionalHeadings} = require('../../scripts/verify-functional-headings');
const temporaryDirectories = [];

async function fixture(blogHtml) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-functional-headings-'));
  temporaryDirectories.push(root);
  const publishDir = path.join(root, 'build');
  await fs.mkdir(path.join(publishDir, 'blog'), {recursive: true});
  await fs.writeFile(path.join(publishDir, 'blog', 'index.html'), blogHtml);
  return publishDir;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {recursive: true, force: true}),
    ),
  );
});

describe('functional route heading verifier', () => {
  it('accepts exactly one H1 on the functional blog route', async () => {
    const publishDir = await fixture('<h1>Blog</h1>');
    expect(verifyFunctionalHeadings(publishDir)).toEqual([
      {route: '/blog', h1Count: 1},
    ]);
  });

  it('fails closed when a heading is missing or duplicated', async () => {
    const missing = await fixture('<main>Blog</main>');
    expect(() => verifyFunctionalHeadings(missing)).toThrow('/blog rendered 0 H1');

    const duplicate = await fixture('<h1>Blog</h1><h1>More blog</h1>');
    expect(() => verifyFunctionalHeadings(duplicate)).toThrow('/blog rendered 2 H1');
  });
});
