import React from 'react';

// Mock DarkMode icon
const IconDarkMode = (props) => {
  return React.createElement(
    'svg',
    { 'data-testid': 'icon-dark-mode', ...props },
    React.createElement('path', { d: 'M21 12.79A9 9 0 1 1 11.21 3' })
  );
};

export default IconDarkMode;
