import React from 'react';

// Mock react-inlinesvg
const SVG = ({ src, alt, ...props }) => {
  return React.createElement(
    'svg',
    { 'data-testid': 'inline-svg', 'data-src': src, 'aria-label': alt, ...props },
    React.createElement('title', null, alt || 'SVG')
  );
};

export default SVG;
