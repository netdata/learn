import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid, Box } from './Grid_integrations';

describe('Grid_integrations component', () => {
  describe('Grid', () => {
    it('should render without crashing', () => {
      render(<Grid>Content</Grid>);
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <Grid>
          <div>Child 1</div>
          <div>Child 2</div>
        </Grid>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should have grid class', () => {
      const { container } = render(<Grid>Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('grid');
    });

    it('should have custom-grid class', () => {
      const { container } = render(<Grid>Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('custom-grid');
    });
  });

  describe('Box', () => {
    it('should render without crashing', () => {
      render(<Box to="/docs/test" title="Test Box">Content</Box>);
      expect(screen.getByText('Test Box')).toBeInTheDocument();
    });

    it('should render as Link component', () => {
      render(<Box to="/docs/test" title="Test Box">Content</Box>);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/docs/test');
    });

    it('should render title', () => {
      render(<Box to="/docs/test" title="Integration Title">Content</Box>);
      expect(screen.getByText('Integration Title')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <Box to="/docs/test" title="Box">
          <img src="/img/test.png" alt="Test" />
        </Box>
      );
      expect(screen.getByAltText('Test')).toBeInTheDocument();
    });

    it('should render banner when provided', () => {
      render(<Box to="/docs/test" title="Box" banner="New">Content</Box>);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should not render banner when not provided', () => {
      render(<Box to="/docs/test" title="Box">Content</Box>);
      // Check that no banner text is rendered
      const bannerText = screen.queryByText('New');
      expect(bannerText).not.toBeInTheDocument();
    });

    it('should apply banner_color style', () => {
      const { container } = render(
        <Box to="/docs/test" title="Box" banner="New" banner_color="#ff0000">
          Content
        </Box>
      );
      const bannerDiv = screen.getByText('New');
      expect(bannerDiv).toHaveStyle({ color: '#ff0000' });
    });

    it('should have white class', () => {
      render(<Box to="/docs/test" title="Box">Content</Box>);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('white');
    });

    it('should have custom-element class', () => {
      render(<Box to="/docs/test" title="Box">Content</Box>);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('custom-element');
    });

    it('should have rounded class', () => {
      render(<Box to="/docs/test" title="Box">Content</Box>);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveClass('rounded');
    });
  });

  describe('snapshots', () => {
    it('should match Grid snapshot', () => {
      const { container } = render(
        <Grid>
          <Box to="/docs/test1" title="Integration 1">
            <span>Icon 1</span>
          </Box>
          <Box to="/docs/test2" title="Integration 2">
            <span>Icon 2</span>
          </Box>
        </Grid>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match Box snapshot with banner', () => {
      const { container } = render(
        <Box to="/docs/test" title="Test Integration" banner="New" banner_color="#00ff00">
          <span>Integration Icon</span>
        </Box>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match Box snapshot without banner', () => {
      const { container } = render(
        <Box to="/docs/test" title="Simple Integration">
          <span>Simple Icon</span>
        </Box>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
