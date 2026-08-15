import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const GENERATED_STATE_PATHS = new Set([
  'ingest/generated_map.yaml',
  'ingest/generated_sidebar_order.json',
  'ingest/generated_sidebar_order.json.sha256',
]);

export function generatedOutputChanges(changedPaths) {
  return changedPaths.filter(
    (changedPath) => changedPath.startsWith('docs/') || GENERATED_STATE_PATHS.has(changedPath),
  );
}

function isDedicatedIngestPullRequest({
  baseRepository,
  headRepository,
  headRef,
  labels,
}) {
  const labelSet = new Set(labels);
  return (
    headRepository === baseRepository &&
    headRef === 'ingest' &&
    labelSet.has('ingest') &&
    labelSet.has('automation')
  );
}

export function verifyGeneratedOutputBoundary(context) {
  const generatedChanges = generatedOutputChanges(context.changedPaths);
  if (generatedChanges.length === 0 || isDedicatedIngestPullRequest(context)) {
    return;
  }

  throw new Error(
    [
      'Pipeline-owned documentation and ingest state may change only in the dedicated ingest automation pull request.',
      'Move generator/source changes to this pull request and let .github/workflows/ingest.yml publish the generated output separately.',
      'Generated paths in this pull request:',
      ...generatedChanges.map((changedPath) => `- ${changedPath}`),
    ].join('\n'),
  );
}

function changedPaths(baseSha, headSha) {
  return execFileSync('git', ['diff', '--name-only', baseSha, headSha], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean);
}

function contextFromEvent(event) {
  const pullRequest = event.pull_request;
  if (!pullRequest) {
    throw new Error('This verifier requires a pull_request event.');
  }

  return {
    baseRepository: pullRequest.base.repo.full_name,
    headRepository: pullRequest.head.repo.full_name,
    headRef: pullRequest.head.ref,
    labels: pullRequest.labels.map((label) => label.name),
    changedPaths: changedPaths(pullRequest.base.sha, pullRequest.head.sha),
  };
}

function main() {
  const eventPath = process.argv[2];
  if (!eventPath) {
    throw new Error('Usage: node scripts/verify-generated-output-boundary.mjs <github-event.json>');
  }

  const event = JSON.parse(readFileSync(eventPath, 'utf8'));
  const context = contextFromEvent(event);
  verifyGeneratedOutputBoundary(context);
  console.log('Generated output ownership is valid.');
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
