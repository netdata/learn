import React from 'react';
import { vi } from 'vitest';

// Mock color mode context
let mockColorMode = 'light';

export const useColorMode = vi.fn(() => ({
  colorMode: mockColorMode,
  setColorMode: vi.fn((mode) => {
    mockColorMode = mode;
  }),
  isDarkTheme: mockColorMode === 'dark',
}));

// Export for test manipulation
export const __setMockColorMode = (mode) => {
  mockColorMode = mode;
};

// Mock ThemeClassNames
export const ThemeClassNames = {
  docs: {
    docMarkdown: 'theme-doc-markdown',
    docFooterEditMetaRow: 'theme-doc-footer-edit-meta-row',
  },
  common: {
    editThisPage: 'theme-edit-this-page',
  },
};

// Mock Details component
export const Details = React.forwardRef(function Details({ children, summary, ...props }, ref) {
  return React.createElement(
    'details',
    { ref, 'data-testid': 'docusaurus-details', ...props },
    React.createElement('summary', null, summary),
    children
  );
});

// Mock usePrismTheme
export const usePrismTheme = vi.fn(() => ({
  plain: { color: '#000', backgroundColor: '#fff' },
  styles: [],
}));

// Mock useDocsSidebar
export const useDocsSidebar = vi.fn(() => ({
  items: [],
}));

// Mock useWindowSize
export const useWindowSize = vi.fn(() => ({
  width: 1024,
  height: 768,
}));
