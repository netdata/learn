import React from 'react';

// Mock MDXComponents/Img
const MDXImg = ({ src, alt, ...props }) => {
  return React.createElement(
    'img',
    { 'data-testid': 'mdx-img', src, alt, ...props }
  );
};

export default MDXImg;
