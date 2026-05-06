import { useRef, useEffect } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const NEDI_ENDPOINT = 'https://nedi.netdata.cloud';
const PERSISTENT_ID = 'nedi-persistent';
const SCROLL_KEY = 'nedi-scroll-y';

// Match Docusaurus theme colors for seamless integration
const CSS_VARIABLES = {
  light: {
    '--ai-bg-primary': '#fdfdfd',
    '--ai-bg-secondary': '#f5f5f5',
    '--ai-bg-tertiary': '#e8e8e8',
    '--ai-text-primary': '#1a1a1a',
    '--ai-text-secondary': '#666666',
    '--ai-border-color': '#e0e0e0',
    '--ai-code-bg': '#e8e8e8',
    '--ai-code-text': '#1a1a1a',
  },
  dark: {
    '--ai-bg-primary': '#000000',
    '--ai-bg-secondary': '#141414',
    '--ai-bg-tertiary': '#1A1A1A',
    '--ai-text-primary': '#c0c0c0',
    '--ai-text-secondary': '#808080',
    '--ai-text-assistant-message': '#c0c0c0',
    '--ai-border-color': '#1A1A1A',
    '--ai-code-bg': '#1A1A1A',
    '--ai-code-text': '#e0e0e0',
    '--ai-scrollbar-thumb': '#333333',
    '--ai-scrollbar-track': '#0A0A0A',
  },
};

// Set source identifier for Nedi analytics
if (typeof window !== 'undefined') {
  window.AI_AGENT_UI_SOURCE = 'learn';
}

// Persistent container + instance, survives React unmounts
function getOrCreateNedi(theme) {
  let container = document.getElementById(PERSISTENT_ID);
  if (container) return container;

  container = document.createElement('div');
  container.id = PERSISTENT_ID;
  container.style.cssText = 'width:100%;display:none';
  document.body.appendChild(container);

  window.AiAgentChatConfig = { endpoint: NEDI_ENDPOINT };

  const instance = new window.AiAgentChatUI(container, {
    mode: 'div',
    agentId: 'support-public',
    theme,
    showThemeToggle: false,
    stickyInput: true,
    cssVariables: CSS_VARIABLES,
    urlParams: ['q', 'question'],
    onEvent: (event) => {
      if (event.type === 'user-message' && window.posthog) {
        window.posthog.capture('nedi_question', { question: event.content });
      }
    },
  });

  container.__nediInstance = instance;
  return container;
}

export default function Nedi() {
  const mountRef = useRef(null);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!mountRef.current) return;

    let cleanups = [];

    const boot = () => {
      if (!mountRef.current) return;
      if (typeof window.AiAgentChatUI === 'undefined') return false;

      const nediEl = getOrCreateNedi(colorMode);

      // Move persistent container into the mount point
      mountRef.current.appendChild(nediEl);
      nediEl.style.display = '';

      // Ensure containers fill viewport so sticky footer stays at bottom even when empty.
      // Uses document-relative position (rect.top + scrollY) so the value stays
      // correct even when a resize fires while the user is scrolled down.
      const setMinHeight = () => {
        const top = mountRef.current.getBoundingClientRect().top + window.scrollY;
        const vh = `calc(100vh - ${top}px)`;
        mountRef.current.style.minHeight = vh;
        nediEl.style.minHeight = vh;
        const wrapper = nediEl.querySelector('.ai-agent-wrapper');
        if (wrapper) wrapper.style.minHeight = vh;
      };
      requestAnimationFrame(setMinHeight);
      // SPA back-navigation: layout may need extra time to settle
      const settleTimer = setTimeout(setMinHeight, 150);
      window.addEventListener('resize', setMinHeight);

      // Save scroll position continuously while on this page
      const onScroll = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      window.addEventListener('scroll', onScroll, { passive: true });

      // Restore scroll position after DOM settles
      const savedScroll = sessionStorage.getItem(SCROLL_KEY);
      if (savedScroll) {
        setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 50);
      }

      // Focus the chat input after DOM settles
      requestAnimationFrame(() => {
        const input = nediEl.querySelector('.ai-agent-input');
        if (input) input.focus();
      });

      cleanups = [
        () => clearTimeout(settleTimer),
        () => window.removeEventListener('scroll', onScroll),
        () => window.removeEventListener('resize', setMinHeight),
        () => { nediEl.style.display = 'none'; document.body.appendChild(nediEl); },
      ];
      return true;
    };

    // Try immediately; poll if async script hasn't loaded yet
    if (!boot()) {
      const poll = setInterval(() => { if (boot()) clearInterval(poll); }, 150);
      cleanups.push(() => clearInterval(poll));
    }

    return () => cleanups.forEach(fn => fn());
  }, []);

  // Sync Docusaurus theme changes to Nedi
  useEffect(() => {
    const container = document.getElementById(PERSISTENT_ID);
    if (container && container.__nediInstance) {
      container.__nediInstance.setTheme(colorMode);
    }
  }, [colorMode]);

  return <div ref={mountRef} />;
}
