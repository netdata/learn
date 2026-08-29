import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {parse} from 'parse5';
import {describe, expect, it} from 'vitest';

import {
  ASK_NEDI_DESCRIPTION,
  resolveDocDescription,
} from './description';

const buildRoot = process.env.BUILT_SITE_DIR;

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

describe('ask Nedi metadata', () => {
  it('uses the approved description only for the exact Ask Nedi permalink', () => {
    expect(
      resolveDocDescription({
        description: 'Generated loading fallback',
        permalink: '/docs/ask-nedi',
      }),
    ).toBe(ASK_NEDI_DESCRIPTION);
    expect(
      resolveDocDescription({
        description: 'Another page description',
        permalink: '/docs/ask-nedi/extra',
      }),
    ).toBe('Another page description');
    expect(
      resolveDocDescription({
        description: 'Another page description',
        permalink: '/docs/netdata-agent',
      }),
    ).toBe('Another page description');
  });

  it.skipIf(!buildRoot)('renders the exact description and Open Graph description', () => {
    const html = fs.readFileSync(
      path.join(buildRoot, 'docs/ask-nedi/index.html'),
      'utf8',
    );
    const metadata = renderedMetadata(html);
    expect(metadata.get('description')).toBe(ASK_NEDI_DESCRIPTION);
    expect(metadata.get('og:description')).toBe(ASK_NEDI_DESCRIPTION);
    expect(metadata.get('description')).not.toContain('Loading Ask Nedi');
    expect(metadata.get('og:description')).not.toContain('Loading Ask Nedi');
  });
});
