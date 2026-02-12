import React from 'react';

// Mock Docusaurus Link component
const Link = React.forwardRef(function Link({ to, href, children, ...props }, ref) {
  const destination = to || href || '#';
  return (
    <a ref={ref} href={destination} data-testid="docusaurus-link" {...props}>
      {children}
    </a>
  );
});

Link.displayName = 'MockLink';

export default Link;
