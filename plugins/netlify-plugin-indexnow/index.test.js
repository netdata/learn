import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it, vi} from 'vitest';
import plugin from './index';

const temporaryDirectories = [];

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-indexnow-'));
  temporaryDirectories.push(root);
  const publishDir = path.join(root, 'build');
  const statePath = path.join(root, 'state.json');
  await fs.mkdir(path.join(publishDir, 'docs', 'one'), {recursive: true});
  await fs.mkdir(path.join(publishDir, 'docs', 'two'), {recursive: true});
  await fs.writeFile(path.join(publishDir, 'docs', 'one', 'index.html'), 'one');
  await fs.writeFile(path.join(publishDir, 'docs', 'two', 'index.html'), 'two');
  await fs.writeFile(
    path.join(publishDir, 'sitemap.xml'),
    '<urlset><url><loc>https://learn.netdata.cloud/docs/one</loc></url>' +
      '<url><loc>https://other.example/docs/no</loc></url>' +
      '<url><loc>https://learn.netdata.cloud/docs/two</loc></url></urlset>',
  );
  const cache = {save: vi.fn().mockResolvedValue(undefined)};
  return {root, publishDir, statePath, cache};
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, {recursive: true, force: true}),
    ),
  );
});

describe('IndexNow build plugin', () => {
  const inputs = {
    host: 'learn.netdata.cloud',
    key: 'public-key',
    keyLocation: 'https://learn.netdata.cloud/public-key.txt',
  };

  it('seeds a cold cache without sending a bulk submission', async () => {
    const {publishDir, statePath, cache} = await fixture();
    const fetchImpl = vi.fn();
    const result = await plugin._test.runOnSuccess({
      constants: {PUBLISH_DIR: publishDir},
      inputs,
      utils: {cache},
      statePath,
      fetchImpl,
    });
    expect(result).toEqual({seeded: true, submitted: []});
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(cache.save).toHaveBeenCalledWith(statePath);
  });

  it('repairs an invalid cache by reseeding without submission', async () => {
    const {publishDir, statePath, cache} = await fixture();
    await fs.writeFile(statePath, '{invalid', 'utf8');
    const fetchImpl = vi.fn();
    const result = await plugin._test.runOnSuccess({
      constants: {PUBLISH_DIR: publishDir},
      inputs,
      utils: {cache},
      statePath,
      fetchImpl,
    });
    expect(result.seeded).toBe(true);
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(JSON.parse(await fs.readFile(statePath, 'utf8')).version).toBe(1);
  });

  it('submits only changed and removed sitemap URLs', async () => {
    const {publishDir, statePath, cache} = await fixture();
    await plugin._test.runOnSuccess({
      constants: {PUBLISH_DIR: publishDir}, inputs, utils: {cache}, statePath, fetchImpl: vi.fn(),
    });
    await fs.writeFile(path.join(publishDir, 'docs', 'one', 'index.html'), 'one changed');
    await fs.writeFile(
      path.join(publishDir, 'sitemap.xml'),
      '<urlset><url><loc>https://learn.netdata.cloud/docs/one</loc></url></urlset>',
    );
    const fetchImpl = vi.fn().mockResolvedValue({status: 202, text: vi.fn().mockResolvedValue('')});
    const result = await plugin._test.runOnSuccess({
      constants: {PUBLISH_DIR: publishDir}, inputs, utils: {cache}, statePath, fetchImpl,
    });
    expect(result.submitted).toEqual([
      'https://learn.netdata.cloud/docs/one',
      'https://learn.netdata.cloud/docs/two',
    ]);
    const payload = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(payload.urlList).toEqual(result.submitted);
    expect(payload).toMatchObject(inputs);
  });

  it('keeps the old cache when IndexNow rejects a request', async () => {
    const {publishDir, statePath, cache} = await fixture();
    await plugin._test.runOnSuccess({
      constants: {PUBLISH_DIR: publishDir}, inputs, utils: {cache}, statePath, fetchImpl: vi.fn(),
    });
    const oldState = await fs.readFile(statePath, 'utf8');
    await fs.writeFile(path.join(publishDir, 'docs', 'one', 'index.html'), 'changed');
    const fetchImpl = vi.fn().mockResolvedValue({status: 500, text: vi.fn().mockResolvedValue('failed')});
    await expect(
      plugin._test.runOnSuccess({
        constants: {PUBLISH_DIR: publishDir}, inputs, utils: {cache}, statePath, fetchImpl,
      }),
    ).rejects.toThrow('HTTP 500');
    expect(await fs.readFile(statePath, 'utf8')).toBe(oldState);
  });

  it('chunks requests at the IndexNow protocol limit', () => {
    expect(plugin._test.chunks(Array.from({length: 20_001}), 10_000).map((part) => part.length)).toEqual([
      10_000,
      10_000,
      1,
    ]);
  });

  it('guards the deploy hook against non-production contexts', async () => {
    const previousContext = process.env.CONTEXT;
    process.env.CONTEXT = 'deploy-preview';
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await expect(plugin.onSuccess({})).resolves.toBeUndefined();
      expect(log).toHaveBeenCalledWith(
        'IndexNow skipped non-production deploy context: deploy-preview.',
      );
    } finally {
      log.mockRestore();
      if (previousContext === undefined) {
        delete process.env.CONTEXT;
      } else {
        process.env.CONTEXT = previousContext;
      }
    }
  });

  it('never fails a successful production deploy', async () => {
    const previousContext = process.env.CONTEXT;
    process.env.CONTEXT = 'production';
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(
        plugin.onSuccess({
          constants: {PUBLISH_DIR: '/path/that/does/not/exist'},
          inputs,
          utils: {cache: {save: vi.fn()}},
        }),
      ).resolves.toBeUndefined();
      expect(error).toHaveBeenCalledWith(expect.stringContaining('successful deploy remains valid'));
    } finally {
      error.mockRestore();
      if (previousContext === undefined) {
        delete process.env.CONTEXT;
      } else {
        process.env.CONTEXT = previousContext;
      }
    }
  });
});
