import React from 'react';

// Mock Heading component
const Heading = ({ as: Tag = 'h1', children, id, ...props }) => {
  return React.createElement(
    Tag,
    { 'data-testid': 'heading', id, ...props },
    children
  );
};

export default Heading;
