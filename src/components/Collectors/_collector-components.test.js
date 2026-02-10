import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollectorConfiguration, CollectorDebug } from './_collector-components';

describe('CollectorConfiguration component', () => {
  const defaultProps = {
    configURL: 'https://github.com/netdata/netdata/blob/master/collectors/go.d.plugin/modules/example/example.conf',
    moduleName: 'go.d/example.conf',
  };

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      expect(screen.getByText(/To edit the/i)).toBeInTheDocument();
    });

    it('should render module name in code tag', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      // Module name appears multiple times (in text and code blocks)
      const moduleElements = screen.getAllByText('go.d/example.conf');
      expect(moduleElements.length).toBeGreaterThan(0);
    });

    it('should render navigation instruction', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      expect(screen.getByText(/Navigate to the/i)).toBeInTheDocument();
    });

    it('should render edit-config instruction', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      expect(screen.getByText(/Use the/i)).toBeInTheDocument();
      expect(screen.getByText('edit-config')).toBeInTheDocument();
    });

    it('should render enable changes instruction', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      expect(screen.getByText(/Enable changes to the collector/i)).toBeInTheDocument();
      expect(screen.getByText(/enabled: yes/i)).toBeInTheDocument();
    });

    it('should render save and restart instruction', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      expect(screen.getByText(/Save the changes and restart the Agent/i)).toBeInTheDocument();
    });
  });

  describe('code blocks', () => {
    it('should render cd command', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      const codeBlocks = screen.getAllByTestId('code-block');
      expect(codeBlocks.length).toBeGreaterThan(0);
      expect(codeBlocks[0].textContent).toContain('cd /etc/netdata');
    });

    it('should render edit-config command with module name', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      const codeBlocks = screen.getAllByTestId('code-block');
      const editConfigBlock = codeBlocks.find(block =>
        block.textContent.includes('edit-config')
      );
      expect(editConfigBlock).toBeDefined();
      expect(editConfigBlock.textContent).toContain('go.d/example.conf');
    });
  });

  describe('links', () => {
    it('should link to Netdata config directory', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      const link = screen.getByText(/Netdata config directory/i);
      expect(link.closest('a')).toHaveAttribute('href', '/docs/configure/nodes#the-netdata-config-directory');
    });

    it('should link to start-stop-restart', () => {
      render(<CollectorConfiguration {...defaultProps} />);
      const link = screen.getByText(/appropriate method/i);
      expect(link.closest('a')).toHaveAttribute('href', '/docs/configure/start-stop-restart');
    });
  });

  describe('with different props', () => {
    it('should render with different module name', () => {
      render(
        <CollectorConfiguration
          configURL="https://example.com"
          moduleName="python.d/mysql.conf"
        />
      );
      // Module name appears multiple times - check that at least one exists
      const moduleElements = screen.getAllByText('python.d/mysql.conf');
      expect(moduleElements.length).toBeGreaterThan(0);
      const codeBlocks = screen.getAllByTestId('code-block');
      const hasModuleName = codeBlocks.some(block =>
        block.textContent.includes('python.d/mysql.conf')
      );
      expect(hasModuleName).toBe(true);
    });
  });

  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { container } = render(<CollectorConfiguration {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });
  });
});

describe('CollectorDebug component', () => {
  const defaultProps = {
    pluginName: 'go.d.plugin',
    collectorName: 'example',
  };

  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<CollectorDebug {...defaultProps} />);
      expect(screen.getByText(/To troubleshoot issues/i)).toBeInTheDocument();
    });

    it('should render collector name', () => {
      render(<CollectorDebug {...defaultProps} />);
      expect(screen.getByText('example')).toBeInTheDocument();
    });

    it('should render plugin name', () => {
      render(<CollectorDebug {...defaultProps} />);
      const pluginElements = screen.getAllByText('go.d.plugin');
      expect(pluginElements.length).toBeGreaterThan(0);
    });

    it('should render navigation instruction', () => {
      render(<CollectorDebug {...defaultProps} />);
      expect(screen.getByText(/Navigate to your plugins directory/i)).toBeInTheDocument();
    });

    it('should render switch user instruction', () => {
      render(<CollectorDebug {...defaultProps} />);
      expect(screen.getByText(/switch to the/i)).toBeInTheDocument();
      expect(screen.getByText('netdata')).toBeInTheDocument();
    });

    it('should render debug mode instruction', () => {
      render(<CollectorDebug {...defaultProps} />);
      expect(screen.getByText(/in debug mode to identify issues/i)).toBeInTheDocument();
    });

    it('should render troubleshooting note', () => {
      render(<CollectorDebug {...defaultProps} />);
      expect(screen.getByText(/The output should give you clues/i)).toBeInTheDocument();
    });
  });

  describe('code blocks', () => {
    it('should render cd and sudo commands', () => {
      render(<CollectorDebug {...defaultProps} />);
      const codeBlocks = screen.getAllByTestId('code-block');
      expect(codeBlocks.length).toBeGreaterThan(0);
      const hasCdCommand = codeBlocks.some(block =>
        block.textContent.includes('cd /usr/libexec/netdata/plugins.d/')
      );
      expect(hasCdCommand).toBe(true);
    });

    it('should render debug command with plugin and collector names', () => {
      render(<CollectorDebug {...defaultProps} />);
      const codeBlocks = screen.getAllByTestId('code-block');
      const debugBlock = codeBlocks.find(block =>
        block.textContent.includes('-d -m')
      );
      expect(debugBlock).toBeDefined();
      expect(debugBlock.textContent).toContain('go.d.plugin');
      expect(debugBlock.textContent).toContain('example');
    });
  });

  describe('with different props', () => {
    it('should render with different plugin and collector names', () => {
      render(
        <CollectorDebug
          pluginName="python.d.plugin"
          collectorName="mysql"
        />
      );
      const pluginElements = screen.getAllByText('python.d.plugin');
      expect(pluginElements.length).toBeGreaterThan(0);
      expect(screen.getByText('mysql')).toBeInTheDocument();
    });
  });

  describe('snapshots', () => {
    it('should match snapshot', () => {
      const { container } = render(<CollectorDebug {...defaultProps} />);
      expect(container).toMatchSnapshot();
    });
  });
});
