import React from 'react';

export default function Layout({title, description, children}) {
  return (
    <div data-title={title} data-description={description}>
      {children}
    </div>
  );
}
