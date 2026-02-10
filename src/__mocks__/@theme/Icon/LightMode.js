import React from 'react';

// Mock LightMode icon
const IconLightMode = (props) => {
  return React.createElement(
    'svg',
    { 'data-testid': 'icon-light-mode', ...props },
    React.createElement('circle', { cx: 12, cy: 12, r: 5 })
  );
};

export default IconLightMode;
