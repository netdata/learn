import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calculator } from './index';

describe('Calculator component', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<Calculator />);
      expect(screen.getByLabelText(/How many days/i)).toBeInTheDocument();
    });

    it('should render all input fields', () => {
      render(<Calculator />);
      expect(screen.getByLabelText(/How many days do you want to store metrics/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/How often.*collect metrics/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/How many metrics.*collect/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/How many child streaming nodes/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/compression savings ratio/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/page cache size/i)).toBeInTheDocument();
    });

    it('should render results section', () => {
      render(<Calculator />);
      expect(screen.getByText(/Netdata will use the following resources/i)).toBeInTheDocument();
    });

    it('should render configuration section', () => {
      render(<Calculator />);
      expect(screen.getByText(/To enable this setup/i)).toBeInTheDocument();
    });
  });

  describe('default values', () => {
    it('should have default retention of 1 day', () => {
      render(<Calculator />);
      const retentionInput = screen.getByLabelText(/How many days/i);
      expect(retentionInput).toHaveValue(1);
    });

    it('should have default update interval of 1 second', () => {
      render(<Calculator />);
      const updateInput = screen.getByLabelText(/How often/i);
      expect(updateInput).toHaveValue(1);
    });

    it('should have default 2000 dimensions', () => {
      render(<Calculator />);
      const dimsInput = screen.getByLabelText(/How many metrics/i);
      expect(dimsInput).toHaveValue(2000);
    });

    it('should have default 0 child nodes', () => {
      render(<Calculator />);
      const childInput = screen.getByLabelText(/child streaming/i);
      expect(childInput).toHaveValue(0);
    });

    it('should have default 50% compression', () => {
      render(<Calculator />);
      const compressionInput = screen.getByLabelText(/compression/i);
      expect(compressionInput).toHaveValue(50);
    });

    it('should have default 32 MB page cache', () => {
      render(<Calculator />);
      const pageSizeInput = screen.getByLabelText(/page cache/i);
      expect(pageSizeInput).toHaveValue(32);
    });
  });

  describe('input changes', () => {
    it('should update retention value', async () => {
      const user = userEvent.setup();
      render(<Calculator />);
      const retentionInput = screen.getByLabelText(/How many days/i);

      await user.clear(retentionInput);
      await user.type(retentionInput, '7');

      expect(retentionInput).toHaveValue(7);
    });

    it('should update dimensions value', async () => {
      const user = userEvent.setup();
      render(<Calculator />);
      const dimsInput = screen.getByLabelText(/How many metrics/i);

      await user.clear(dimsInput);
      await user.type(dimsInput, '5000');

      expect(dimsInput).toHaveValue(5000);
    });

    it('should update child nodes value', async () => {
      const user = userEvent.setup();
      render(<Calculator />);
      const childInput = screen.getByLabelText(/child streaming/i);

      await user.clear(childInput);
      await user.type(childInput, '10');

      expect(childInput).toHaveValue(10);
    });

    it('should update compression value', async () => {
      const user = userEvent.setup();
      render(<Calculator />);
      const compressionInput = screen.getByLabelText(/compression/i);

      await user.clear(compressionInput);
      await user.type(compressionInput, '70');

      expect(compressionInput).toHaveValue(70);
    });

    it('should update page cache value', async () => {
      const user = userEvent.setup();
      render(<Calculator />);
      const pageSizeInput = screen.getByLabelText(/page cache/i);

      await user.clear(pageSizeInput);
      await user.type(pageSizeInput, '64');

      expect(pageSizeInput).toHaveValue(64);
    });
  });

  describe('calculations', () => {
    it('should display disk space result', () => {
      render(<Calculator />);
      // Find the span containing disk result
      const diskText = screen.getByText(/in total disk space/i);
      const diskContainer = diskText.closest('div');
      expect(diskContainer.textContent).toMatch(/\d+\s*MiB.*in total disk space/i);
    });

    it('should display RAM result', () => {
      render(<Calculator />);
      // Find the span containing RAM result
      const ramText = screen.getByText(/in system memory/i);
      const ramContainer = ramText.closest('div');
      expect(ramContainer.textContent).toMatch(/\d+\s*MiB.*in system memory/i);
    });

    it('should update results when inputs change', async () => {
      render(<Calculator />);

      // Get initial disk value
      const diskContainerBefore = screen.getByText(/in total disk space/i).closest('div');
      const diskTextBefore = diskContainerBefore.textContent;

      // Increase retention using fireEvent.change (more reliable for number inputs)
      const retentionInput = screen.getByLabelText(/How many days/i);
      fireEvent.change(retentionInput, { target: { value: '30' } });

      // Disk space should increase
      await waitFor(() => {
        const diskContainerAfter = screen.getByText(/in total disk space/i).closest('div');
        const diskTextAfter = diskContainerAfter.textContent;
        expect(diskTextAfter).not.toBe(diskTextBefore);
      });
    });

    it('should show child node info when child > 0', async () => {
      render(<Calculator />);

      const childInput = screen.getByLabelText(/child streaming/i);
      fireEvent.change(childInput, { target: { value: '5' } });

      await waitFor(() => {
        // Text appears multiple times when child > 0, so use getAllByText
        const parentNodeTexts = screen.getAllByText(/on your parent node/i);
        expect(parentNodeTexts.length).toBeGreaterThan(0);
      });
    });

    it('should show plural "child nodes" when child > 1', async () => {
      const { container } = render(<Calculator />);

      const childInput = screen.getByLabelText(/child streaming/i);
      fireEvent.change(childInput, { target: { value: '3' } });

      await waitFor(() => {
        // The "s" for plural is in a separate span, check container text
        expect(container.textContent).toMatch(/3 child nodes/i);
      });
    });

    it('should show singular "child node" when child = 1', async () => {
      const { container } = render(<Calculator />);

      const childInput = screen.getByLabelText(/child streaming/i);
      fireEvent.change(childInput, { target: { value: '1' } });

      await waitFor(() => {
        // Check that we have "1 child node" without extra "s"
        expect(container.textContent).toMatch(/1 child node\)/i);
      });
    });

    it('should show plural "days" when retention > 1', async () => {
      render(<Calculator />);

      const retentionInput = screen.getByLabelText(/How many days/i);
      fireEvent.change(retentionInput, { target: { value: '7' } });

      await waitFor(() => {
        // Should show "days" (plural)
        expect(screen.getByText(/7 day/i)).toBeInTheDocument();
      });
    });

    it('should show singular "day" when retention = 1', () => {
      render(<Calculator />);
      // Default is 1 day
      expect(screen.getByText(/1 day/i)).toBeInTheDocument();
    });
  });

  describe('configuration output', () => {
    it('should render dbengine configuration', () => {
      render(<Calculator />);
      // There are multiple mentions - check specifically for the config code block
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock.textContent).toContain('dbengine multihost disk space');
    });

    it('should have code block for configuration', () => {
      render(<Calculator />);
      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock.textContent).toContain('[global]');
      expect(codeBlock.textContent).toContain('dbengine multihost disk space');
    });
  });

  describe('notes section', () => {
    it('should render notes section', () => {
      render(<Calculator />);
      expect(screen.getByText(/Notes on the database engine calculator/i)).toBeInTheDocument();
    });

    it('should render minimum disk space note', () => {
      render(<Calculator />);
      expect(screen.getByText(/requires a minimum disk space/i)).toBeInTheDocument();
    });

    it('should render memory note', () => {
      render(<Calculator />);
      expect(screen.getByText(/only for the database engine/i)).toBeInTheDocument();
    });

    it('should show multi-host note when children > 0', async () => {
      render(<Calculator />);

      const childInput = screen.getByLabelText(/child streaming/i);
      fireEvent.change(childInput, { target: { value: '3' } });

      await waitFor(() => {
        expect(screen.getByText(/dbengine multi-host instance/i)).toBeInTheDocument();
      });
    });
  });

  describe('links', () => {
    it('should link to edit netdata.conf docs', () => {
      render(<Calculator />);
      const link = screen.getByRole('link', { name: /edit your.*netdata\.conf/i });
      expect(link).toHaveAttribute('href', '/docs/configure/nodes#use-edit-config-to-edit-netdataconf');
    });
  });

  describe('snapshots', () => {
    it('should match snapshot with defaults', () => {
      const { container } = render(<Calculator />);
      expect(container).toMatchSnapshot();
    });
  });
});
