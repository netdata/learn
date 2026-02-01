import { vi } from 'vitest';

// Mock mermaid library
const mermaid = {
  initialize: vi.fn(),
  init: vi.fn(),
  run: vi.fn().mockResolvedValue(undefined),
  render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
  parse: vi.fn().mockResolvedValue(true),
  contentLoaded: vi.fn(),
  mermaidAPI: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }),
  },
};

export default mermaid;
