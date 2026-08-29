import fs from 'node:fs';
import path from 'node:path';
import {parse} from 'parse5';
import {describe, expect, it} from 'vitest';


const root = path.resolve(import.meta.dirname, '../..');
const expectedDescription =
  "Ask Nedi, Netdata's AI assistant, questions about Netdata documentation, configuration, monitoring, and troubleshooting.";

function frontMatterDescription(source) {
  const match = source.match(/^description:\s*["'](.*)["']\s*$/m);
  return match?.[1] ?? null;
}

function renderedMetadata(html) {
  const values = new Map();
  const visit = (node) => {
    if (node.nodeName === 'meta') {
      const attrs = Object.fromEntries((node.attrs ?? []).map(({name, value}) => [name, value]));
      const key = attrs.name || attrs.property;
      if (key) values.set(key.toLowerCase(), attrs.content ?? '');
    }
    for (const child of node.childNodes ?? []) visit(child);
  };
  visit(parse(html));
  return values;
}

describe('Ask Nedi metadata', () => {
  it('pins the exact authored description in document front matter', () => {
    const source = fs.readFileSync(path.join(root, 'docs/ask-nedi.mdx'), 'utf8');
    expect(frontMatterDescription(source)).toBe(expectedDescription);
  });

  it.skipIf(!process.env.BUILT_SITE_DIR)('renders the exact description and Open Graph description', () => {
    const html = fs.readFileSync(
      path.join(process.env.BUILT_SITE_DIR, 'docs/ask-nedi/index.html'),
      'utf8',
    );
    const metadata = renderedMetadata(html);
    expect(metadata.get('description')).toBe(expectedDescription);
    expect(metadata.get('og:description')).toBe(expectedDescription);
    expect(metadata.get('description')).not.toContain('Loading Ask Nedi');
    expect(metadata.get('og:description')).not.toContain('Loading Ask Nedi');
  });
});
