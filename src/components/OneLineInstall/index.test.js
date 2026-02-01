import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OneLineInstall } from './index';

describe('OneLineInstall component', () => {
  // Mock Math.random for consistent snapshot IDs
  const originalRandom = Math.random;
  beforeEach(() => {
    Math.random = vi.fn(() => 0.123456789);
  });
  afterEach(() => {
    Math.random = originalRandom;
  });
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<OneLineInstall />);
      // Check for the command block
      expect(screen.getByTestId('code-block')).toBeInTheDocument();
    });

    it('should render default wget command', () => {
      render(<OneLineInstall />);
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('wget');
      expect(codeBlock.textContent).toContain('get.netdata.cloud/kickstart.sh');
    });

    it('should render curl command when method=curl', () => {
      render(<OneLineInstall method="curl" />);
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('curl');
      expect(codeBlock.textContent).toContain('get.netdata.cloud/kickstart.sh');
    });
  });

  describe('checkboxes', () => {
    it('should render updates checkbox', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /automatic updates/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('should render nightly/stable checkbox', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /nightly or stable/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('should render telemetry checkbox', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /anonymous statistics/i });
      expect(checkbox).toBeInTheDocument();
    });

    it('should render cloud checkbox', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /connect/i });
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe('default states', () => {
    it('should have updates enabled by default', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /automatic updates/i });
      expect(checkbox).toBeChecked();
    });

    it('should have nightly enabled by default', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /nightly or stable/i });
      expect(checkbox).toBeChecked();
    });

    it('should have telemetry enabled by default', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /anonymous statistics/i });
      expect(checkbox).toBeChecked();
    });

    it('should have cloud disabled by default', () => {
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /connect/i });
      expect(checkbox).not.toBeChecked();
    });

    it('should not include flags when defaults are enabled', () => {
      render(<OneLineInstall />);
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).not.toContain('--no-updates');
      expect(codeBlock.textContent).not.toContain('--stable-channel');
      expect(codeBlock.textContent).not.toContain('--disable-telemetry');
      expect(codeBlock.textContent).not.toContain('--claim-token');
    });
  });

  describe('custom default props', () => {
    it('should respect defaultUpdatesEnabled=false', () => {
      render(<OneLineInstall defaultUpdatesEnabled={false} />);
      const checkbox = screen.getByRole('checkbox', { name: /automatic updates/i });
      expect(checkbox).not.toBeChecked();
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('--no-updates');
    });

    it('should respect defaultNightlyEnabled=false', () => {
      render(<OneLineInstall defaultNightlyEnabled={false} />);
      const checkbox = screen.getByRole('checkbox', { name: /nightly or stable/i });
      expect(checkbox).not.toBeChecked();
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('--stable-channel');
    });

    it('should respect defaultTelemetryEnabled=false', () => {
      render(<OneLineInstall defaultTelemetryEnabled={false} />);
      const checkbox = screen.getByRole('checkbox', { name: /anonymous statistics/i });
      expect(checkbox).not.toBeChecked();
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('--disable-telemetry');
    });

    it('should respect defaultCloudEnabled=true', () => {
      render(<OneLineInstall defaultCloudEnabled={true} />);
      const checkbox = screen.getByRole('checkbox', { name: /connect/i });
      expect(checkbox).toBeChecked();
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('--claim-token');
    });

    it('should use custom claim token placeholder', () => {
      render(<OneLineInstall defaultCloudEnabled={true} claimTokenPlaceholder="MY_TOKEN" />);
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('--claim-token MY_TOKEN');
    });
  });

  describe('checkbox interactions', () => {
    it('should toggle updates flag when checkbox clicked', async () => {
      const user = userEvent.setup();
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /automatic updates/i });
      const codeBlock = screen.getByTestId('code-block');

      // Initially enabled (no flag)
      expect(codeBlock.textContent).not.toContain('--no-updates');

      // Click to disable
      await user.click(checkbox);
      expect(codeBlock.textContent).toContain('--no-updates');

      // Click to re-enable
      await user.click(checkbox);
      expect(codeBlock.textContent).not.toContain('--no-updates');
    });

    it('should toggle nightly/stable flag when checkbox clicked', async () => {
      const user = userEvent.setup();
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /nightly or stable/i });
      const codeBlock = screen.getByTestId('code-block');

      // Initially nightly (no flag)
      expect(codeBlock.textContent).not.toContain('--stable-channel');

      // Click to switch to stable
      await user.click(checkbox);
      expect(codeBlock.textContent).toContain('--stable-channel');

      // Click to switch back to nightly
      await user.click(checkbox);
      expect(codeBlock.textContent).not.toContain('--stable-channel');
    });

    it('should toggle telemetry flag when checkbox clicked', async () => {
      const user = userEvent.setup();
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /anonymous statistics/i });
      const codeBlock = screen.getByTestId('code-block');

      // Initially enabled (no flag)
      expect(codeBlock.textContent).not.toContain('--disable-telemetry');

      // Click to disable
      await user.click(checkbox);
      expect(codeBlock.textContent).toContain('--disable-telemetry');

      // Click to re-enable
      await user.click(checkbox);
      expect(codeBlock.textContent).not.toContain('--disable-telemetry');
    });

    it('should toggle cloud flag when checkbox clicked', async () => {
      const user = userEvent.setup();
      render(<OneLineInstall />);
      const checkbox = screen.getByRole('checkbox', { name: /connect/i });
      const codeBlock = screen.getByTestId('code-block');

      // Initially disabled (no flag)
      expect(codeBlock.textContent).not.toContain('--claim-token');

      // Click to enable
      await user.click(checkbox);
      expect(codeBlock.textContent).toContain('--claim-token');

      // Click to disable
      await user.click(checkbox);
      expect(codeBlock.textContent).not.toContain('--claim-token');
    });
  });

  describe('combined flags', () => {
    it('should combine multiple flags correctly', async () => {
      const user = userEvent.setup();
      render(<OneLineInstall />);
      const codeBlock = screen.getByTestId('code-block');

      // Disable updates
      await user.click(screen.getByRole('checkbox', { name: /automatic updates/i }));
      // Switch to stable
      await user.click(screen.getByRole('checkbox', { name: /nightly or stable/i }));
      // Disable telemetry
      await user.click(screen.getByRole('checkbox', { name: /anonymous statistics/i }));
      // Enable cloud
      await user.click(screen.getByRole('checkbox', { name: /connect/i }));

      expect(codeBlock.textContent).toContain('--no-updates');
      expect(codeBlock.textContent).toContain('--stable-channel');
      expect(codeBlock.textContent).toContain('--disable-telemetry');
      expect(codeBlock.textContent).toContain('--claim-token');
    });
  });

  describe('links', () => {
    it('should render privacy link', () => {
      render(<OneLineInstall />);
      const link = screen.getByText(/anonymous statistics/i);
      expect(link).toBeInTheDocument();
    });

    it('should render connect link', () => {
      render(<OneLineInstall />);
      const link = screen.getByText(/connect/i);
      expect(link).toBeInTheDocument();
    });

    it('should parse custom markdown privacy link', () => {
      render(<OneLineInstall privacyMd="[custom text](/custom/path)" />);
      const link = screen.getByText('custom text');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/custom/path');
    });

    it('should parse custom markdown connect link', () => {
      render(<OneLineInstall connectMd="[custom connect](/custom/connect)" />);
      const link = screen.getByText('custom connect');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', '/custom/connect');
    });

    it('should handle path-only link', () => {
      render(<OneLineInstall privacyMd="/simple/path" />);
      // Should use default text with custom path
      const link = screen.getByText(/anonymous statistics/i);
      expect(link.closest('a')).toHaveAttribute('href', '/simple/path');
    });

    it('should use fallback values for invalid markdown format', () => {
      // When privacyMd is not a markdown link or path, use fallback
      render(<OneLineInstall privacyMd="invalid string" />);
      const link = screen.getByText(/anonymous statistics/i);
      // Should use the fallback href
      expect(link.closest('a')).toHaveAttribute('href', '/docs/deployment-in-production/security-and-privacy-design');
    });

    it('should use fallback values for null/undefined', () => {
      render(<OneLineInstall privacyMd={null} />);
      const link = screen.getByText(/anonymous statistics/i);
      expect(link.closest('a')).toHaveAttribute('href', '/docs/deployment-in-production/security-and-privacy-design');
    });
  });

  describe('styling', () => {
    it('should have container with proper classes', () => {
      const { container } = render(<OneLineInstall />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('relative');
      expect(wrapper).toHaveClass('overflow-hidden');
    });

    it('should have checkbox section with border', () => {
      const { container } = render(<OneLineInstall />);
      const checkboxSection = container.querySelector('.border-l');
      expect(checkboxSection).toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('should match snapshot with defaults', () => {
      const { container } = render(<OneLineInstall />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with curl method', () => {
      const { container } = render(<OneLineInstall method="curl" />);
      expect(container).toMatchSnapshot();
    });

    it('should match snapshot with all flags disabled', () => {
      const { container } = render(
        <OneLineInstall
          defaultUpdatesEnabled={false}
          defaultNightlyEnabled={false}
          defaultTelemetryEnabled={false}
          defaultCloudEnabled={true}
          claimTokenPlaceholder="TEST_TOKEN"
        />
      );
      expect(container).toMatchSnapshot();
    });
  });
});
