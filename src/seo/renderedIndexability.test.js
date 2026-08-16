import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import {
  noindexMetaDirectives,
  noindexResponseHeaders,
  sitemapRobotsViolations,
  verifyRenderedIndexability,
} from '../../scripts/verify-rendered-indexability';

const roots = [];

afterEach(() => {
  while (roots.length) {
    fs.rmSync(roots.pop(), {recursive: true, force: true});
  }
});

function fixture(html, netlify = '', robots = 'User-agent: *\nDisallow:\n') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-indexability-'));
  roots.push(root);
  const publishDir = path.join(root, 'build');
  fs.mkdirSync(path.join(publishDir, 'docs'), {recursive: true});
  fs.writeFileSync(path.join(publishDir, 'docs', 'index.html'), html);
  fs.writeFileSync(
    path.join(publishDir, 'sitemap.xml'),
    '<urlset><url><loc>https://learn.netdata.cloud/docs</loc></url></urlset>',
  );
  const netlifyPath = path.join(root, 'netlify.toml');
  fs.writeFileSync(netlifyPath, netlify);
  const robotsPath = path.join(root, 'robots.txt');
  fs.writeFileSync(robotsPath, robots);
  return {publishDir, netlifyPath, robotsPath};
}

describe('rendered indexability verifier', () => {
  it('accepts indexable HTML and unrelated text containing noindex', () => {
    const files = fixture(
      '<html><head><meta name="robots" content="index,follow"></head>' +
      '<body><code>X-Robots-Tag: noindex</code></body></html>',
      '[[headers]]\n  for = "/assets/*"\n  [headers.values]\n    Cache-Control = "public"\n',
    );
    expect(verifyRenderedIndexability(files.publishDir, files.netlifyPath, files.robotsPath)).toEqual({
      htmlFiles: 1,
      noindexDirectives: 0,
      sitemapUrls: 1,
      blockedSitemapUrls: 0,
    });
  });

  it.each([
    '<meta name="robots" content="NOINDEX, follow">',
    '<meta content="nofollow, noindex" property="googlebot">',
    '<meta http-equiv="X-Robots-Tag" content="noindex">',
  ])('rejects an actual noindex metadata directive: %s', (meta) => {
    expect(noindexMetaDirectives(`<html><head>${meta}</head></html>`)).toHaveLength(1);
    const files = fixture(`<html><head>${meta}</head></html>`);
    expect(() => verifyRenderedIndexability(files.publishDir, files.netlifyPath, files.robotsPath)).toThrow(
      /noindex directive/,
    );
  });

  it('rejects a Netlify X-Robots-Tag noindex response header', () => {
    const netlify = `
[[headers]]
  for = "/private/*"
  [headers.values]
    X-Robots-Tag = "nofollow, noindex"
`;
    expect(noindexResponseHeaders(netlify)).toEqual([
      {line: 5, value: 'nofollow, noindex'},
    ]);
    const files = fixture('<html><head><title>Public</title></head></html>', netlify);
    expect(() => verifyRenderedIndexability(files.publishDir, files.netlifyPath, files.robotsPath)).toThrow(
      /X-Robots-Tag/,
    );
  });

  it('rejects symlinked rendered artifacts', () => {
    const files = fixture('<html><head><title>Public</title></head></html>');
    const outside = path.join(path.dirname(files.publishDir), 'outside.html');
    fs.writeFileSync(outside, '<html></html>');
    fs.symlinkSync(outside, path.join(files.publishDir, 'linked.html'));
    expect(() => verifyRenderedIndexability(files.publishDir, files.netlifyPath, files.robotsPath)).toThrow(
      /symbolic link/,
    );
  });

  it('rejects sitemap URLs blocked by the wildcard robots group', () => {
    const robots = 'User-agent: *\nDisallow: /docs\n';
    expect(sitemapRobotsViolations(
      '<urlset><url><loc>https://learn.netdata.cloud/docs/ask-nedi</loc></url></urlset>',
      robots,
    )).toEqual(['https://learn.netdata.cloud/docs/ask-nedi']);

    const files = fixture('<html><head><title>Public</title></head></html>', '', robots);
    expect(() => verifyRenderedIndexability(
      files.publishDir,
      files.netlifyPath,
      files.robotsPath,
    )).toThrow(/Remove the URL from the sitemap when the block is intentional/);
  });

  it('honors a more specific Allow rule in the wildcard robots group', () => {
    const robots = 'User-agent: *\nDisallow: /docs\nAllow: /docs/public\n';
    expect(sitemapRobotsViolations(
      '<urlset><url><loc>https://learn.netdata.cloud/docs/public</loc></url></urlset>',
      robots,
    )).toEqual([]);
  });

  it('uses the complete rule-path length for wildcard precedence', () => {
    const robots = 'User-agent: *\nAllow: /page\nDisallow: /*.htm\n';
    expect(sitemapRobotsViolations(
      '<urlset><url><loc>https://learn.netdata.cloud/page.htm</loc></url></urlset>',
      robots,
    )).toEqual(['https://learn.netdata.cloud/page.htm']);
  });
});
