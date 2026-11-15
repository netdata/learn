import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  NOINDEX_HEADERS,
  needsNoindex,
  writeNonProductionHeaders,
} from '../scripts/write-non-production-headers.mjs';

function withPublishDir(run) {
  const publishDir = mkdtempSync(path.join(tmpdir(), 'learn-headers-'));
  try {
    run(publishDir);
  } finally {
    rmSync(publishDir, {recursive: true, force: true});
  }
}

test('production and local builds publish no header rule', () => {
  for (const context of ['production', undefined, '']) {
    assert.equal(needsNoindex(context), false);
    withPublishDir((publishDir) => {
      assert.equal(writeNonProductionHeaders({publishDir, context}), false);
      assert.equal(existsSync(path.join(publishDir, '_headers')), false);
    });
  }
});

test('deploy previews and branch deploys publish a site-wide noindex rule', () => {
  for (const context of ['deploy-preview', 'branch-deploy']) {
    assert.equal(needsNoindex(context), true);
    withPublishDir((publishDir) => {
      assert.equal(writeNonProductionHeaders({publishDir, context}), true);
      assert.equal(readFileSync(path.join(publishDir, '_headers'), 'utf8'), NOINDEX_HEADERS);
    });
  }
  assert.equal(NOINDEX_HEADERS, '/*\n  X-Robots-Tag: noindex\n');
});

test('an existing published headers file is never overwritten', () => {
  withPublishDir((publishDir) => {
    writeFileSync(path.join(publishDir, '_headers'), 'existing\n');
    assert.throws(
      () => writeNonProductionHeaders({publishDir, context: 'branch-deploy'}),
      /Refusing to overwrite/,
    );
    assert.equal(readFileSync(path.join(publishDir, '_headers'), 'utf8'), 'existing\n');
  });
});
