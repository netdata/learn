import React from 'react';

// Mock original DocItem/Footer
const Footer = (props) => {
  return React.createElement(
    'footer',
    { 'data-testid': 'doc-item-footer', ...props },
    'Original Footer'
  );
};

export default Footer;
