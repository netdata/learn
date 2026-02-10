import { useRef, useEffect } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const NEDI_ENDPOINT = 'https://nedi.netdata.cloud';
const PERSISTENT_ID = 'nedi-persistent';
const SCROLL_KEY = 'nedi-scroll-y';

// Localized welcome phrases — randomly picked on each empty-chat view
const HOME_WELCOME = {
  en: [
    "What's on your mind today?",
    'How can I help?',
    'What are you working on?',
    'Where should we begin?',
    'Ready when you are.',
    "What's on the agenda today?",
    'Hi! Ready to dive in?',
    'Good to see you.',
  ],
  es: [
    '¿Qué tienes en mente hoy?',
    '¿Cómo puedo ayudarte?',
    '¿En qué estás trabajando?',
    '¿Por dónde empezamos?',
    'Listo cuando quieras.',
    '¿Qué hay en la agenda hoy?',
    '¡Hola! ¿Empezamos?',
    'Me alegra verte.',
  ],
  fr: [
    "Qu'avez-vous en tête aujourd'hui ?",
    'Comment puis-je vous aider ?',
    'Sur quoi travaillez-vous ?',
    'Par où commençons-nous ?',
    'Prêt quand vous voulez.',
    "Qu'y a-t-il au programme aujourd'hui ?",
    'Bonjour ! On commence ?',
    'Content de vous voir.',
  ],
  de: [
    'Was haben Sie heute auf dem Herzen?',
    'Wie kann ich helfen?',
    'Woran arbeiten Sie?',
    'Wo fangen wir an?',
    'Bereit, wenn Sie es sind.',
    'Was steht heute auf der Agenda?',
    'Hallo! Bereit loszulegen?',
    'Schön, Sie zu sehen.',
  ],
  pt: [
    'O que você tem em mente hoje?',
    'Como posso ajudar?',
    'No que você está trabalhando?',
    'Por onde começamos?',
    'Pronto quando você quiser.',
    'O que temos na agenda hoje?',
    'Oi! Vamos começar?',
    'Bom te ver.',
  ],
  zh: [
    '今天有什么想法？',
    '我能帮你什么？',
    '你在做什么？',
    '从哪里开始？',
    '准备好了就开始吧。',
    '今天的计划是什么？',
    '你好！准备好了吗？',
    '很高兴见到你。',
  ],
  ja: [
    '今日は何をお考えですか？',
    'お手伝いできることはありますか？',
    '何に取り組んでいますか？',
    'どこから始めましょうか？',
    'いつでもどうぞ。',
    '今日の予定は？',
    'こんにちは！始めましょうか？',
    'お会いできて嬉しいです。',
  ],
  ko: [
    '오늘 무엇을 도와드릴까요?',
    '어떻게 도와드릴까요?',
    '무엇을 작업하고 계신가요?',
    '어디서부터 시작할까요?',
    '준비되시면 시작하겠습니다.',
    '오늘의 일정은 무엇인가요?',
    '안녕하세요! 시작할까요?',
    '반갑습니다.',
  ],
};

// Localized input placeholder — static, not rotating
const HOME_PLACEHOLDER = {
  en: 'Ask anything about Netdata...',
  es: 'Pregunta lo que quieras sobre Netdata...',
  fr: 'Posez vos questions sur Netdata...',
  de: 'Fragen Sie alles über Netdata...',
  pt: 'Pergunte qualquer coisa sobre o Netdata...',
  zh: '问任何关于 Netdata 的问题...',
  ja: 'Netdata について何でも聞いてください...',
  ko: 'Netdata에 대해 무엇이든 물어보세요...',
};

// Hint suggestions shown below input on empty chat
const HOME_HINTS = [
  'Paste logs or error messages to trace issues in the code',
  'Find alternatives for monitoring any technology or application',
  'Create alerts tailored to your specific use cases',
  'Help with deploying and sizing Netdata Parents',
];

// Quick links to top evergreen docs pages
const HOME_QUICK_LINKS = [
  { label: 'Install', url: '/docs/netdata-agent/installation' },
  { label: 'Update', url: '/docs/netdata-agent/maintenance/update' },
  { label: 'Uninstall', url: '/docs/netdata-agent/maintenance/uninstall' },
  { label: 'Configure Alerts', url: '/docs/alerts-and-notifications' },
  { label: 'Netdata Parents', url: '/docs/netdata-parents' },
  { label: 'Collecting Metrics', url: '/docs/collecting-metrics' },
];

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
    theme,
    showThemeToggle: false,
    stickyInput: true,
    cssVariables: CSS_VARIABLES,
    homeWelcome: HOME_WELCOME,
    homePlaceholder: HOME_PLACEHOLDER,
    homeHints: HOME_HINTS,
    homeQuickLinks: HOME_QUICK_LINKS,
    placeholders: [HOME_PLACEHOLDER.en],
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
