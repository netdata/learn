import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Callout from './Callout';

describe('Callout component', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<Callout type="notice">Test content</Callout>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <Callout type="notice">
          <p>This is a notice</p>
        </Callout>
      );
      expect(screen.getByText('This is a notice')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Callout type="notice">
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </Callout>
      );
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    });
  });

  describe('notice type', () => {
    it('should render with notice styling', () => {
      const { container } = render(<Callout type="notice">Notice content</Callout>);
      const calloutDiv = container.firstChild;
      expect(calloutDiv).toHaveClass('bg-green');
    });

    it('should render lightbulb icon for notice type', () => {
      const { container } = render(<Callout type="notice">Notice content</Callout>);
      // Check that SVG icon is rendered
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('warning type', () => {
    it('should render with warning styling', () => {
      const { container } = render(<Callout type="warning">Warning content</Callout>);
      const calloutDiv = container.firstChild;
      expect(calloutDiv).toHaveClass('bg-red');
    });

    it('should render warning icon for warning type', () => {
      const { container } = render(<Callout type="warning">Warning content</Callout>);
      // Check that SVG icon is rendered
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have flex layout', () => {
      const { container } = render(<Callout type="notice">Content</Callout>);
      const calloutDiv = container.firstChild;
      expect(calloutDiv).toHaveClass('flex');
    });

    it('should have items-center alignment', () => {
      const { container } = render(<Callout type="notice">Content</Callout>);
      const calloutDiv = container.firstChild;
      expect(calloutDiv).toHaveClass('items-center');
    });

    it('should have padding classes', () => {
      const { container } = render(<Callout type="notice">Content</Callout>);
      const calloutDiv = container.firstChild;
      expect(calloutDiv).toHaveClass('p-4');
      expect(calloutDiv).toHaveClass('pr-6');
    });

    it('should have border and rounded classes', () => {
      const { container } = render(<Callout type="notice">Content</Callout>);
      const calloutDiv = container.firstChild;
      expect(calloutDiv).toHaveClass('border');
      expect(calloutDiv).toHaveClass('rounded');
    });

    it('should have prose class for content', () => {
      const { container } = render(<Callout type="notice">Content</Callout>);
      const proseDiv = container.querySelector('.prose');
      expect(proseDiv).toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('should match snapshot for notice type', () => {
      const { container } = render(<Callout type="notice">Notice snapshot content</Callout>);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for warning type', () => {
      const { container } = render(<Callout type="warning">Warning snapshot content</Callout>);
      expect(container).toMatchSnapshot();
    });
  });
});
