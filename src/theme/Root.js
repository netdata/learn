import React, { useEffect } from 'react';
import OriginalRoot from '@theme-original/Root';

export default function Root(props) {
  useEffect(() => {
    // Inject chat widget CSS
    if (!document.getElementById('netdata-chat-widget-css')) {
      const link = document.createElement('link');
      link.id = 'netdata-chat-widget-css';
      link.rel = 'stylesheet';
      link.href = '/chat-widget.css';
      document.head.appendChild(link);
    }

    // Inject chat widget script
    if (!document.getElementById('netdata-chat-widget-js')) {
      const script = document.createElement('script');
      script.id = 'netdata-chat-widget-js';
      script.src = '/chat-widget.js';
      // Do not rely solely on the window 'load' event having fired already.
      // After the script loads and executes, dispatch a synthetic 'load' event
      // so the widget's internal `window.addEventListener('load', ...)` handler
      // runs even when the script is appended after the original load.
      script.onload = () => {
        try {
          // Dispatch a 'load' event to trigger the widget initializer if needed.
          window.dispatchEvent(new Event('load'));
        } catch (e) {
          // ignore
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  return <OriginalRoot {...props} />;
}
