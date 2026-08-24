import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  generatedOutputIsReady,
  generatedOutputMarker,
  generatedOutputState,
  postBuildGateCommands,
} from '../../scripts/run-post-build-gates.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('post-build gate rollout', () => {
  it('keeps deploy, indexability, heading, and RUM protections before the first new ingest', () => {
    expect(postBuildGateCommands({ generatedOutputReady: false })).toEqual([
      ['scripts/verify-functional-headings.js'],
      ['scripts/verify-redirect-graph.js'],
      ['scripts/verify-rendered-indexability.js'],
      ['scripts/verify-cloudflare-rum.js', 'build'],
    ]);
  });

  it('activates every strict generated-corpus gate when the pipeline marker exists', () => {
    expect(postBuildGateCommands({ generatedOutputReady: true })).toEqual([
      ['scripts/verify-rendered-titles.js'],
      ['scripts/verify-functional-headings.js'],
      ['scripts/verify-redirect-graph.js'],
      ['scripts/verify-rendered-links.js'],
      ['scripts/verify-rendered-indexability.js'],
      ['scripts/verify-cloudflare-rum.js', 'build'],
      [
        'scripts/site-build-gate/site_build_gate.mjs',
        '--build-dir',
        'build',
        '--site-origin',
        'https://learn.netdata.cloud',
        '--baseline',
        'config/site-build-gate-baseline.json',
        '--integration-route-prefix',
        '/docs/collecting-metrics/collectors',
        '--format',
        'json',
      ],
    ]);
  });

  it('uses the checksum produced with the generated sidebar state as the cutover marker', () => {
    expect(generatedOutputState).toBe('ingest/generated_sidebar_order.json');
    expect(generatedOutputMarker).toBe('ingest/generated_sidebar_order.json.sha256');
  });

  it('fails closed when only one generated sidebar state artifact exists', () => {
    expect(() => generatedOutputIsReady({ stateExists: true, markerExists: false })).toThrow(
      'Generated output is incomplete',
    );
    expect(() => generatedOutputIsReady({ stateExists: false, markerExists: true })).toThrow(
      'Generated output is incomplete',
    );
    expect(generatedOutputIsReady({ stateExists: false, markerExists: false })).toBe(false);
    expect(generatedOutputIsReady({ stateExists: true, markerExists: true })).toBe(true);
  });

  it('routes the Netlify build through the staged gate runner', () => {
    const packageJson = JSON.parse(readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8'));
    expect(packageJson.scripts['build:netlify']).toContain(
      'node scripts/run-post-build-gates.mjs',
    );
  });
});
