import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';

// Mock AskNetdataWidget to avoid testing its complex internals
vi.mock('./AskNetdataWidget', () => ({
  default: ({ pillHeight, pillMaxWidth, overlayMaxWidth, onOverlayVisibilityChange }) => (
    <div
      data-testid="ask-netdata-widget"
      data-pill-height={pillHeight}
      data-pill-max-width={pillMaxWidth}
      data-overlay-max-width={overlayMaxWidth}
    >
      Mock Widget
      <button
        data-testid="trigger-overlay"
        onClick={() => onOverlayVisibilityChange && onOverlayVisibilityChange(true)}
      >
        Show Overlay
      </button>
      <button
        data-testid="hide-overlay"
        onClick={() => onOverlayVisibilityChange && onOverlayVisibilityChange(false)}
      >
        Hide Overlay
      </button>
    </div>
  ),
}));

// Import after mock
import AskNetdataWidgetNavbarItem from './AskNetdataWidgetNavbarItem';
import { __setMockLocation, __resetMockLocation } from '@docusaurus/router';

describe('AskNetdataWidgetNavbarItem component', () => {
  // Store original window properties
  const originalInnerWidth = window.innerWidth;
  const originalGetComputedStyle = window.getComputedStyle;

  beforeEach(() => {
    __resetMockLocation();
    // Reset window size to default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    // Mock getComputedStyle
    window.getComputedStyle = vi.fn(() => ({
      transform: 'matrix(1, 0, 0, 1, 0, 0)',
    }));
  });

  afterEach(() => {
    __resetMockLocation();
    window.innerWidth = originalInnerWidth;
    window.getComputedStyle = originalGetComputedStyle;
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<AskNetdataWidgetNavbarItem />);
      expect(screen.getByTestId('ask-netdata-widget')).toBeInTheDocument();
    });

    it('should render the AskNetdataWidget', () => {
      render(<AskNetdataWidgetNavbarItem />);
      expect(screen.getByText('Mock Widget')).toBeInTheDocument();
    });

    it('should pass correct props to widget', () => {
      render(<AskNetdataWidgetNavbarItem />);
      const widget = screen.getByTestId('ask-netdata-widget');
      expect(widget).toHaveAttribute('data-pill-height', '30');
      expect(widget).toHaveAttribute('data-pill-max-width', '520');
      expect(widget).toHaveAttribute('data-overlay-max-width', '1200');
    });
  });

  describe('pathname behavior', () => {
    it('should not render on /ask-netdata page', () => {
      __setMockLocation({ pathname: '/docs/ask-netdata' });
      const { container } = render(<AskNetdataWidgetNavbarItem />);
      expect(container.firstChild).toBeNull();
    });

    it('should render on other pages', () => {
      __setMockLocation({ pathname: '/docs/getting-started' });
      render(<AskNetdataWidgetNavbarItem />);
      expect(screen.getByTestId('ask-netdata-widget')).toBeInTheDocument();
    });

    it('should render when pathname is /', () => {
      __setMockLocation({ pathname: '/' });
      render(<AskNetdataWidgetNavbarItem />);
      expect(screen.getByTestId('ask-netdata-widget')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have flex container styles', () => {
      render(<AskNetdataWidgetNavbarItem />);
      const container = screen.getByTestId('ask-netdata-widget').parentElement;
      expect(container.style.display).toBe('flex');
      expect(container.style.alignItems).toBe('center');
    });

    it('should have maxWidth of 520', () => {
      render(<AskNetdataWidgetNavbarItem />);
      const container = screen.getByTestId('ask-netdata-widget').parentElement;
      // maxWidth is set as number 520, normalized to '520px' by browser
      expect(container.style.maxWidth).toMatch(/520/);
    });
  });

  describe('resize handling', () => {
    it('should add resize event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      render(<AskNetdataWidgetNavbarItem />);
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      addEventListenerSpy.mockRestore();
    });

    it('should remove resize event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<AskNetdataWidgetNavbarItem />);
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('snapshots', () => {
    it('should match snapshot on regular page', () => {
      __setMockLocation({ pathname: '/docs/getting-started' });
      const { container } = render(<AskNetdataWidgetNavbarItem />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot when hidden on ask-netdata', () => {
      __setMockLocation({ pathname: '/docs/ask-netdata' });
      const { container } = render(<AskNetdataWidgetNavbarItem />);
      expect(container).toMatchSnapshot();
    });
  });
});
