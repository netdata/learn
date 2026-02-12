import React from 'react';

// Mock MDXComponents/A (anchor)
const MDXA = ({ href, children, ...props }) => {
  return React.createElement(
    'a',
    { 'data-testid': 'mdx-link', href, ...props },
    children
  );
};

export default MDXA;
