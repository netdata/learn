import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InstallRegexLink, InstallBoxRegexLink } from './index';

describe('InstallRegexLink components', () => {
  describe('InstallRegexLink', () => {
    it('should render without crashing', () => {
      render(<InstallRegexLink>Content</InstallRegexLink>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <InstallRegexLink>
          <div>Child 1</div>
          <div>Child 2</div>
        </InstallRegexLink>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should apply grid classes', () => {
      const { container } = render(<InstallRegexLink>Content</InstallRegexLink>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('grid');
      expect(gridDiv).toHaveClass('grid-flow-row');
      expect(gridDiv).toHaveClass('grid-cols-1');
      expect(gridDiv).toHaveClass('md:grid-cols-3');
      expect(gridDiv).toHaveClass('gap-8');
    });

    it('should apply custom className', () => {
      const { container } = render(<InstallRegexLink className="custom-class">Content</InstallRegexLink>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('custom-class');
    });
  });

  describe('InstallBoxRegexLink', () => {
    it('should render without crashing', () => {
      render(<InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" />);
      expect(screen.getByText('Linux')).toBeInTheDocument();
    });

    it('should extract URL from markdown-style link', () => {
      render(<InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveAttribute('href', '/docs/install/linux');
    });

    it('should handle various markdown link formats', () => {
      const testCases = [
        { to: '[Test](/path/to/doc)', expected: '/path/to/doc' },
        { to: '[Another](https://example.com/page)', expected: 'https://example.com/page' },
        { to: '[Link](/docs/with-dashes)', expected: '/docs/with-dashes' },
      ];

      testCases.forEach(({ to, expected }) => {
        const { unmount } = render(<InstallBoxRegexLink to={to} os="Test" />);
        const link = screen.getByTestId('docusaurus-link');
        expect(link).toHaveAttribute('href', expected);
        unmount();
      });
    });

    it('should render OS name as h3 heading', () => {
      render(<InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Linux');
    });

    it('should render SVG icon when svg prop is provided', () => {
      render(<InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" svg="linux" />);
      const svg = screen.getByTestId('inline-svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('data-src', '/img/install/linux.svg');
    });

    it('should not render SVG icon when svg prop is not provided', () => {
      render(<InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" />);
      const svg = screen.queryByTestId('inline-svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should have group class for hover effects', () => {
      render(<InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('group');
    });

    it('should have border and rounded styling', () => {
      render(<InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('border');
      expect(link).toHaveClass('rounded');
    });
  });

  describe('snapshots', () => {
    it('should match InstallRegexLink snapshot', () => {
      const { container } = render(
        <InstallRegexLink className="test-class">
          <InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" svg="linux" />
          <InstallBoxRegexLink to="[macOS](/docs/install/macos)" os="macOS" svg="macos" />
        </InstallRegexLink>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match InstallBoxRegexLink snapshot', () => {
      const { container } = render(
        <InstallBoxRegexLink to="[Linux](/docs/install/linux)" os="Linux" svg="linux" />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
