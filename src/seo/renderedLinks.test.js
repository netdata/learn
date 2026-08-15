import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  allowedRenderedRedirectSources,
  exactRedirectSources,
  redirectSourceRules,
  renderedInternalLinks,
  verifyRenderedLinks,
} = require('../../scripts/verify-rendered-links');
const temporaryDirectories = [];

async function fixture(html, {includeRoot = false} = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-rendered-links-'));
  temporaryDirectories.push(root);
  const publishDir = path.join(root, 'build');
  const output = path.join(publishDir, 'docs', 'source', 'index.html');
  const netlifyPath = path.join(root, 'netlify.toml');
  await fs.mkdir(path.dirname(output), {recursive: true});
  await fs.writeFile(output, html);
  await fs.writeFile(
    netlifyPath,
    (includeRoot ? `[[redirects]]\n  from="/"\n  to="/docs/new"\n\n` : '') +
      `[[redirects]]\n  from="/docs/old/"\n  to="/docs/new"\n\n` +
      `[[redirects]]\n  from="/assets/*"\n  to="/static/:splat"\n`,
  );
  return {netlifyPath, publishDir};
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {recursive: true, force: true}),
    ),
  );
});

describe('rendered redirect-source link verifier', () => {
  it('pins the stable root as the sole policy-owned redirect-source exception', async () => {
    const policy = JSON.parse(
      await fs.readFile(
        path.resolve(import.meta.dirname, '../../config/redirect-policy.json'),
        'utf8',
      ),
    );
    expect(allowedRenderedRedirectSources(policy)).toEqual(new Set(['/']));
  });

  it('reads exact and terminal-wildcard redirect sources', () => {
    expect(exactRedirectSources('[[redirects]]\nfrom="/old/"\n\n[[redirects]]\nfrom="/x/*"'))
      .toEqual(new Set(['/old/']));
    expect(
      redirectSourceRules('[[redirects]]\nfrom="/old/"\n\n[[redirects]]\nfrom="/x/*"'),
    ).toEqual({exact: new Set(['/old/']), terminalWildcards: new Set(['/x/'])});
  });

  it('covers every current terminal-wildcard redirect source', async () => {
    const netlifyToml = await fs.readFile(
      path.resolve(import.meta.dirname, '../../netlify.toml'),
      'utf8',
    );
    expect([...redirectSourceRules(netlifyToml).terminalWildcards].sort()).toEqual([
      '/docs/agent/netdata-cloud/',
      '/docs/network-flows/',
    ]);
  });

  it('accepts canonical, external, and fragment links', async () => {
    const fixturePaths = await fixture(
      '<a href="/docs/new">new</a><a href="https://example.com/docs/old">external</a>' +
        '<a href="#local">local</a>',
    );
    expect(verifyRenderedLinks(fixturePaths.publishDir, fixturePaths.netlifyPath)).toMatchObject({
      htmlFiles: 1,
      exactRedirectSources: 1,
      wildcardRedirectSources: 1,
    });
  });

  it('fails on relative and absolute same-host links to an exact redirect source', async () => {
    const fixturePaths = await fixture(
      '<a href="/docs/old/">relative</a>' +
        '<a href="https://learn.netdata.cloud/docs/old/?from=test#part">absolute</a>',
    );
    expect(() => verifyRenderedLinks(fixturePaths.publishDir, fixturePaths.netlifyPath))
      .toThrow(/Rendered links target redirect sources/);
  });

  it('allows only an explicitly configured root entrypoint redirect', async () => {
    const fixturePaths = await fixture('<a href="/">documentation entrypoint</a>', {
      includeRoot: true,
    });
    expect(() => verifyRenderedLinks(fixturePaths.publishDir, fixturePaths.netlifyPath))
      .toThrow(/Rendered links target redirect sources/);
    expect(
      verifyRenderedLinks(
        fixturePaths.publishDir,
        fixturePaths.netlifyPath,
        'learn.netdata.cloud',
        new Set(['/']),
      ),
    ).toMatchObject({allowedRedirectLinks: 1, allowedRedirectSources: 1});

    await fs.writeFile(
      path.join(fixturePaths.publishDir, 'docs', 'source', 'index.html'),
      '<a href="/">entrypoint</a><a href="/docs/old/">stale route</a>',
    );
    expect(() =>
      verifyRenderedLinks(
        fixturePaths.publishDir,
        fixturePaths.netlifyPath,
        'learn.netdata.cloud',
        new Set(['/']),
      ),
    ).toThrow(/\/docs\/old\//);
  });

  it('fails on encoded, HTTP, and terminal-wildcard redirect sources', async () => {
    const fixturePaths = await fixture(
      '<a href="/docs/%6fld/">encoded exact</a>' +
        '<a href="http://learn.netdata.cloud/docs/old/">http exact</a>' +
        '<a href="/assets/app.js?v=1#load">wildcard</a>',
    );
    expect(() => verifyRenderedLinks(fixturePaths.publishDir, fixturePaths.netlifyPath))
      .toThrow(/\/assets\/\*/);
  });

  it('matches terminal wildcards without matching adjacent path prefixes', async () => {
    const fixturePaths = await fixture('<a href="/assets-other/app.js">different path</a>');
    expect(verifyRenderedLinks(fixturePaths.publishDir, fixturePaths.netlifyPath))
      .toMatchObject({wildcardRedirectSources: 1});
  });

  it('pins the quoted href boundary used by Docusaurus output', () => {
    const html = '<a href="/quoted">quoted</a><a href=/unquoted>unquoted</a>';
    expect(renderedInternalLinks(html, '/docs/source')).toEqual([
      {href: '/quoted', pathname: '/quoted'},
    ]);
  });
});
