import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const generatedOutputState = 'ingest/generated_sidebar_order.json';
export const generatedOutputMarker = 'ingest/generated_sidebar_order.json.sha256';

const compatibilityGates = [
  ['scripts/verify-functional-headings.js'],
  ['scripts/verify-redirect-graph.js'],
  ['scripts/verify-rendered-indexability.js'],
  ['scripts/verify-cloudflare-rum.js', 'build'],
];

const strictGeneratedCorpusGates = [
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
];

export function postBuildGateCommands({ generatedOutputReady }) {
  return generatedOutputReady ? strictGeneratedCorpusGates : compatibilityGates;
}

export function generatedOutputIsReady({ stateExists, markerExists }) {
  if (stateExists !== markerExists) {
    throw new Error(
      `Generated output is incomplete: ${generatedOutputState} and ${generatedOutputMarker} must both exist or both be absent.`,
    );
  }
  return stateExists;
}

function runGate(repositoryRoot, args) {
  const result = spawnSync(process.execPath, args, {
    cwd: repositoryRoot,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  if (result.signal) {
    throw new Error(`${args[0]} terminated by signal ${result.signal}.`);
  }
  if (result.status !== 0) {
    throw new Error(`${args[0]} failed with exit code ${result.status}.`);
  }
}

function main() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const generatedOutputReady = generatedOutputIsReady({
    stateExists: existsSync(path.join(repositoryRoot, generatedOutputState)),
    markerExists: existsSync(path.join(repositoryRoot, generatedOutputMarker)),
  });

  if (!generatedOutputReady) {
    console.log(
      `Generated output marker ${generatedOutputMarker} is absent; running pre-ingest compatibility gates.`,
    );
    console.log(
      'The dedicated ingest PR adds the marker and activates strict title, link, and C8 enforcement.',
    );
  }

  for (const args of postBuildGateCommands({ generatedOutputReady })) {
    runGate(repositoryRoot, args);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
