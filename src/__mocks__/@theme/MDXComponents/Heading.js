import React from 'react';

// Mock MDXComponents/Heading
const MDXHeading = ({ as: Tag = 'h1', children, ...props }) => {
  return React.createElement(
    Tag,
    { 'data-testid': 'mdx-heading', ...props },
    children
  );
};

export default MDXHeading;
