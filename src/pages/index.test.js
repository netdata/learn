import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './index';

describe('Home page', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<Home />);
      // The Redirect component is mocked to render a div with data-redirect
      const redirect = screen.getByTestId('redirect');
      expect(redirect).toBeInTheDocument();
    });

    it('should redirect to /docs/ask-nedi', () => {
      render(<Home />);
      const redirect = screen.getByTestId('redirect');
      expect(redirect).toHaveAttribute('data-to', '/docs/ask-nedi');
    });
  });

  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { container } = render(<Home />);
      expect(container).toMatchSnapshot();
    });
  });
});
