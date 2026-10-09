import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { __setMockColorMode } from '@docusaurus/theme-common';
import MermaidWrapper from './index';

describe('Mermaid theme adapter', () => {
  beforeEach(() => {
    __setMockColorMode('light');
  });

  it.each(['light', 'dark'])('renders the initial %s theme and diagram text', (mode) => {
    __setMockColorMode(mode);
    render(<MermaidWrapper value="graph TD; A --> B" />);

    const diagram = screen.getByRole('img', { name: 'Mermaid diagram' });
    expect(diagram).toHaveAttribute('data-color-mode', mode);
    expect(diagram).toHaveTextContent('graph TD; A --> B');
  });

  it('regenerates the diagram when hydration or a theme toggle changes the theme', () => {
    const { rerender } = render(<MermaidWrapper value="graph TD; A --> B" />);
    const lightDiagram = screen.getByRole('img', { name: 'Mermaid diagram' });

    __setMockColorMode('dark');
    rerender(<MermaidWrapper value="graph TD; A --> B" />);
    const darkDiagram = screen.getByRole('img', { name: 'Mermaid diagram' });
    expect(darkDiagram).toHaveAttribute('data-color-mode', 'dark');
    expect(darkDiagram).not.toBe(lightDiagram);

    __setMockColorMode('light');
    rerender(<MermaidWrapper value="graph TD; A --> B" />);
    const restoredDiagram = screen.getByRole('img', { name: 'Mermaid diagram' });
    expect(restoredDiagram).toHaveAttribute('data-color-mode', 'light');
    expect(restoredDiagram).not.toBe(darkDiagram);
  });

  it('preserves the rendered instance and forwards new text when the theme stays unchanged', () => {
    const { rerender } = render(<MermaidWrapper value="graph TD; A --> B" />);
    const diagram = screen.getByRole('img', { name: 'Mermaid diagram' });

    rerender(<MermaidWrapper value="graph TD; A --> C" />);

    expect(screen.getByRole('img', { name: 'Mermaid diagram' })).toBe(diagram);
    expect(diagram).toHaveTextContent('graph TD; A --> C');
  });
});
