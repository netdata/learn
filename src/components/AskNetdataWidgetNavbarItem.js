import React, { useRef, useEffect, useState } from 'react';
import {useLocation} from '@docusaurus/router';
import AskNetdataWidget from './AskNetdataWidget';

const MIN_WIDTH_FOR_COLLAPSE = 997;
const MAX_WIDTH_FOR_COLLAPSE = 1400;

export default function AskNetdataWidgetNavbarItem() {
  const { pathname } = useLocation();
  const [collapsedByWidget, setCollapsedByWidget] = useState(false);

  useEffect(() => {
    if (collapsedByWidget) {
      const sidebar = document.querySelector('.theme-doc-sidebar-container');
      if (sidebar) {
        const handleMouseEnter = () => {
          if (window.innerWidth < MIN_WIDTH_FOR_COLLAPSE || window.innerWidth > MAX_WIDTH_FOR_COLLAPSE) return;
          const button = document.querySelector('.collapseSidebarButton_PEFL');
          if (button) {
            button.click();
            setCollapsedByWidget(false);
          }
        };
        const handleMouseLeave = () => {
          if (window.innerWidth < MIN_WIDTH_FOR_COLLAPSE || window.innerWidth > MAX_WIDTH_FOR_COLLAPSE) return;
          const button = document.querySelector('.collapseSidebarButton_PEFL');
          if (button) {
            button.click();
            setCollapsedByWidget(true);
          }
        };
        sidebar.addEventListener('mouseenter', handleMouseEnter);
        sidebar.addEventListener('mouseleave', handleMouseLeave);
        return () => {
          sidebar.removeEventListener('mouseenter', handleMouseEnter);
          sidebar.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }
  }, [collapsedByWidget]);

  // Hide the navbar widget on the Ask Netdata page
  if (pathname && pathname.endsWith('/ask-netdata')) return null;

  const handleOverlayVisibility = (visible) => {
    if (window.innerWidth < MIN_WIDTH_FOR_COLLAPSE || window.innerWidth > MAX_WIDTH_FOR_COLLAPSE) return;
    const button = document.querySelector('.collapseSidebarButton_PEFL');
    if (visible && !collapsedByWidget) {
      if (button) {
        button.click();
        setCollapsedByWidget(true);
      }
    } else if (!visible && collapsedByWidget) {
      if (button) {
        button.click();
        setCollapsedByWidget(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, width: '100%', maxWidth: 520, justifyContent: 'center' }}>
      {/* Tune width via these props: pillMaxWidth (pill row), overlayMaxWidth (floating panel) */}
      <AskNetdataWidget pillHeight={30} pillMaxWidth={520} overlayMaxWidth={1200} onOverlayVisibilityChange={handleOverlayVisibility} />
    </div>
  );
}
