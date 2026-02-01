import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Install, InstallBox } from './index';

describe('Install components', () => {
  describe('Install', () => {
    it('should render without crashing', () => {
      render(<Install>Content</Install>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <Install>
          <div>Child 1</div>
          <div>Child 2</div>
        </Install>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should apply grid classes', () => {
      const { container } = render(<Install>Content</Install>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('grid');
      expect(gridDiv).toHaveClass('grid-flow-row');
      expect(gridDiv).toHaveClass('grid-cols-1');
      expect(gridDiv).toHaveClass('md:grid-cols-3');
      expect(gridDiv).toHaveClass('gap-8');
    });

    it('should apply custom className', () => {
      const { container } = render(<Install className="custom-install">Content</Install>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('custom-install');
    });
  });

  describe('InstallBox', () => {
    it('should render without crashing', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" />);
      expect(screen.getByText('Linux')).toBeInTheDocument();
    });

    it('should render as Link component', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/docs/install/linux');
    });

    it('should render OS name as h3 heading', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Linux');
    });

    it('should render SVG icon when svg prop is provided', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" svg="linux" />);
      const svg = screen.getByTestId('inline-svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('data-src', '/img/install/linux.svg');
    });

    it('should not render SVG icon when svg prop is not provided', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" />);
      const svg = screen.queryByTestId('inline-svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should have group class for hover effects', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('group');
    });

    it('should have border and rounded styling', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('border');
      expect(link).toHaveClass('rounded');
    });

    it('should have padding', () => {
      render(<InstallBox to="/docs/install/linux" os="Linux" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('p-8');
    });
  });

  describe('snapshots', () => {
    it('should match Install snapshot', () => {
      const { container } = render(
        <Install className="test-install">
          <InstallBox to="/docs/install/linux" os="Linux" svg="linux" />
          <InstallBox to="/docs/install/macos" os="macOS" svg="macos" />
          <InstallBox to="/docs/install/docker" os="Docker" svg="docker" />
        </Install>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match InstallBox snapshot without svg', () => {
      const { container } = render(
        <InstallBox to="/docs/install/other" os="Other" />
      );
      expect(container).toMatchSnapshot();
    });

    it('should match InstallBox snapshot with svg', () => {
      const { container } = render(
        <InstallBox to="/docs/install/linux" os="Linux" svg="linux" />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
