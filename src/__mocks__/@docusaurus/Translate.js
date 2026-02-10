import React from 'react';
import { vi } from 'vitest';

// Mock Translate component
const Translate = ({ children, id, description }) => {
  return React.createElement('span', { 'data-testid': 'translate', 'data-id': id }, children);
};

// Mock translate function
export const translate = vi.fn((config, values) => {
  if (typeof config === 'string') return config;
  let message = config.message || '';
  if (values) {
    Object.entries(values).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
  }
  return message;
});

export default Translate;
