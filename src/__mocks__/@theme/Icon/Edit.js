import React from 'react';

// Mock Edit icon
const IconEdit = (props) => {
  return React.createElement(
    'svg',
    { 'data-testid': 'icon-edit', ...props },
    React.createElement('path', { d: 'M0 0h24v24H0z' })
  );
};

export default IconEdit;
