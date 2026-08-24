import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const profilePages = [
  'docs/Collecting Metrics/Collectors/Applications/LiteLLM.mdx',
  'docs/Collecting Metrics/Collectors/Applications/Prometheus endpoint.mdx',
  'docs/Collecting Metrics/Collectors/Applications/vLLM.mdx',
  'docs/Collecting Metrics/Collectors/Storage and Filesystems/Ceph Prometheus.mdx',
  'docs/Collecting Metrics/Collectors/Web Servers and Proxies/HAProxy Prometheus.mdx',
];
const tableHeader = '| Prometheus metric | Netdata chart | Dimension | Unit | Scope |';

function metricsSection(relativePath) {
  const source = readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
  const start = source.indexOf('\n## Metrics\n');
  expect(start, `${relativePath} has no Metrics section`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf('\n## ', start + '\n## Metrics\n'.length);
  return source.slice(start, end < 0 ? undefined : end);
}

describe('generated Prometheus profile metrics', () => {
  it.each(profilePages)('%s uses ordinary metric tables', (relativePath) => {
    const metrics = metricsSection(relativePath);

    expect(metrics).toContain(tableHeader);
    expect(metrics).toMatch(/^\| <code>.+<\/code> \| .+ \| <code>.+<\/code> \|/m);
    expect(metrics).not.toContain('<details');
    expect(metrics).not.toContain('data-prometheus-profile');
    expect(metrics).not.toContain('This collector has built-in grouping logic');
  });
});
