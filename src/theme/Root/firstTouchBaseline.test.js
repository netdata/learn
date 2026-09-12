import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

import { __setMockLocation, __resetMockLocation } from '@docusaurus/router';
import Root from './index';

const websiteCookie = `nd_first_touch=${encodeURIComponent(JSON.stringify({
  landing_page: '/website-first/',
  referrer: 'https://search.example/',
  utm_source: 'search',
  ts: '2026-09-01T00:00:00.000Z',
}))}`;
let jar;
let writeCookie;

function navigate(pathname, search = '') {
  window.history.replaceState({}, '', `${pathname}${search}`);
  __setMockLocation({ pathname, search, hash: '' });
}

beforeEach(() => {
  jar = '';
  vi.spyOn(document, 'cookie', 'get').mockImplementation(() => jar);
  writeCookie = vi.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
    jar = value.split(';')[0];
  });
  vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://search.example/');
});

afterEach(() => {
  __resetMockLocation();
  window.history.replaceState({}, '', '/');
  vi.restoreAllMocks();
});

describe('Learn Root capture baseline before a Learn producer exists', () => {
  it('renders a direct campaign entry without writing a first-touch cookie', () => {
    navigate('/docs/netdata-agent', '?utm_source=search&utm_medium=organic');
    const page = render(<Root><p>Documentation</p></Root>);

    expect(page.getByText('Documentation')).toBeInTheDocument();
    expect(document.cookie).toBe('');
    expect(writeCookie).not.toHaveBeenCalled();
  });

  it('renders a SPA transition without recording either Learn route', () => {
    navigate('/docs/netdata-agent', '?utm_source=search');
    const page = render(<Root><p>First documentation page</p></Root>);

    navigate('/docs/netdata-agent/installation', '?utm_source=learn');
    page.rerender(<Root><p>Installation</p></Root>);

    expect(page.getByText('Installation')).toBeInTheDocument();
    expect(document.cookie).toBe('');
    expect(writeCookie).not.toHaveBeenCalled();
  });

  it('leaves an existing Website cookie byte-identical on load and SPA navigation', () => {
    jar = websiteCookie;
    navigate('/docs/netdata-agent');
    const page = render(<Root><p>Documentation</p></Root>);

    navigate('/docs/ask-nedi', '?utm_source=learn');
    page.rerender(<Root><p>Ask Nedi</p></Root>);

    expect(document.cookie).toBe(websiteCookie);
    expect(writeCookie).not.toHaveBeenCalled();
  });
});
