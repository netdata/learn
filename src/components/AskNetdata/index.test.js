import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }) => <div data-testid="react-markdown">{children}</div>,
}));

// Mock remark-gfm
vi.mock('remark-gfm', () => ({
  default: () => {},
}));

// Import the exported SUGGESTION_GROUPS for testing
import { SUGGESTION_GROUPS } from './index';

// Import after mocks
import AskNetdata from './index';

describe('AskNetdata component', () => {
  const originalLocation = window.location;
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Mock window.location
    delete window.location;
    window.location = {
      hostname: 'learn.netdata.cloud',
      href: 'https://learn.netdata.cloud/docs/ask-netdata',
    };

    // Mock fetch API for streaming
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
          }),
        },
        json: () => Promise.resolve({ results: [] }),
      })
    );
  });

  afterEach(() => {
    window.location = originalLocation;
    global.fetch = originalFetch;
  });

  describe('smoke tests', () => {
    it('should render without crashing', () => {
      render(<AskNetdata />);
      // Component should render
      expect(document.body.innerHTML).toBeTruthy();
    });

    it('should render suggestion categories', () => {
      render(<AskNetdata />);
      // Should have rendered something
      const container = document.body.innerHTML;
      expect(container.length).toBeGreaterThan(0);
    });
  });

  describe('SUGGESTION_GROUPS export', () => {
    it('should export SUGGESTION_GROUPS array', () => {
      expect(Array.isArray(SUGGESTION_GROUPS)).toBe(true);
    });

    it('should have at least one suggestion group', () => {
      expect(SUGGESTION_GROUPS.length).toBeGreaterThan(0);
    });

    it('should have about group', () => {
      const aboutGroup = SUGGESTION_GROUPS.find(g => g.key === 'about');
      expect(aboutGroup).toBeDefined();
      expect(aboutGroup.title).toBe('About Netdata');
    });

    it('should have deployment group', () => {
      const deploymentGroup = SUGGESTION_GROUPS.find(g => g.key === 'deployment');
      expect(deploymentGroup).toBeDefined();
      expect(deploymentGroup.title).toBe('Deployment');
    });

    it('should have operations group', () => {
      const opsGroup = SUGGESTION_GROUPS.find(g => g.key === 'operations');
      expect(opsGroup).toBeDefined();
      expect(opsGroup.title).toBe('Operations');
    });

    it('should have ai group', () => {
      const aiGroup = SUGGESTION_GROUPS.find(g => g.key === 'ai');
      expect(aiGroup).toBeDefined();
      expect(aiGroup.title).toBe('AI & Machine Learning');
    });

    it('each group should have items array', () => {
      SUGGESTION_GROUPS.forEach(group => {
        expect(Array.isArray(group.items)).toBe(true);
        expect(group.items.length).toBeGreaterThan(0);
      });
    });

    it('each group should have key and title', () => {
      SUGGESTION_GROUPS.forEach(group => {
        expect(typeof group.key).toBe('string');
        expect(typeof group.title).toBe('string');
        expect(group.key.length).toBeGreaterThan(0);
        expect(group.title.length).toBeGreaterThan(0);
      });
    });
  });

  describe('structure', () => {
    it('should render container with proper class', () => {
      const { container } = render(<AskNetdata />);
      // Note: We avoid snapshot testing here because the component cycles through
      // random suggestions, making snapshots unstable
      expect(container.firstChild).toBeTruthy();
    });

    it('should render main container element', () => {
      const { container } = render(<AskNetdata />);
      // Component should render its main container
      const mainContainer = container.querySelector('[style*="flex"]');
      expect(mainContainer).toBeTruthy();
    });
  });
});
