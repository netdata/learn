import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {verifyRenderedTitles} = require('../../scripts/verify-rendered-titles');
const temporaryDirectories = [];

async function fixture(pages) {
  const publishDir = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-rendered-titles-'));
  temporaryDirectories.push(publishDir);
  const urls = [];
  for (const [route, title] of Object.entries(pages)) {
    const output = path.join(publishDir, route, 'index.html');
    await fs.mkdir(path.dirname(output), {recursive: true});
    await fs.writeFile(output, `<html><head><title>${title}</title></head></html>`);
    urls.push(`https://learn.netdata.cloud/${route}`);
  }
  await fs.writeFile(
    path.join(publishDir, 'sitemap.xml'),
    `<urlset>${urls.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`,
  );
  return publishDir;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {recursive: true, force: true}),
    ),
  );
});

describe('rendered title verifier', () => {
  it('accepts one non-empty title per sitemap URL and decodes entities', async () => {
    const publishDir = await fixture({one: 'One &amp; only', two: 'Two'});
    expect(verifyRenderedTitles(publishDir)).toEqual({urls: 2, titles: 2});
  });

  it('fails closed on duplicate rendered titles', async () => {
    const publishDir = await fixture({one: 'Same', two: 'Same'});
    expect(() => verifyRenderedTitles(publishDir)).toThrow(/Duplicate rendered titles/);
  });

  it('fails closed when a sitemap URL has no rendered title', async () => {
    const publishDir = await fixture({one: ''});
    expect(() => verifyRenderedTitles(publishDir)).toThrow(/Missing rendered title/);
  });
});
