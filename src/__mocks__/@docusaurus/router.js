import React from 'react';
import { vi } from 'vitest';

// Mock history object
const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  goBack: vi.fn(),
  goForward: vi.fn(),
  listen: vi.fn(() => vi.fn()),
  location: {
    pathname: '/docs/test',
    search: '',
    hash: '',
    state: null,
  },
};

// Mock location object
const mockLocation = {
  pathname: '/docs/test',
  search: '',
  hash: '',
  state: null,
  key: 'test-key',
};

export const useHistory = vi.fn(() => mockHistory);
export const useLocation = vi.fn(() => mockLocation);
export const useParams = vi.fn(() => ({}));

export const Redirect = ({ to }) => {
  return React.createElement('div', { 'data-testid': 'redirect', 'data-to': to }, `Redirect to ${to}`);
};

export const withRouter = (Component) => {
  return function WrappedComponent(props) {
    return React.createElement(Component, {
      ...props,
      history: mockHistory,
      location: mockLocation,
    });
  };
};

// Default location state
const defaultLocation = {
  pathname: '/docs/test',
  search: '',
  hash: '',
  state: null,
  key: 'test-key',
};

// Export mocks for test manipulation
export const __mockHistory = mockHistory;
export const __mockLocation = mockLocation;
export const __setMockPathname = (pathname) => {
  mockLocation.pathname = pathname;
  mockHistory.location.pathname = pathname;
};

export const __setMockLocation = (locationOverrides) => {
  Object.assign(mockLocation, locationOverrides);
  Object.assign(mockHistory.location, locationOverrides);
};

export const __resetMockLocation = () => {
  Object.assign(mockLocation, defaultLocation);
  Object.assign(mockHistory.location, defaultLocation);
};
