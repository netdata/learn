import React from 'react';

// Mock MDXContent component - just renders children
const MDXContent = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'mdx-content' }, children);
};

export default MDXContent;
