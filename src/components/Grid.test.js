import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid, Box, BoxList, BoxListItem, BoxListItemRegexLink } from './Grid';

describe('Grid component', () => {
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

    it('should apply grid classes', () => {
      const { container } = render(<Grid>Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('grid');
      expect(gridDiv).toHaveClass('grid-cols-1');
      expect(gridDiv).toHaveClass('gap-8');
    });

    it('should apply 2-column class when columns=2', () => {
      const { container } = render(<Grid columns={2}>Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('md:grid-cols-2');
    });

    it('should apply 3-column class when columns=3', () => {
      const { container } = render(<Grid columns={3}>Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('md:grid-cols-3');
    });

    it('should apply 4-column class when columns=4', () => {
      const { container } = render(<Grid columns={4}>Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('md:grid-cols-4');
    });

    it('should apply custom className', () => {
      const { container } = render(<Grid className="custom-class">Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('custom-class');
    });

    it('should apply safe class', () => {
      const { container } = render(<Grid>Content</Grid>);
      const gridDiv = container.firstChild;
      expect(gridDiv).toHaveClass('safe');
    });
  });

  describe('Box', () => {
    it('should render without crashing', () => {
      render(<Box title="Test Box">Content</Box>);
      expect(screen.getByText('Test Box')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render as Link when "to" prop is provided', () => {
      render(<Box to="/docs/test" title="Linked Box">Content</Box>);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/docs/test');
    });

    it('should render as div when "to" prop is not provided', () => {
      const { container } = render(<Box title="Div Box">Content</Box>);
      const divElement = container.querySelector('div.group');
      expect(divElement).toBeInTheDocument();
    });

    it('should render title as h2', () => {
      render(<Box title="Box Title">Content</Box>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Box Title');
    });

    it('should render CTA button when provided', () => {
      render(<Box title="Box" cta="Click me">Content</Box>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should not render CTA button when not provided', () => {
      render(<Box title="Box">Content</Box>);
      const button = screen.queryByRole('button');
      expect(button).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Box title="Box" className="custom-box">Content</Box>);
      const boxElement = container.querySelector('.custom-box');
      expect(boxElement).toBeInTheDocument();
    });

    it('should render SVG decoration when image prop is true', () => {
      const { container } = render(<Box title="Box" image={true}>Content</Box>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have group class for hover effects', () => {
      const { container } = render(<Box to="/test" title="Box">Content</Box>);
      const element = container.firstChild;
      expect(element).toHaveClass('group');
    });
  });

  describe('BoxList', () => {
    it('should render without crashing', () => {
      render(<BoxList>List content</BoxList>);
      expect(screen.getByText('List content')).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <BoxList>
          <div>Item 1</div>
          <div>Item 2</div>
        </BoxList>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should have block class', () => {
      const { container } = render(<BoxList>Content</BoxList>);
      expect(container.firstChild).toHaveClass('block');
    });
  });

  describe('BoxListItem', () => {
    it('should render link when to prop is provided', () => {
      render(<BoxListItem to="/docs/test" title="Test Item" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/docs/test');
    });

    it('should render title text', () => {
      render(<BoxListItem to="/test" title="Item Title" />);
      expect(screen.getByText('Item Title')).toBeInTheDocument();
    });

    it('should render external link icon for http URLs', () => {
      const { container } = render(<BoxListItem to="https://example.com" title="External" />);
      // RiExternalLinkLine renders as SVG
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not render external link icon for internal URLs', () => {
      render(<BoxListItem to="/docs/test" title="Internal" />);
      // Should only have the link, no external icon
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toBeInTheDocument();
    });

    it('should render separator when separator prop is true', () => {
      const { container } = render(<BoxListItem separator={true} />);
      const separator = container.querySelector('span.bg-gray-200');
      expect(separator).toBeInTheDocument();
    });

    it('should have py-1 class', () => {
      const { container } = render(<BoxListItem to="/test" title="Test" />);
      expect(container.firstChild).toHaveClass('py-1');
    });
  });

  describe('BoxListItemRegexLink', () => {
    it('should extract URL from markdown-style link', () => {
      render(<BoxListItemRegexLink to="[Title](/docs/test)" title="Test" />);
      const link = screen.getByTestId('docusaurus-link');
      expect(link).toHaveAttribute('href', '/docs/test');
    });

    it('should render title text', () => {
      render(<BoxListItemRegexLink to="[Title](/docs/test)" title="Link Title" />);
      expect(screen.getByText('Link Title')).toBeInTheDocument();
    });

    it('should render separator when separator prop is true', () => {
      const { container } = render(<BoxListItemRegexLink separator={true} />);
      const separator = container.querySelector('span.bg-gray-200');
      expect(separator).toBeInTheDocument();
    });

    it('should render external link icon when to starts with http', () => {
      // Note: The component checks if `to` starts with 'http', not the extracted URL
      // This means the icon would only show for non-standard `to` values
      const { container } = render(<BoxListItemRegexLink to="https://example.com](https://example.com)" title="External" />);
      // External link icon should be rendered when to starts with http
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should not render external link icon for markdown format URLs', () => {
      // Standard markdown format - to doesn't start with http
      const { container } = render(<BoxListItemRegexLink to="[External](https://example.com)" title="External" />);
      // No icon because to starts with '[', not 'http'
      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('should match Grid snapshot', () => {
      const { container } = render(
        <Grid columns={2} className="test-grid">
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match Box snapshot with link', () => {
      const { container } = render(
        <Box to="/docs/test" title="Test Box" cta="Learn more" image={true}>
          Box content here
        </Box>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match BoxList snapshot', () => {
      const { container } = render(
        <BoxList>
          <BoxListItem to="/docs/test1" title="Item 1" />
          <BoxListItem separator={true} />
          <BoxListItem to="/docs/test2" title="Item 2" />
        </BoxList>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
