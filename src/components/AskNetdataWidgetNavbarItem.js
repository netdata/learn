import React from 'react';
import AskNetdataWidget from './AskNetdataWidget';

export default function AskNetdataWidgetNavbarItem() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 260, width: 520, maxWidth: '50vw' }}>
      <AskNetdataWidget pillHeight={30} />
    </div>
  );
}
