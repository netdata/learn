import React from 'react';

// Mock MDXComponents/Pre
const MDXPre = ({ children, ...props }) => {
  return React.createElement(
    'pre',
    { 'data-testid': 'mdx-pre', ...props },
    children
  );
};

export default MDXPre;
