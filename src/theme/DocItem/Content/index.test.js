import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocItemContent from './index';
import { __setMockDoc, __resetMockDoc } from '@docusaurus/plugin-content-docs/client';

describe('DocItemContent component', () => {
  beforeEach(() => {
    __resetMockDoc();
  });

  afterEach(() => {
    __resetMockDoc();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<DocItemContent><p>Test content</p></DocItemContent>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <DocItemContent>
          <div data-testid="child-content">Child element</div>
        </DocItemContent>
      );
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('should have markdown class', () => {
      const { container } = render(<DocItemContent>Content</DocItemContent>);
      const markdownDiv = container.querySelector('.markdown');
      expect(markdownDiv).toBeInTheDocument();
    });
  });

  describe('synthetic title', () => {
    it('should render synthetic title when contentTitle is undefined', () => {
      __setMockDoc({
        contentTitle: undefined,
        frontMatter: { hide_title: false },
        metadata: { title: 'Synthetic Title' }
      });
      render(<DocItemContent>Content</DocItemContent>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Synthetic Title');
    });

    it('should not render synthetic title when hide_title is true', () => {
      __setMockDoc({
        contentTitle: undefined,
        frontMatter: { hide_title: true },
        metadata: { title: 'Hidden Title' }
      });
      render(<DocItemContent>Content</DocItemContent>);
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('should not render synthetic title when contentTitle exists', () => {
      __setMockDoc({
        contentTitle: 'Content Title',
        frontMatter: { hide_title: false },
        metadata: { title: 'Metadata Title' }
      });
      render(<DocItemContent>Content</DocItemContent>);
      // Should not have the metadata title as synthetic
      expect(screen.queryByText('Metadata Title')).not.toBeInTheDocument();
    });
  });

  describe('edit meta row', () => {
    it('should render EditThisPage component', () => {
      __setMockDoc({
        frontMatter: { id: 'regular-doc' },
        metadata: { editUrl: 'https://github.com/edit/test' }
      });
      render(<DocItemContent>Content</DocItemContent>);
      // EditThisPage renders an icon link to edit URL
      const editLink = screen.getByRole('link');
      expect(editLink).toHaveAttribute('href', 'https://github.com/edit/test');
    });

    it('should render edit row for ask-nedi page', () => {
      __setMockDoc({
        frontMatter: { id: 'ask-nedi' },
        metadata: { editUrl: 'https://github.com/edit/test' }
      });
      render(<DocItemContent>Content</DocItemContent>);
      const editLink = screen.getByRole('link');
      expect(editLink).toHaveAttribute('href', 'https://github.com/edit/test');
    });
  });

  describe('MDXContent', () => {
    it('should wrap children in MDXContent', () => {
      render(
        <DocItemContent>
          <p>MDX wrapped content</p>
        </DocItemContent>
      );
      // MDXContent mock renders its children inside a div
      expect(screen.getByText('MDX wrapped content')).toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('should match snapshot with synthetic title', () => {
      __setMockDoc({
        contentTitle: undefined,
        frontMatter: { hide_title: false, id: 'test-doc' },
        metadata: {
          title: 'Test Document',
          editUrl: 'https://github.com/edit/test'
        }
      });
      const { container } = render(<DocItemContent>Test content</DocItemContent>);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot without synthetic title', () => {
      __setMockDoc({
        contentTitle: 'Existing Title',
        frontMatter: { hide_title: false, id: 'test-doc' },
        metadata: {
          title: 'Metadata Title',
          editUrl: 'https://github.com/edit/test'
        }
      });
      const { container } = render(<DocItemContent>Test content</DocItemContent>);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot for ask-nedi page', () => {
      __setMockDoc({
        contentTitle: undefined,
        frontMatter: { hide_title: false, id: 'ask-nedi' },
        metadata: {
          title: 'Ask Netdata',
          editUrl: 'https://github.com/edit/test'
        }
      });
      const { container } = render(<DocItemContent>Ask Netdata content</DocItemContent>);
      expect(container).toMatchSnapshot();
    });
  });
});
