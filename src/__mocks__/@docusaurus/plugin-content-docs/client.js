import { vi } from 'vitest';

// Default mock doc data
const mockDocData = {
  metadata: {
    title: 'Test Doc Title',
    description: 'Test doc description',
    editUrl: 'https://github.com/netdata/learn/edit/master/docs/test.md',
    lastUpdatedAt: 1640000000000,
    lastUpdatedBy: 'test-user',
    formattedLastUpdatedAt: 'Dec 20, 2021',
    tags: [],
    permalink: '/docs/test',
    slug: '/test',
  },
  frontMatter: {
    id: 'test-doc',
    title: 'Test Doc',
    hide_title: false,
  },
  contentTitle: undefined, // undefined triggers synthetic title
  toc: [],
};

// Clone to allow modification
let currentMockDoc = { ...mockDocData };

export const useDoc = vi.fn(() => currentMockDoc);

// Export for test manipulation
export const __setMockDoc = (docOverrides) => {
  currentMockDoc = {
    ...mockDocData,
    ...docOverrides,
    metadata: { ...mockDocData.metadata, ...(docOverrides?.metadata || {}) },
    frontMatter: { ...mockDocData.frontMatter, ...(docOverrides?.frontMatter || {}) },
  };
};

export const __resetMockDoc = () => {
  currentMockDoc = { ...mockDocData };
};

export const useDocById = vi.fn(() => mockDocData);

export const useActiveDocContext = vi.fn(() => ({
  activeVersion: { name: 'current', path: '/docs' },
  activeDoc: mockDocData,
}));
