import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorModeToggle from './index';

// Get the mock to manipulate isBrowser state
import { __setIsBrowser } from '@docusaurus/useIsBrowser';

describe('ColorModeToggle component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    __setIsBrowser(true);
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render light mode icon', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const lightIcon = screen.getByTestId('icon-light-mode');
      expect(lightIcon).toBeInTheDocument();
    });

    it('should render dark mode icon', () => {
      render(<ColorModeToggle value="dark" onChange={mockOnChange} />);
      const darkIcon = screen.getByTestId('icon-dark-mode');
      expect(darkIcon).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for light mode', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('light mode');
    });

    it('should have aria-label for dark mode', () => {
      render(<ColorModeToggle value="dark" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('dark mode');
    });

    it('should have aria-live="polite"', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-live', 'polite');
    });

    it('should have title attribute', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title');
    });
  });

  describe('interactions', () => {
    it('should call onChange with "dark" when clicking in light mode', async () => {
      const user = userEvent.setup();
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnChange).toHaveBeenCalledWith('dark');
    });

    it('should call onChange with "light" when clicking in dark mode', async () => {
      const user = userEvent.setup();
      render(<ColorModeToggle value="dark" onChange={mockOnChange} />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(mockOnChange).toHaveBeenCalledWith('light');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when not in browser', () => {
      __setIsBrowser(false);
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when in browser', () => {
      __setIsBrowser(true);
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should have disabled class when not in browser', () => {
      __setIsBrowser(false);
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('toggleButtonDisabled');
    });
  });

  describe('styling', () => {
    it('should have clean-btn class', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('clean-btn');
    });

    it('should have toggleButton class', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('toggleButton');
    });

    it('should apply custom className', () => {
      render(<ColorModeToggle value="light" onChange={mockOnChange} className="custom-class" />);
      const toggle = screen.getByRole('button').parentElement;
      expect(toggle).toHaveClass('custom-class');
    });
  });

  describe('memoization', () => {
    it('should be memoized (React.memo)', () => {
      // React.memo is applied to ColorModeToggle
      // We can verify by checking the component type
      expect(ColorModeToggle.$$typeof).toBeDefined();
    });
  });

  describe('snapshots', () => {
    it('should match snapshot in light mode', () => {
      const { container } = render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot in dark mode', () => {
      const { container } = render(<ColorModeToggle value="dark" onChange={mockOnChange} />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot when disabled', () => {
      __setIsBrowser(false);
      const { container } = render(<ColorModeToggle value="light" onChange={mockOnChange} />);
      expect(container).toMatchSnapshot();
    });
  });
});
