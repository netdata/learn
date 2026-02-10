import React from 'react';

// Mock Details component from theme-common/Details
export const Details = React.forwardRef(function Details({ children, summary, className, ...props }, ref) {
  return React.createElement(
    'details',
    { ref, className, 'data-testid': 'docusaurus-details-generic', ...props },
    summary && React.createElement('summary', null, summary),
    children
  );
});

export default { Details };
