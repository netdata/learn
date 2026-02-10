import { vi } from 'vitest';

let isBrowser = true;

const useIsBrowser = vi.fn(() => isBrowser);

// Export for test manipulation
export const __setIsBrowser = (value) => {
  isBrowser = value;
};

export default useIsBrowser;
