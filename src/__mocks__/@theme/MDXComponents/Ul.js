import React from 'react';

// Mock MDXComponents/Ul
const MDXUl = ({ children, ...props }) => {
  return React.createElement(
    'ul',
    { 'data-testid': 'mdx-ul', ...props },
    children
  );
};

export default MDXUl;
