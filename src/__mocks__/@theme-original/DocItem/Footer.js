import React from 'react';

// Mock original DocItem/Footer
const Footer = (props) => {
  return React.createElement(
    'footer',
    { 'data-testid': 'original-doc-footer', ...props },
    'Original Footer'
  );
};

export default Footer;
