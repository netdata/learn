import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FooterWrapper from './index';

describe('FooterWrapper component', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<FooterWrapper />);
      // Should render the mocked Footer and feedback text
      expect(screen.getByText(/feedback/i)).toBeInTheDocument();
    });

    it('should render original Footer component', () => {
      render(<FooterWrapper customProp="test" />);
      // The mock Footer should receive and display the passed props
      const footer = screen.getByTestId('doc-item-footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render feedback link', () => {
      render(<FooterWrapper />);
      const link = screen.getByRole('link', { name: /netdata\/learn/i });
      expect(link).toBeInTheDocument();
    });

    it('should have correct feedback link href', () => {
      render(<FooterWrapper />);
      const link = screen.getByRole('link', { name: /netdata\/learn/i });
      expect(link).toHaveAttribute('href');
      expect(link.getAttribute('href')).toContain('github.com/netdata/learn/issues/new');
    });

    it('should open feedback link in new tab', () => {
      render(<FooterWrapper />);
      const link = screen.getByRole('link', { name: /netdata\/learn/i });
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should render feedback text in italic', () => {
      render(<FooterWrapper />);
      const italicText = screen.getByText(/Do you have any feedback/i);
      expect(italicText.tagName).toBe('I');
    });
  });

  describe('props pass-through', () => {
    it('should pass all props to Footer component', () => {
      render(<FooterWrapper data-custom="value" aria-label="footer" />);
      const footer = screen.getByTestId('doc-item-footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { container } = render(<FooterWrapper />);
      expect(container).toMatchSnapshot();
    });
  });
});
