import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Details from './index';

describe('Details component', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<Details summary="Click to expand">Content inside</Details>);
      expect(screen.getByText('Content inside')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <Details summary="Summary">
          <p>Paragraph content</p>
          <ul>
            <li>List item</li>
          </ul>
        </Details>
      );
      expect(screen.getByText('Paragraph content')).toBeInTheDocument();
      expect(screen.getByText('List item')).toBeInTheDocument();
    });

    it('should render summary text', () => {
      render(<Details summary="My Summary">Content</Details>);
      expect(screen.getByText('My Summary')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have alert classes', () => {
      const { container } = render(<Details summary="Summary">Content</Details>);
      const details = container.querySelector('details');
      expect(details).toHaveClass('alert');
      expect(details).toHaveClass('alert--info');
    });

    it('should have details style class', () => {
      const { container } = render(<Details summary="Summary">Content</Details>);
      const details = container.querySelector('details');
      // The styles.details class should be applied
      expect(details.className).toContain('details');
    });

    it('should pass through custom className', () => {
      const { container } = render(
        <Details summary="Summary" className="custom-class">
          Content
        </Details>
      );
      const details = container.querySelector('details');
      expect(details).toHaveClass('custom-class');
    });
  });

  describe('HTML structure', () => {
    it('should render as details element', () => {
      const { container } = render(<Details summary="Summary">Content</Details>);
      const details = container.querySelector('details');
      expect(details).toBeInTheDocument();
    });

    it('should have data-testid from mock', () => {
      render(<Details summary="Summary">Content</Details>);
      const details = screen.getByTestId('docusaurus-details-generic');
      expect(details).toBeInTheDocument();
    });
  });

  describe('props forwarding', () => {
    it('should forward additional props', () => {
      const { container } = render(
        <Details summary="Summary" open data-custom="value">
          Content
        </Details>
      );
      const details = container.querySelector('details');
      expect(details).toHaveAttribute('open');
      expect(details).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('snapshots', () => {
    it('should match snapshot with basic content', () => {
      const { container } = render(
        <Details summary="Click to expand">
          This is the expandable content.
        </Details>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with custom className', () => {
      const { container } = render(
        <Details summary="Summary" className="custom-details">
          Content with custom class
        </Details>
      );
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with complex children', () => {
      const { container } = render(
        <Details summary="Complex Content">
          <p>First paragraph</p>
          <code>Some code</code>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </Details>
      );
      expect(container).toMatchSnapshot();
    });
  });
});
