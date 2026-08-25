import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  generatedOutputChanges,
  verifyGeneratedOutputBoundary,
} from '../../scripts/verify-generated-output-boundary.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const ordinaryPullRequest = {
  baseRepository: 'netdata/learn',
  headRepository: 'netdata/learn',
  headRef: 'feature/source-change',
  labels: [],
};

const ingestPullRequest = {
  baseRepository: 'netdata/learn',
  headRepository: 'netdata/learn',
  headRef: 'ingest',
  labels: ['automation', 'ingest'],
};

describe('generated output ownership', () => {
  it('identifies the complete pipeline-owned output boundary', () => {
    expect(
      generatedOutputChanges([
        'docs/Netdata Agent/Installation/Linux/Linux.mdx',
        'ingest/generated_map.yaml',
        'ingest/generated_sidebar_order.json',
        'ingest/generated_sidebar_order.json.sha256',
        'ingest/ingest.py',
        'static.toml',
        'netlify.toml',
      ]),
    ).toEqual([
      'docs/Netdata Agent/Installation/Linux/Linux.mdx',
      'ingest/generated_map.yaml',
      'ingest/generated_sidebar_order.json',
      'ingest/generated_sidebar_order.json.sha256',
    ]);
  });

  it('allows source-only changes in an ordinary pull request', () => {
    expect(() =>
      verifyGeneratedOutputBoundary({
        ...ordinaryPullRequest,
        changedPaths: ['ingest/ingest.py', 'src/seo/title.js', 'netlify.toml'],
      }),
    ).not.toThrow();
  });

  it('rejects generated documentation in an ordinary pull request', () => {
    expect(() =>
      verifyGeneratedOutputBoundary({
        ...ordinaryPullRequest,
        changedPaths: ['docs/Collecting Metrics/Collectors/Collectors.mdx'],
      }),
    ).toThrow(/dedicated ingest automation pull request/);
  });

  it('rejects generated state in an ordinary pull request', () => {
    expect(() =>
      verifyGeneratedOutputBoundary({
        ...ordinaryPullRequest,
        changedPaths: ['ingest/generated_sidebar_order.json.sha256'],
      }),
    ).toThrow(/generated_sidebar_order\.json\.sha256/);
  });

  it('allows generated output only from the same-repository ingest automation PR', () => {
    expect(() =>
      verifyGeneratedOutputBoundary({
        ...ingestPullRequest,
        changedPaths: ['docs/generated.mdx', 'ingest/generated_map.yaml'],
      }),
    ).not.toThrow();
  });

  it.each([
    ['wrong branch', { headRef: 'manual-ingest' }],
    ['forked branch', { headRepository: 'contributor/learn' }],
    ['missing ingest label', { labels: ['automation'] }],
    ['missing automation label', { labels: ['ingest'] }],
  ])('rejects generated output from an ingest-like PR with %s', (_name, override) => {
    expect(() =>
      verifyGeneratedOutputBoundary({
        ...ingestPullRequest,
        ...override,
        changedPaths: ['docs/generated.mdx'],
      }),
    ).toThrow(/dedicated ingest automation pull request/);
  });

  it('runs ingest after generator-only and redirect-source changes reach master', () => {
    const workflow = readFileSync(
      path.join(repositoryRoot, '.github/workflows/ingest.yml'),
      'utf8',
    );
    expect(workflow).toContain('- ingest/**');
    expect(workflow).toContain('- static.toml');
  });

  it('writes the kickstart checksum inside ingest before validating recovery state', () => {
    const workflow = readFileSync(
      path.join(repositoryRoot, '.github/workflows/ingest.yml'),
      'utf8',
    );
    const resolveChecksum = workflow.indexOf('- name: Resolve kickstart checksum');
    const runIngest = workflow.indexOf(
      '- name: Ingest process, integration generation and learn_link checking',
    );
    const verifyRecovery = workflow.indexOf('- name: Verify generated recovery state');
    const publish = workflow.indexOf('- name: Create pull request');

    expect(resolveChecksum).toBeGreaterThan(-1);
    expect(resolveChecksum).toBeLessThan(runIngest);
    expect(workflow).toContain('--kickstart-checksum "$KICKSTART_CHECKSUM"');
    expect(workflow).not.toContain('s/@KICKSTART_CHECKSUM@/');
    expect(verifyRecovery).toBeGreaterThan(runIngest);
    expect(verifyRecovery).toBeLessThan(publish);
    expect(workflow).toContain('python ingest/ingest.py --regenerate-grids-only');
    expect(workflow).toContain('generated-before.sha256');
    expect(workflow).toContain('generated-after.sha256');
    expect(workflow).toContain('diff -u');
  });

  it('fails closed before publishing incomplete ingest output', () => {
    const workflow = readFileSync(
      path.join(repositoryRoot, '.github/workflows/ingest.yml'),
      'utf8',
    );
    const classifier = 'python ingest/classify_ingest_result.py "$EXIT_CODE"';
    expect(workflow).toContain(classifier);
    expect(workflow.indexOf(classifier)).toBeLessThan(
      workflow.indexOf('- name: Create pull request'),
    );
  });

  it('checks broken-link assignee eligibility before issue publication', () => {
    const workflow = readFileSync(
      path.join(repositoryRoot, '.github/workflows/ingest.yml'),
      'utf8',
    );
    expect(workflow).toContain(
      'GET /repos/{owner}/{repo}/assignees/{assignee}',
    );
  });
});
