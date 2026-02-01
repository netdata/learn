import React from 'react';

// Mock Mermaid component
const Mermaid = ({ value, ...props }) => {
  return React.createElement(
    'div',
    { 'data-testid': 'mermaid', 'data-value': value, ...props },
    'Mermaid Diagram'
  );
};

export default Mermaid;
