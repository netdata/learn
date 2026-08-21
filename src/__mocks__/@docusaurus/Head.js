import React from 'react';

// The real component renders nothing into the tree; this records the declared tags so
// tests can assert what would reach the document head.
export default function Head({ link = [], script = [], children = null }) {
  return React.createElement(
    'div',
    {
      'data-testid': 'docusaurus-head',
      'data-link': JSON.stringify(link),
      'data-script': JSON.stringify(script),
    },
    children,
  );
}
