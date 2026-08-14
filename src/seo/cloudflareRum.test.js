import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {afterEach, describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {REPRESENTATIVE_ROUTES, SENSITIVE_ROUTES, SOURCE, TOKEN, verifyCloudflareRum, verifyPage} =
  require('../../scripts/verify-cloudflare-rum');
const roots = [];
const beacon = `<script src="${SOURCE}" defer type="module" data-cf-beacon='{&quot;token&quot;:&quot;${TOKEN}&quot;}'></script>`;

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'learn-cloudflare-rum-'));
  roots.push(root);
  for (const relative of REPRESENTATIVE_ROUTES) {
    const filename = path.join(root, relative);
    fs.mkdirSync(path.dirname(filename), {recursive: true});
    fs.writeFileSync(filename, `<html><body>${beacon}</body></html>`);
  }
  for (const relative of SENSITIVE_ROUTES) {
    const filename = path.join(root, relative);
    fs.mkdirSync(path.dirname(filename), {recursive: true});
    fs.writeFileSync(filename, '<html><body></body></html>');
  }
  return root;
}

afterEach(() => {
  while (roots.length) fs.rmSync(roots.pop(), {recursive: true, force: true});
});

describe('rendered Cloudflare Web Analytics verifier', () => {
  it('covers every HTML artifact and all representative route classes', () => {
    const root = fixture();
    expect(verifyCloudflareRum(root)).toEqual({
      htmlFiles: REPRESENTATIVE_ROUTES.length + SENSITIVE_ROUTES.length,
      representativeRoutes: REPRESENTATIVE_ROUTES.length,
      sensitiveRoutes: SENSITIVE_ROUTES.length,
    });
  });

  it('rejects Cloudflare code on credential-handling HTML', () => {
    for (const relative of SENSITIVE_ROUTES) {
      expect(() => verifyPage(`<html><body>${beacon}</body></html>`, relative)).toThrow(
        /must not load/,
      );
      expect(() =>
        verifyPage(
          '<script src="HTTPS://STATIC.CLOUDFLAREINSIGHTS.COM/beacon.min.js"></script>',
          relative,
        ),
      ).toThrow(/must not load/);
      expect(() => verifyPage('<script src="https://example.com/code.js"></script>', relative)).toThrow(
        /must not load/,
      );
      for (const markup of [
        '<script src="&#104;ttps://example.com/code.js"></script>',
        '<script src="&Tab;https://example.com/code.js"></script>',
        '<script src="https://example.com/code.js" src="/local.js"></script>',
        '<base href="https://example.com/assets/"><script src="code.js"></script>',
        '<svg><script href="https://example.com/code.js"></script></svg>',
        '<svg><script xlink:href="https://example.com/code.js"></script></svg>',
        '<iframe srcdoc="&lt;script src=&quot;https://example.com/code.js&quot;&gt;&lt;/script&gt;"></iframe>',
        '<iframe src="data:text/html,%3Cscript%20src%3Dhttps%3A%2F%2Fexample.com%2Fcode.js%3E%3C%2Fscript%3E"></iframe>',
        '<object data="data:text/html,%3Cscript%20src%3Dhttps%3A%2F%2Fexample.com%2Fcode.js%3E%3C%2Fscript%3E"></object>',
        '<embed src="data:text/html,%3Cscript%20src%3Dhttps%3A%2F%2Fexample.com%2Fcode.js%3E%3C%2Fscript%3E">',
        '<html><frameset><frame src="data:text/html,%3Cscript%20src%3Dhttps%3A%2F%2Fexample.com%2Fcode.js%3E%3C%2Fscript%3E"></frameset></html>',
        '<div><template shadowrootmode="open"><script src="https://example.com/code.js"></script></template></div>',
      ]) {
        expect(() => verifyPage(markup, relative)).toThrow(/must not load|forbids/);
      }
      expect(() =>
        verifyPage('<script src="/local.js" src="https://example.com/code.js"></script>', relative),
      ).not.toThrow();
      expect(() => verifyPage('<html><body></body></html>', relative)).not.toThrow();
    }
  });

  it('checks HTML suffixes case-insensitively', () => {
    const root = fixture();
    const filename = path.join(root, 'extra.HTML');
    fs.writeFileSync(filename, '<html><body></body></html>');
    expect(() => verifyCloudflareRum(root)).toThrow(/extra\.HTML: expected exactly one/);
    fs.writeFileSync(filename, `<html><body>${beacon}</body></html>`);
    expect(verifyCloudflareRum(root).htmlFiles).toBe(
      REPRESENTATIVE_ROUTES.length + SENSITIVE_ROUTES.length + 1,
    );
  });

  it.each([
    ['', /exactly one/],
    [`${beacon}${beacon}`, /exactly one/],
    [`<template>${beacon}</template>`, /exactly one/],
    [`${beacon}<div><template shadowrootmode="CLOSED">${beacon}</template></div>`, /exactly one/],
    [`<div><template shadowrootmode="open">${beacon}</template></div>`, /document tree/],
    [`<a><template shadowrootmode="open">${beacon}</template></a>`, /document tree/],
    [
      `<div><template shadowrootmode="open"></template><template shadowrootmode="closed">${beacon}</template></div>`,
      /document tree/,
    ],
    [
      `<base href="https://static.cloudflareinsights.com/">${beacon}<script src="beacon.min.js" defer type="module" data-cf-beacon='{"token":"&#55;408c22ab930458a8467c91b5360b8f3"}'></script>`,
      /base URL overrides/,
    ],
    [`${beacon}<iframe srcdoc="&lt;p&gt;nested document&lt;/p&gt;"></iframe>`, /inline nested documents/],
    [
      `${beacon}<script src="HTTPS://STATIC.CLOUDFLAREINSIGHTS.COM/beacon.min.js#duplicate" defer type="module" data-cf-beacon='{"token":"&#55;408c22ab930458a8467c91b5360b8f3"}'></script>`,
      /exactly one/,
    ],
    [
      `${beacon}<script src="https://static.cloudflareinsights.com/beacon.min.js?duplicate" defer type="module" data-cf-beacon='{"token":"&#55;408c22ab930458a8467c91b5360b8f3"}'></script>`,
      /exactly one/,
    ],
    [
      `${beacon}<script src="https://static.cloudflareinsights.com/%62eacon.min.js" defer type="module" data-cf-beacon='{"token":"&#55;408c22ab930458a8467c91b5360b8f3"}'></script>`,
      /exactly one/,
    ],
    [
      `${beacon}<svg><script href="HTTPS://STATIC.CLOUDFLAREINSIGHTS.COM/beacon.min.js#svg" data-cf-beacon='{"token":"&#55;408c22ab930458a8467c91b5360b8f3"}'></script></svg>`,
      /exactly one/,
    ],
    [
      `<svg><script src="${SOURCE}" defer type="module" data-cf-beacon='{"token":"${TOKEN}"}'></script></svg>`,
      /HTML script/,
    ],
    [
      `<math><script src="${SOURCE}" defer type="module" data-cf-beacon='{"token":"${TOKEN}"}'></script></math>`,
      /HTML script/,
    ],
    [beacon.replace('type="module"', 'type="text/javascript"'), /deferred module/],
    [beacon.replace(' defer', ''), /deferred module/],
    [beacon.replace(' data-cf-beacon', ' integrity="sha256-test" data-cf-beacon'), /cannot use integrity/],
    [beacon.replace(TOKEN, 'wrong-token'), /approved public token/],
  ])('rejects an invalid rendered beacon', (markup, message) => {
    expect(() => verifyPage(`<html><body>${markup}</body></html>`, 'test.html')).toThrow(message);
  });

  it('rejects inline executable nested-document carriers on normal pages', () => {
    const payload =
      'data:text/html,%3Cscript%20src%3Dhttps%3A%2F%2Fstatic.cloudflareinsights.com%2Fbeacon.min.js%3E%3C%2Fscript%3E';
    for (const markup of [
      `<html><head>${beacon}</head><body><iframe src="${payload}"></iframe></body></html>`,
      `<html><head>${beacon}</head><body><object data="${payload}"></object></body></html>`,
      `<html><head>${beacon}</head><body><embed src="${payload}"></body></html>`,
      `<html><head>${beacon}</head><frameset><frame src="${payload}"></frameset></html>`,
    ]) {
      expect(() => verifyPage(markup, 'test.html')).toThrow(/inline nested documents/);
    }
  });

  it('rejects a missing route class and symlinked output', () => {
    const missing = fixture();
    fs.rmSync(path.join(missing, REPRESENTATIVE_ROUTES[0]));
    expect(() => verifyCloudflareRum(missing)).toThrow(/Missing representative/);

    const missingSensitive = fixture();
    fs.rmSync(path.join(missingSensitive, SENSITIVE_ROUTES[0]));
    expect(() => verifyCloudflareRum(missingSensitive)).toThrow(/Missing sensitive/);

    const linked = fixture();
    const outside = path.join(path.dirname(linked), 'outside.html');
    fs.writeFileSync(outside, `<html>${beacon}</html>`);
    fs.symlinkSync(outside, path.join(linked, 'linked.html'));
    expect(() => verifyCloudflareRum(linked)).toThrow(/symbolic link/);
    fs.rmSync(outside);
  });
});
