import React from 'react';
import {useLocation} from '@docusaurus/router';
import AskNetdataWidget from './AskNetdataWidget';

export default function AskNetdataWidgetNavbarItem() {
  const { pathname } = useLocation();
  // Hide the navbar widget on the Ask Netdata page
  if (pathname && pathname.endsWith('/ask-netdata')) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 260, width: 520, maxWidth: '50vw' }}>
      <AskNetdataWidget pillHeight={30} />
    </div>
  );
}
