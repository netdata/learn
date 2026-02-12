import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditThisPage from './index';

describe('EditThisPage component', () => {
  const editUrl = 'https://github.com/netdata/learn/edit/master/docs/test.md';

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<EditThisPage editUrl={editUrl} />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should render as anchor element', () => {
      render(<EditThisPage editUrl={editUrl} />);
      const link = screen.getByRole('link');
      expect(link.tagName).toBe('A');
    });

    it('should have correct href attribute', () => {
      render(<EditThisPage editUrl={editUrl} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', editUrl);
    });
  });

  describe('link attributes', () => {
    it('should open in new tab', () => {
      render(<EditThisPage editUrl={editUrl} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should have security rel attributes', () => {
      render(<EditThisPage editUrl={editUrl} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noreferrer noopener');
    });

    it('should have theme class', () => {
      render(<EditThisPage editUrl={editUrl} />);
      const link = screen.getByRole('link');
      expect(link).toHaveClass('theme-edit-this-page');
    });
  });

  describe('icon', () => {
    it('should render edit icon', () => {
      render(<EditThisPage editUrl={editUrl} />);
      const icon = screen.getByTestId('icon-edit');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('different URLs', () => {
    it('should handle GitHub URL', () => {
      const githubUrl = 'https://github.com/org/repo/edit/main/file.md';
      render(<EditThisPage editUrl={githubUrl} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', githubUrl);
    });

    it('should handle GitLab URL', () => {
      const gitlabUrl = 'https://gitlab.com/org/repo/-/edit/main/file.md';
      render(<EditThisPage editUrl={gitlabUrl} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', gitlabUrl);
    });

    it('should handle any URL', () => {
      const customUrl = 'https://custom.cms.com/edit/123';
      render(<EditThisPage editUrl={customUrl} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', customUrl);
    });
  });

  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { container } = render(<EditThisPage editUrl={editUrl} />);
      expect(container).toMatchSnapshot();
    });
  });
});
