import React from 'react';

// Mock MDXComponents/Code
const MDXCode = ({ children, className, ...props }) => {
  return React.createElement(
    'code',
    { 'data-testid': 'mdx-code', className, ...props },
    children
  );
};

export default MDXCode;
