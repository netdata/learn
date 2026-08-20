import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { __setMockPathname, __resetMockLocation } from '@docusaurus/router';
import { NEDI_ASSETS } from '@site/src/components/Nedi/assets';
import Root from './index';

const declared = () => {
  const head = screen.queryByTestId('docusaurus-head');
  if (!head) return null;
  return {
    link: JSON.parse(head.getAttribute('data-link')),
    script: JSON.parse(head.getAttribute('data-script')),
  };
};

const renderAt = (pathname) => {
  window.history.replaceState({}, '', pathname);
  __setMockPathname(pathname);
  return render(
    <Root>
      <p>page</p>
    </Root>,
  );
};

describe('Root', () => {
  afterEach(() => {
    __resetMockLocation();
    window.history.replaceState({}, '', '/');
  });

  it('renders the page on every route', () => {
    renderAt('/docs/netdata-agent');

    expect(screen.getByText('page')).toBeInTheDocument();
  });

  it('declares no embed assets on other routes', () => {
    renderAt('/docs/netdata-agent');

    expect(declared()).toBeNull();
  });

  it('declares the embed assets on the Ask Nedi route', () => {
    renderAt('/docs/ask-nedi');

    const tags = declared();
    expect(tags.link).toEqual([
      { rel: 'stylesheet', href: NEDI_ASSETS[0].src },
    ]);
    expect(tags.script.map((tag) => tag.src)).toEqual(
      NEDI_ASSETS.filter((asset) => asset.type === 'js').map((asset) => asset.src),
    );
  });

  it('declares the embed assets on the trailing-slash form of the route', () => {
    renderAt('/docs/ask-nedi/');

    expect(declared()).not.toBeNull();
  });

  it('declares scripts as async with integrity only where the asset pins one', () => {
    renderAt('/docs/ask-nedi');

    declared().script.forEach((tag, index) => {
      const asset = NEDI_ASSETS.filter((entry) => entry.type === 'js')[index];
      // An empty string is what setAttribute produces on the client, so the tag the
      // client builds stays isEqualNode-equal to the server-rendered one.
      expect(tag.async).toBe('');
      if (asset.integrity) {
        expect(tag).toMatchObject({ integrity: asset.integrity, crossorigin: 'anonymous' });
      } else {
        expect(tag.integrity).toBeUndefined();
        expect(tag.crossorigin).toBeUndefined();
      }
    });
  });

  it('keeps declaring the assets after navigating away from the route', () => {
    const { rerender } = renderAt('/docs/ask-nedi');

    __setMockPathname('/docs/netdata-agent');
    rerender(
      <Root>
        <p>page</p>
      </Root>,
    );

    expect(declared()).not.toBeNull();
  });

  it('declares nothing when entering the route through client-side navigation', () => {
    const { rerender } = renderAt('/docs/netdata-agent');

    __setMockPathname('/docs/ask-nedi');
    rerender(
      <Root>
        <p>page</p>
      </Root>,
    );

    expect(declared()).toBeNull();
  });
});
