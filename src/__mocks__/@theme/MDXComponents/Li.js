import React from 'react';

// Mock MDXComponents/Li
const MDXLi = ({ children, ...props }) => {
  return React.createElement(
    'li',
    { 'data-testid': 'mdx-li', ...props },
    children
  );
};

export default MDXLi;
