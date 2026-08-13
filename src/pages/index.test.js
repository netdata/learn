import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './index';

describe('Home page', () => {
  describe('rendering', () => {
    it('renders a useful server-renderable documentation landing page', () => {
      const {container} = render(<Home />);
      expect(container.firstChild).toHaveAttribute('data-title', 'Netdata documentation');
      expect(container.firstChild).toHaveAttribute(
        'data-description',
        'Learn how to install, configure, monitor, and troubleshoot systems and applications with Netdata.',
      );
      expect(screen.getByRole('heading', {level: 1, name: 'Netdata documentation'}))
        .toBeInTheDocument();
      expect(screen.getAllByRole('heading', {level: 1})).toHaveLength(1);
      expect(screen.getByRole('link', {name: 'Get started with Netdata'}))
        .toHaveAttribute('href', '/docs/getting-started');
      expect(screen.getByRole('link', {name: 'Browse collectors and integrations'}))
        .toHaveAttribute('href', '/docs/collecting-metrics');
      expect(screen.getByRole('link', {name: 'Ask Nedi about Netdata'}))
        .toHaveAttribute('href', '/docs/ask-nedi');
    });
  });

  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { container } = render(<Home />);
      expect(container).toMatchSnapshot();
    });
  });
});
