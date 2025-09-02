import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './styles.module.css';
import { useColorMode } from '@docusaurus/theme-common';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Import Docusaurus's native CodeBlock for proper code rendering
import CodeBlock from '@theme/CodeBlock';
import MDXCode from '@theme/MDXComponents/Code';
import MDXA from '@theme/MDXComponents/A';
import MDXPre from '@theme/MDXComponents/Pre';
import MDXHeading from '@theme/MDXComponents/Heading';
import MDXUl from '@theme/MDXComponents/Ul';
import MDXLi from '@theme/MDXComponents/Li';
import MDXImg from '@theme/MDXComponents/Img';
import Mermaid from '@theme/Mermaid';

// =============================
// Ask Netdata Suggestion Groups
// =============================
// Edit this single constant to add/remove categories or sentences.
// - key: stable identifier (no spaces)
// - title: category display title
// - items: array of suggestion sentences (strings)
export const SUGGESTION_GROUPS = [
  {
    key: 'about',
    title: 'About Netdata',
    items: [
      'What is Netdata and what makes it different?',
      'What is a Netdata Agent, a Parent, and Netdata Cloud?',
      'What is distributed monitoring and why it matters for me?',
      'Why and how is Netdata more cost efficient?',
      'How does Netdata handle data privacy and security?',
      'How do I install Netdata on Ubuntu?'
    ]
  },
  {
    key: 'deployment',
    title: 'Deployment',
    items: [
      'Can I run Netdata in hybrid or multi-cloud setups?',
      'How does Netdata scale in large environments?',
      'Will running Netdata slow down my production servers?',
      'Can Netdata monitor bare-metal servers and GPUs?',
      'Can you visually explain how to setup parents for high availability?',
      'How to monitor Docker containers with Netdata?'
    ]
  },
  {
    key: 'operations',
    title: 'Operations',
    items: [
      'Do I need to learn a query language to use Netdata?',
      'How Netdata will help me optimize my SRE team?',
      'Where are my data stored with Netdata?',
      'Which of my data are stored at Netdata Cloud?',
      'How do I visualize cost/resource usage per environment?',
      'How do I configure email notifications?',
      'Why is my agent not connecting to Netdata Cloud?'
    ]
  },
  {
    key: 'ai',
    title: 'AI & Machine Learning',
    items: [
      'How does anomaly detection work in Netdata?',
      'Can I chat with Netdata with Claude Code or Gemini?',
      'What is AI Insights and how it can help me?',
      'Can Netdata identify the root cause of an issue for me?',
      'How can I use Metric Correlations?'
    ]
  },
  {
    key: 'dashboards',
    title: 'Dashboards',
    items: [
      'How can I slice and dice any dataset with Netdata?',
      'How can I correlate a spike or a dive across my infrastructure?',
      'How can I create and edit custom dashboards, do I need to learn a query language?',
      'Can I use Netdata to search systemd journals or windows event logs?',
      'Does Netdata provide any fallback to access dashboards without internet access?',
      'What is the relationship between Spaces, Rooms, and dashboards?',
      'How do I share a dashboard view with a teammate?'
    ]
  },
  {
    key: 'alerts',
    title: 'Alerts',
    items: [
      'How do I configure alerts in Netdata?',
      'What are the best practices for setting alert thresholds?',
      'How can I integrate Netdata alerts with PagerDuty or Slack?',
      'How do I reduce alert noise and prevent alert fatigue?',
      'What alerts should I configure for MySQL monitoring?'
    ]
  }
];

// =============================
// Layout and Behavior Constants
// =============================
// Tweak these to adjust positioning and packing rules.
export const ASK_LAYOUT = {
  TOP_PERCENT: 0.35,            // percentage of viewport height above the grid anchor
  TOP_OFFSET_PX: 80,            // extra pixels below the title/input to the grid
  BOTTOM_MARGIN_PX: 24,         // breathing room at the bottom of the viewport
  SIDE_GUTTERS_PX: 8,           // combined side paddings (approx 4px each side)
  GRID_GAP_PX: 12,              // gap between cards in the grid - match render gap
  ROW_GAP_PX: 20,               // vertical gap between grid rows (for measurement)
  MIN_CARD_WIDTH_PX: 100,       // lower minimum to allow wider cards
  MAX_COLUMNS: 6,               // cap for columns on very wide screens
  MAX_ITEMS_PER_CATEGORY: 6,    // richest per-category sentences for first row
  MIN_ITEMS_PER_CATEGORY: 1,    // never show fewer than this per category
  MIN_VISIBLE_CATEGORIES: 3,    // preference for number of categories when trimming
  // Additional rows behavior:
  // 'auto' = if MIN_ITEMS_PER_CATEGORY <= 1 prefer small cards (asc), else prefer more items (desc)
  // 'asc'  = prefer smaller N first on rows after the first (more categories feel)
  // 'desc' = prefer larger N first on rows after the first (more sentences per category)
  ADDITIONAL_ROWS_ORDER: 'asc',
  // Optional cap for N on additional rows (e.g., set to 2 to force tiny cards on later rows)
  ADDITIONAL_ROWS_MAX_ITEMS: null
};

// =============================
// Placeholder pool (rotate on refresh)
// =============================
// Edit this array to add/remove placeholder sentences shown below the title.
export const PLACEHOLDER_POOL = [
  'Go on, it does not bite',
  'Come on, spill the beans',
  'Fire away'
];





// API configuration
// Automatically detect environment and use appropriate API
const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:30002/api';
  
  const hostname = window.location.hostname;
  
  // Local development - use the real Ask Netdata API running locally
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:30002/api';  // Real Ask Netdata API on port 30002
  }
  
  // Production
  return 'https://agent-events.netdata.cloud/ask-netdata/api';
};

const apiUrl = getApiUrl();

// Smart link component that handles internal vs external links
const SmartLink = ({ href, children, ...props }) => {
  const history = useHistory();
  
  // Check if this is an internal documentation link
  const isInternalLink = href && (
    href.startsWith('https://learn.netdata.cloud/docs/') ||
    href.startsWith('http://learn.netdata.cloud/docs/') ||
    href.startsWith('/docs/')
  );
  
  if (isInternalLink) {
    // Convert full URL to relative path for Docusaurus
    let internalPath = href;
    if (href.includes('learn.netdata.cloud/docs/')) {
      internalPath = href.substring(href.indexOf('/docs/'));
    }
    
    // Handle click to use Docusaurus router
    const handleClick = (e) => {
      e.preventDefault();
      history.push(internalPath);
    };
    
    return (
      <Link to={internalPath} onClick={handleClick} {...props}>
        {children}
      </Link>
    );
  } else {
    // External links open in a new tab
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
};

  // Custom paragraph component that prevents wrapping code blocks
  const ParagraphWrapper = ({ children }) => {
    // Check if children contains block-level content (which would be invalid HTML inside <p>)
    const hasBlockLevelContent = React.Children.toArray(children).some(child => {
      if (!React.isValidElement(child)) return false;
      
      // Check for CodeBlock component directly
      if (child.type === CodeBlock) return true;
      
      // Check for CodeBlockWrapper (our custom wrapper)
      if (child.type === CodeBlockWrapper) return true;
      
      // Check if it's a code element that's not inline
      if (child.type === 'code' && child.props && !child.props.inline) return true;
      
      // Check for any element with codeBlock-related classes
      if (child.props && child.props.className) {
        const className = String(child.props.className);
        if (className.includes('codeBlock') || className.includes('language-')) return true;
      }
      
      // Check for pre tags
      if (child.type === 'pre') return true;
      
      return false;
    });
    
    if (hasBlockLevelContent) {
      // Return children without paragraph wrapper
      return <>{children}</>;
    }
    
    // Normal paragraph
    return <p>{children}</p>;
  };

  // Markdown renderer pieces used inside chat messages
  const CodeBlockWrapper = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const content = Array.isArray(children) ? children.join('') : (children || '');
    if (!inline) {
      if (match) {
        const language = match[1];
        return (
          <CodeBlock language={language}>
            {String(content).replace(/\n$/, '')}
          </CodeBlock>
        );
      }
      return (
        <CodeBlock>
          {String(content).replace(/\n$/, '')}
        </CodeBlock>
      );
    }
    return <MDXCode {...props}>{children}</MDXCode>;
  };

  const MessageContent = ({ content }) => (
    <div className="theme-doc-markdown markdown" style={{ 
      maxWidth: '100%',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'auto',
      overflowY: 'visible'
    }}>
      <style>{`
        .theme-doc-markdown {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .theme-doc-markdown > * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .theme-doc-markdown pre {
          max-width: 100% !important;
          overflow-x: auto !important;
          box-sizing: border-box !important;
        }
        .theme-doc-markdown .codeBlockContainer_Ckt0,
        .theme-doc-markdown .theme-code-block,
        .theme-doc-markdown div[class*="codeBlock"] {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 8px rgba(0, 212, 255, 0.6), 0 0 16px rgba(0, 212, 255, 0.4), 0 0 24px rgba(0, 171, 68, 0.36); }
          50% { box-shadow: 0 0 18px rgba(0, 212, 255, 0.95), 0 0 36px rgba(0, 212, 255, 0.7), 0 0 48px rgba(0, 171, 68, 0.6); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes scanBackForth {
          0% { transform: translateX(-100px); }
          50% { transform: translateX(300px); }
          100% { transform: translateX(-100px); }
        }
      `}</style>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ParagraphWrapper,
          code: CodeBlockWrapper,
          a: SmartLink,
          h1: 'h3',
          h2: 'h4', 
          h3: 'h5',
          h4: 'h6',
          h5: 'h6',
          h6: 'h6'
        }}>
        {content}
      </ReactMarkdown>
    </div>
  );

// Configuration: Number of conversation pairs (user + assistant messages) to send as context
const MAX_CONVERSATION_PAIRS = 3;

export default function AskNetdata() {
  // Initialize state from sessionStorage if available
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('askNetdataMessages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = sessionStorage.getItem('askNetdataMessages');
      return !savedMessages || JSON.parse(savedMessages).length === 0;
    }
    return true;
  });
  const [isInputFocused, setIsInputFocused] = useState(false);
  // Hover state for the send button so we can animate between dim and full green
  const [isSendHovered, setIsSendHovered] = useState(false);
  // Ref to pause placeholder cycling while hovering the send button
  const sendHoverRef = useRef(false);
  // Track which messages have animated in (by id)
  const [appearedMessages, setAppearedMessages] = useState(() => new Set());
  const appearTimeouts = useRef([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  // Transient flag toggled when a new placeholder rotates in
  const [placeholderPulse, setPlaceholderPulse] = useState(false);
  const [isPlaceholderAnimating, setIsPlaceholderAnimating] = useState(false);
  // Randomized subtitle under the main title (rotates on refresh)
  const [titleSubtitle] = useState(() => {
    try {
      if (Array.isArray(PLACEHOLDER_POOL) && PLACEHOLDER_POOL.length > 0) {
        return PLACEHOLDER_POOL[Math.floor(Math.random() * PLACEHOLDER_POOL.length)];
      }
    } catch (e) {
      // ignore
    }
    return 'Get instant answers about monitoring, troubleshooting, and optimizing your infrastructure';
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageRefs = useRef({});
  const chatAreaRef = useRef(null);
  const containerRef = useRef(null);
  const floatingContainerRef = useRef(null);
  const lastUserMessageId = useRef(null);
  const lastAssistantMessageId = useRef(null);
  const targetScrollPosition = useRef(null);
  const hasReachedTarget = useRef(false);
  const userHasScrolled = useRef(false);
  const textareaRef = useRef(null);
  const scrollSaveTimer = useRef(null);
  const hasRestoredScroll = useRef(false);
  const suggestionBoxRef = useRef(null);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  // Expand suggestions to the full screen area (right of the sidebar) with dynamic columns
  const [contentBounds, setContentBounds] = useState(null);
  const GRID_MIN_COL_PX = 300; // desired min width per column for centering math
  const GRID_GAP_PX = 12;      // reduce gap slightly to allocate more space to cards
  const [suggestionsTopPx, setSuggestionsTopPx] = useState(null);
  const TOTAL_SECTIONS = 6; // About, Deployment, Operations, AI, Dashboards, Alerts
  const MIN_SINGLE_ROW_COL_PX = 180; // force single row even with narrow columns for max cards
  const MAX_SINGLE_ROW_COL_PX = 800; // increase to allow much wider cards for full sentences
  const H_PADDING_PX = 8; // matches padding: '0 4px' (4px each side)
  const MAX_SUGGESTIONS_WIDTH_PX = 3000; // hard cap for the suggestions container width
  const [forcedRowWidthPx, setForcedRowWidthPx] = useState(null);
  const [forcedTemplateColumns, setForcedTemplateColumns] = useState(null);
  const [generalTemplateColumns, setGeneralTemplateColumns] = useState('repeat(auto-fit, minmax(280px, 1fr))');
  const [isClearing, setIsClearing] = useState(false);
  // Docking animation state: animate the floating input into the messages area
  const [isAnimatingDock, setIsAnimatingDock] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [portalStyles, setPortalStyles] = useState(null);
  const [dockSize, setDockSize] = useState(null);
  const dockTargetRef = useRef(null); // where the input will dock inside the messages
  const inputPortalRef = useRef(null);

  // If the page is opened with a question in the URL (e.g. ?q=how+to+install),
  // trigger a search automatically. Supports `q` and `question` params.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || params.get('question');
      if (q && q.trim()) {
        setShowWelcome(false);
        // small timeout to allow component mount
        setTimeout(() => {
          handleSubmit(null, decodeURIComponent(q));
        }, 50);
      }
    } catch (e) {
      // ignore malformed URL
      // eslint-disable-next-line no-console
      console.debug('AskNetdata: invalid URL params', e);
    }
  }, []);

  // When transitioning from welcome -> messages, start dock animation
  useEffect(() => {
    if (!showWelcome) {
      // start docking animation from the floating input to the messages area
      try {
        const floating = floatingContainerRef.current?.querySelector('[data-asknet-input]');
        const messagesContainer = containerRef.current?.querySelector('[data-asknet-messages]');
        if (floating && messagesContainer) {
          const fRect = floating.getBoundingClientRect();
          const mRect = messagesContainer.getBoundingClientRect();
          // target: bottom of messages container (dock there)
          const targetX = mRect.left + 16; // small inset
          const targetY = mRect.bottom - 84; // place above bottom

          const initial = { left: fRect.left, top: fRect.top, width: fRect.width, height: fRect.height };
          // Clamp the dock width so it doesn't expand to full viewport; prefer the floating container's max (800px)
          try {
            const floatingContainerWidth = floatingContainerRef.current ? floatingContainerRef.current.offsetWidth : 800;
            const clampedWidth = Math.min(initial.width, floatingContainerWidth, 800);
            setDockSize({ width: clampedWidth, height: initial.height });
          } catch (e) {
            setDockSize({ width: Math.min(initial.width, 800), height: initial.height });
          }
          const target = { left: targetX, top: targetY, width: Math.min(fRect.width, mRect.width - 32), height: fRect.height };

          // compute translate delta
          const dx = target.left - initial.left;
          const dy = target.top - initial.top;

          setPortalStyles({
            position: 'absolute',
            left: `${initial.left}px`,
            top: `${initial.top}px`,
            width: `${initial.width}px`,
            height: `${initial.height}px`,
            transform: 'translate(0px, 0px) scale(1)',
            transition: 'transform 360ms cubic-bezier(0.2,0,0,1), left 0ms, top 0ms',
            zIndex: 1002
          });

          // trigger next tick to animate to target
          requestAnimationFrame(() => {
            setIsAnimatingDock(true);
            setPortalStyles(prev => ({
              ...prev,
              transform: `translate(${dx}px, ${dy}px) scale(0.98)`,
              transition: 'transform 360ms cubic-bezier(0.2,0,0,1)'
            }));
          });

          // after animation, set docked and remove portalStyles so the real input renders in-place
          setTimeout(() => {
            setIsAnimatingDock(false);
            setIsDocked(true);
            setPortalStyles(null);
          }, 380);
        } else {
          // fallback: just dock without animation
          setIsDocked(true);
        }
      } catch (e) {
        setIsDocked(true);
      }
    } else {
      // showWelcome true -> undock
      setIsDocked(false);
      setIsAnimatingDock(false);
      setPortalStyles(null);
    }
  }, [showWelcome]);
  useEffect(() => {
    const updateBounds = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const left = Math.max(0, Math.round(rect.left));
      const width = Math.max(0, Math.round(window.innerWidth - left)); // use full window width from sidebar edge
      setContentBounds({ left, width });

    // Default, fixed-width tracks so rows center nicely and cards stay readable
    // Try to fit 6 columns by slightly shrinking cards, but not below a readable minimum
  const MIN_CARD_TRACK = 180; // much smaller minimum to fit maximum cards per row
  const MAX_CARD_TRACK = 800; // significantly increase max width to fit full sentences
      const innerWidth = Math.max(0, window.innerWidth - left - H_PADDING_PX); // use full window width minus sidebar
      const trackForSix = Math.floor((innerWidth - (TOTAL_SECTIONS - 1) * GRID_GAP_PX) / TOTAL_SECTIONS);
      // Use a min smaller than the exact six-fit track so 1fr has room to expand
      const LEEWAY = 8; // minimal leeway to allow maximum card expansion
      const chosenMin = (trackForSix >= MIN_CARD_TRACK)
        ? Math.min(Math.max(MIN_CARD_TRACK, trackForSix - LEEWAY), MAX_CARD_TRACK)
        : MIN_CARD_TRACK;
  // Let columns grow to fill available space while maintaining a readable minimum
  setGeneralTemplateColumns('repeat(auto-fit, minmax(280px, 1fr))');

      // Compute if we can fit all sections on one centered row
      const available = Math.max(0, window.innerWidth - left - H_PADDING_PX); // use full window width
      const rawCol = Math.floor((available - (TOTAL_SECTIONS - 1) * GRID_GAP_PX) / TOTAL_SECTIONS);
  if (rawCol >= MIN_SINGLE_ROW_COL_PX) {
  const colPx = Math.min(rawCol, MAX_SINGLE_ROW_COL_PX);
        const rowWidth = colPx * TOTAL_SECTIONS + (TOTAL_SECTIONS - 1) * GRID_GAP_PX;
        setForcedRowWidthPx(rowWidth);
  // Use fractional columns so tracks stretch to consume side space
  setForcedTemplateColumns(null); // Always use responsive grid, not forced columns
      } else {
        setForcedRowWidthPx(null);
        setForcedTemplateColumns(null);
      }
    };
    updateBounds();
    const id = setTimeout(updateBounds, 60);
    window.addEventListener('resize', updateBounds);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', updateBounds);
    };
  }, []);

  // Measure and anchor suggestions below the floating chat container to avoid overlap on zoom/resize
  useEffect(() => {
    const updateTop = () => {
      if (!floatingContainerRef.current || !containerRef.current) return;
      const fRect = floatingContainerRef.current.getBoundingClientRect();
      const cRect = containerRef.current.getBoundingClientRect();
      const top = Math.max(0, Math.round(fRect.bottom - cRect.top + 12));
      setSuggestionsTopPx(top);
    };
    updateTop();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateTop) : null;
    if (ro && floatingContainerRef.current) ro.observe(floatingContainerRef.current);
    window.addEventListener('resize', updateTop);
    return () => {
      window.removeEventListener('resize', updateTop);
      if (ro && floatingContainerRef.current) ro.disconnect();
    };
  }, []);

  // Emoji for category headings
  const categoryEmoji = useMemo(() => ({
    about: '✨',
    deployment: '🚀',
    operations: '⚙️',
    ai: '🤖',
    dashboards: '📊',
    alerts: '🔔'
  }), []);

  // Keep track of original overflow styles so we can restore them
  const originalOverflow = useRef({ html: '', body: '' });

  // Disable page scroll while the welcome view is visible or while waiting for an answer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const shouldLock = showWelcome || isLoading;

    const html = document.documentElement;
    const body = document.body;

    if (shouldLock) {
      // Save existing values the first time
      if (originalOverflow.current.html === '') originalOverflow.current.html = html.style.overflow || '';
      if (originalOverflow.current.body === '') originalOverflow.current.body = body.style.overflow || '';

      // Prevent scrolling
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    } else {
      // Restore previous values
      try {
        html.style.overflow = originalOverflow.current.html || '';
        body.style.overflow = originalOverflow.current.body || '';
      } catch (err) {
        // ignore
      }
      // Clear saved values so future mounts can capture fresh originals
      originalOverflow.current = { html: '', body: '' };
    }

    // Cleanup on unmount: restore whatever we saved
    return () => {
      try {
        document.documentElement.style.overflow = originalOverflow.current.html || '';
        document.body.style.overflow = originalOverflow.current.body || '';
      } catch (err) {}
    };
  }, [showWelcome, isLoading]);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('askNetdataMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Save scroll position to sessionStorage with debouncing
  const saveScrollPosition = () => {
    if (typeof window !== 'undefined') {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      sessionStorage.setItem('askNetdataScrollPosition', scrollPosition.toString());
    }
  };

  // Restore scroll position on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasRestoredScroll.current) {
      const savedPosition = sessionStorage.getItem('askNetdataScrollPosition');
      if (savedPosition && messages.length > 0) {
        // Wait for content to render before scrolling
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition),
            behavior: 'instant'
          });
          hasRestoredScroll.current = true;
        }, 100);
      }
    }
  }, [messages.length]); // Only run when messages are loaded

  // Set up scroll listener with debouncing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      // Clear existing timer
      if (scrollSaveTimer.current) {
        clearTimeout(scrollSaveTimer.current);
      }
      // Save scroll position after 500ms of no scrolling
      scrollSaveTimer.current = setTimeout(saveScrollPosition, 500);
    };

    // Save scroll position on page unload
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (scrollSaveTimer.current) {
        clearTimeout(scrollSaveTimer.current);
      }
    };
  }, []);

  // Session-only history - no localStorage persistence

  // Remove old auto-scroll mechanism - we'll handle scrolling explicitly
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const wrapper = textarea.parentElement;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200; // Max height for the textarea

    const newTextareaHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newTextareaHeight}px`;

    // Adjust the wrapper's height to contain the textarea, with a minimum height
    if (wrapper) {
      const newWrapperHeight = Math.max(44, newTextareaHeight);
      wrapper.style.height = `${newWrapperHeight}px`;
    }

    // Toggle the .is-scrollable class so our CSS shows the scrollbar only when needed
    try {
      // If the scrollHeight is larger than the visible clientHeight, content overflows
      const canScroll = textarea.scrollHeight > textarea.clientHeight + 1;
      if (canScroll) {
        textarea.classList.add('is-scrollable');
      } else {
        textarea.classList.remove('is-scrollable');
      }
    } catch (err) {
      // Defensive: ignore if classList isn't available for any reason
    }
  };

  // Prevent page from scrolling when the user scrolls inside the textarea
  const handleTextareaWheel = (e) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const delta = e.deltaY;
    const atTop = ta.scrollTop === 0;
    const atBottom = ta.scrollHeight - ta.clientHeight - ta.scrollTop <= 1;

    // If textarea can scroll in the direction of the wheel, stop propagation
    if ((delta < 0 && !atTop) || (delta > 0 && !atBottom)) {
      e.stopPropagation();
      // Let the textarea handle the scroll
    }
    // Otherwise allow the page to scroll
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Hide footer and other documentation elements
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hideElements = () => {
        // Target specific footer and documentation elements
        const footer = document.querySelector('footer');
        const editPage = document.querySelector('[class*="editThisPage"]');
        const pagination = document.querySelector('[class*="pagination"]');
        const lastUpdated = document.querySelector('[class*="lastUpdated"]');
        const breadcrumbs = document.querySelector('nav[class*="breadcrumbs"]');
        const tocMobile = document.querySelector('[class*="tocMobile"]');
        
        // Find all elements containing the specific feedback/copyright text
        const allElements = document.querySelectorAll('*');
        const elementsToHide = [];
        
        allElements.forEach(el => {
          if (el.textContent) {
            const text = el.textContent.trim();
            // Look for exact matches or very specific patterns
            if (
              text.includes('Do you have any feedback for this page?') ||
              text.includes('Copyright © 2025 Netdata, Inc.') ||
              (text.includes('open a new issue') && text.includes('netdata/learn')) ||
              text === 'Copyright © 2025 Netdata, Inc.'
            ) {
              // Make sure we're not hiding our own component
              const isInAskNetdata = el.closest('[style*="containerStyle"]') || 
                                   el.closest('[class*="askNetdata"]') ||
                                   el.textContent.includes('Ask Netdata Docs');
              
              if (!isInAskNetdata) {
                elementsToHide.push(el);
                // Also hide parent elements that might contain only this text
                let parent = el.parentElement;
                while (parent && parent !== document.body) {
                  const parentText = parent.textContent.trim();
                  if (parentText === text || parentText.length < text.length + 50) {
                    elementsToHide.push(parent);
                  }
                  parent = parent.parentElement;
                }
              }
            }
          }
        });
        
        // Combine all elements to hide
        const allElementsToHide = [
          footer, 
          editPage, 
          pagination, 
          lastUpdated, 
          breadcrumbs, 
          tocMobile,
          ...elementsToHide
        ].filter(Boolean);
        
        // Remove duplicates
        const uniqueElementsToHide = [...new Set(allElementsToHide)];
        
        // Hide elements permanently
        uniqueElementsToHide.forEach(el => {
          if (el && el.style.display !== 'none') {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.height = '0';
            el.style.maxHeight = '0';
            el.style.overflow = 'hidden';
            el.style.margin = '0';
            el.style.padding = '0';
            el.setAttribute('data-hidden-by-asknetdata', 'true');
          }
        });
      };

      // Run multiple times to catch all elements
      hideElements();
      const timeoutId1 = setTimeout(hideElements, 100);
      const timeoutId2 = setTimeout(hideElements, 500);
      const timeoutId3 = setTimeout(hideElements, 1000);
      
      // Set up a MutationObserver to watch for new elements being added
      const observer = new MutationObserver(() => {
        hideElements();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      // Also set up an interval to periodically check
      const intervalId = setInterval(hideElements, 2000);
      
      // Cleanup function
      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        clearTimeout(timeoutId3);
        clearInterval(intervalId);
        observer.disconnect();
      };
    }
  }, []);

  // Build groups from the top-level constant. Keep per-session item order stable.
  const groups = useMemo(() => SUGGESTION_GROUPS, []);

  const [visibleCategories, setVisibleCategories] = useState([]);
  const categoriesOrderRef = useRef(null);
  const categoryItemOrderRef = useRef({});
  const fitPassRef = useRef(0);
  const MAX_FIT_PASSES = 12;
  if (!categoriesOrderRef.current && groups.length) {
    // Persist a random order for this session
    const order = [...groups].sort(() => Math.random() - 0.5);
    categoriesOrderRef.current = order;
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const getViewport = () => {
      const vv = window.visualViewport;
      return {
        width: vv?.width || window.innerWidth,
        height: vv?.height || window.innerHeight
      };
    };

    let rafId = null;
    const computeLayout = () => {

      const allCategories = (categoriesOrderRef.current || groups).map(group => {
        // Randomize items if not already done
        if (!categoryItemOrderRef.current[group.key]) {
          categoryItemOrderRef.current[group.key] = [...(group.items || [])].sort(() => Math.random() - 0.5);
        }
        return {
          ...group,
          items: categoryItemOrderRef.current[group.key]
        };
      });

      // Calculate available vertical space
      const viewportHeight = window.innerHeight;
      const suggestionsTop = suggestionsTopPx != null ? 
        suggestionsTopPx : 
        (ASK_LAYOUT.TOP_PERCENT * viewportHeight + ASK_LAYOUT.TOP_OFFSET_PX);
      const availableHeight = viewportHeight - suggestionsTop - 40; // 40px buffer at bottom
      
      // Estimate heights (approximate values based on typical card dimensions)
      const categoryTitleHeight = 40; // Height of category title
      const suggestionItemHeight = 60; // Height of each suggestion item
      const rowGap = 20; // Gap between categories
      const betweenRowGap = 24; // Gap between first and second row
      
      const layout = [];
      
      // FIRST ROW: Calculate how many suggestions can fit per category
      const firstRowCategories = allCategories.slice(0, 4); // Take first 4 categories
      
      // Calculate maximum suggestions that can fit in first row
      const maxFirstRowHeight = availableHeight * 0.7; // Use 70% of space for first row
      const maxSuggestionsFirstRow = Math.floor((maxFirstRowHeight - categoryTitleHeight) / suggestionItemHeight);
  const suggestionsPerFirstRowCategory = Math.max(1, Math.min(ASK_LAYOUT.MAX_ITEMS_PER_CATEGORY, maxSuggestionsFirstRow));
      
      firstRowCategories.forEach(cat => {
        if (cat.items.length > 0) {
          layout.push({
            key: cat.key,
            title: cat.title,
            items: cat.items.slice(0, suggestionsPerFirstRowCategory),
            isFirstRow: true
          });
        }
      });
      
      // Calculate actual first row height
      const firstRowHeight = categoryTitleHeight + (suggestionsPerFirstRowCategory * suggestionItemHeight);
      

      
      // Collect remaining suggestions for placeholder rotation
      const remainingSuggestions = [];
      allCategories.forEach(cat => {
        const usedInLayout = layout.find(l => l.key === cat.key);
        const usedCount = usedInLayout ? usedInLayout.items.length : 0;
        const remaining = cat.items.slice(usedCount);
        remainingSuggestions.push(...remaining);
      });

      setVisibleCategories(layout);
      fitPassRef.current = 0; // reset guard
    };

    computeLayout();
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(computeLayout);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onResize);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onResize);
      }
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [groups.length]);

  // Disable complex height fitting - let CSS Grid handle the layout naturally
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showWelcome) return; // only applies to welcome grid
    
    // Simple check - no more complex height calculations or category removal
    if (!visibleCategories || visibleCategories.length === 0) return;
    
    // Reset the fit pass counter since we're not using complex fitting anymore
    fitPassRef.current = 0;
  }, [visibleCategories, showWelcome]);

  // Use remaining suggestions for placeholder rotation
  const placeholderQuestions = useMemo(() => {
    // Get remaining suggestions that aren't displayed in cards
    const remainingSuggestions = [];
    groups.forEach(group => {
      if (categoryItemOrderRef.current[group.key]) {
  const remaining = categoryItemOrderRef.current[group.key].slice(ASK_LAYOUT.MAX_ITEMS_PER_CATEGORY);
        remainingSuggestions.push(...remaining);
      }
    });
    return remainingSuggestions.length > 0 ? remainingSuggestions : groups.flatMap(g => g.items || []);
  }, [groups, visibleCategories]);

  // Placeholder rotation effect
  useEffect(() => {
  if (placeholderQuestions.length === 0) return;
  // Don't rotate placeholders when the input is docked in the answer view
  if (isDocked || isAnimatingDock) return;
  // Only rotate placeholders while on the welcome screen
  if (!showWelcome) return;
    
    // Set initial placeholder
    setCurrentPlaceholder(placeholderQuestions[0]);
    
    const interval = setInterval(() => {
  // If paused (user hovering send button), skip rotation
  if (sendHoverRef.current) return;

      // Start fade out animation
      setIsPlaceholderAnimating(true);
      
      // After fade out, change text and fade in
      setTimeout(() => {
        setCurrentPlaceholder(prev => {
          const currentIndex = placeholderQuestions.indexOf(prev);
          const nextIndex = (currentIndex + 1) % placeholderQuestions.length;
          const next = placeholderQuestions[nextIndex];
          // Trigger a brief pulse to indicate the new placeholder is sendable
          setPlaceholderPulse(true);
          // Clear pulse after animation duration (match CSS animation length)
          setTimeout(() => setPlaceholderPulse(false), 900);
          return next;
        });
        setIsPlaceholderAnimating(false);
      }, 200); // Half animation duration
      
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [placeholderQuestions]);

  const handleSubmit = async (e, overrideMessage = null) => {
    e?.preventDefault();
    const message = overrideMessage || input.trim();
    if (!message || isLoading) return;

    setShowWelcome(false);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('q', message);
      window.history.replaceState({}, '', url.toString());
    } catch (err) {
      // ignore
    }

    const userMessageId = Date.now();
    const userMessage = {
      id: userMessageId,
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    lastUserMessageId.current = userMessageId;
    
    // Calculate target scroll position once (user question at top)
    setTimeout(() => {
      if (messageRefs.current[userMessageId]) {
        const messageElement = messageRefs.current[userMessageId];
        const rect = messageElement.getBoundingClientRect();
        const navbarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ifm-navbar-height')) || 60;
        targetScrollPosition.current = window.pageYOffset + rect.top - navbarHeight - 20; // 20px padding
        hasReachedTarget.current = false;
        userHasScrolled.current = false;
        
        // Initial scroll attempt
        attemptScroll();
      }
    }, 100);
    
    // Function to attempt scrolling to target
    const attemptScroll = () => {
      if (targetScrollPosition.current === null || hasReachedTarget.current || userHasScrolled.current) {
        return;
      }
      
      const currentScroll = window.pageYOffset;
      
      // Check if we can reach the target now
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const canReachTarget = targetScrollPosition.current <= maxScroll;
      
      if (canReachTarget) {
        // Check if already at or past target
        if (currentScroll >= targetScrollPosition.current - 5) { // 5px tolerance
          hasReachedTarget.current = true;
          return;
        }
        
        // Scroll to target
        window.scrollTo({
          top: targetScrollPosition.current,
          behavior: 'smooth'
        });
        hasReachedTarget.current = true;
      } else {
        // Can't reach target yet, scroll to bottom
        window.scrollTo({
          top: maxScroll,
          behavior: 'smooth'
        });
      }
    };
    
    // Detect user manual scrolling
    const handleUserScroll = () => {
      if (hasReachedTarget.current && targetScrollPosition.current !== null) {
        const currentScroll = window.pageYOffset;
        // If user scrolled up past the target, stop auto-scrolling
        if (currentScroll < targetScrollPosition.current - 50) { // 50px threshold
          userHasScrolled.current = true;
        }
      }
    };
    
    window.addEventListener('wheel', handleUserScroll);
    window.addEventListener('touchmove', handleUserScroll);

    try {
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...(() => {
              // Get only the last N conversation pairs (2 messages per pair: user + assistant)
              const messagesToSend = [];
              const maxMessages = MAX_CONVERSATION_PAIRS * 2;
              
              // Take only the last N pairs of messages
              const recentMessages = messages.slice(-maxMessages);
              
              // Convert to API format
              return recentMessages.map(m => ({
                role: m.type === 'user' ? 'user' : 'assistant',
                content: m.content
              }));
            })(),
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantMessageId = Date.now() + 1;
      let assistantMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        citations: [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      lastAssistantMessageId.current = assistantMessageId;
      
      // Initial scroll attempt when response starts
      setTimeout(() => {
        attemptScroll();
      }, 100);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'error') {
                // Handle error response from server
                assistantMessage.content = data.error || 'An error occurred while processing your request.';
                assistantMessage.isError = true;
                assistantMessage.errorInfo = data.info || '';
                setMessages(prev => 
                  prev.map(m => m.id === assistantMessageId 
                    ? { 
                        ...m, 
                        content: assistantMessage.content,
                        isError: true,
                        errorInfo: assistantMessage.errorInfo
                      }
                    : m
                  )
                );
                // Stop processing further messages after an error
                window.removeEventListener('wheel', handleUserScroll);
                window.removeEventListener('touchmove', handleUserScroll);
                return;
              } else if (data.type === 'token') {
                assistantMessage.content += data.content;
                setMessages(prev => 
                  prev.map(m => m.id === assistantMessageId 
                    ? { ...m, content: assistantMessage.content }
                    : m
                  )
                );
                
                // Continue attempting to scroll during streaming
                attemptScroll();
              } else if (data.type === 'citations') {
                assistantMessage.citations = data.citations;
                setMessages(prev => 
                  prev.map(m => m.id === assistantMessage.id 
                    ? { ...m, citations: data.citations }
                    : m
                  )
                );
              } else if (data.type === 'done') {
                // Check if answer is empty or only whitespace
                if (!assistantMessage.content.trim() && !assistantMessage.isError) {
                  assistantMessage.content = 'I received an empty response. This might be due to high server load. Please try again in a moment.';
                  assistantMessage.isError = true;
                  setMessages(prev => 
                    prev.map(m => m.id === assistantMessageId 
                      ? { ...m, content: assistantMessage.content, isError: true }
                      : m
                    )
                  );
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        isError: true,
        timestamp: new Date()
      }]);
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    } finally {
      setIsLoading(false);
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
    handleSubmit(null, question);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim()) {
        handleSubmit(null, currentPlaceholder || '');
      } else {
        handleSubmit();
      }
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setShowWelcome(true);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('askNetdataMessages');
      sessionStorage.removeItem('askNetdataScrollPosition');
      // Reset scroll position flags
      hasRestoredScroll.current = false;
      try {
        // Remove query params `q` or `question` without adding a history entry
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        url.searchParams.delete('question');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        // ignore malformed URL or environment without history
      }
    }
  };

  // Trigger a short fade/scale animation, then clear history and reset
  const handleNewChat = () => {
    if (isClearing) return; // guard double clicks
    setIsClearing(true);
    // Animation duration should match the CSS transitions below (300ms)
    setTimeout(() => {
      clearHistory();
      setIsClearing(false);
    }, 320);
  };

  // Markdown renderer is now defined outside the component

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    minHeight: 'calc(100vh - var(--ifm-navbar-height))', // Full viewport height minus navbar
    background: 'transparent',
    position: 'relative',
    margin: '0', // Remove negative margins
    padding: '0' // Remove all padding to eliminate sidebar gap
  };

  const chatAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  maxWidth: '800px', // Consistent max-width
  transition: 'max-width 520ms cubic-bezier(0.2, 0, 0, 1), padding 420ms ease',
  willChange: 'max-width'
  };

  // When showing messages (welcome hidden), allow the chat area to expand
  // and use the full available width; keep the compact maxWidth for the welcome view.
  const computedChatAreaStyle = {
  ...chatAreaStyle,
  // Make the chat area full-width even on the welcome screen so suggestions can span the screen
  maxWidth: '100%'
  };

  const welcomeStyle = {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto 24px auto',
    padding: '0 20px',
    textAlign: 'center',
    flexShrink: 0
  };

  const floatingContainerStyle = {
  position: 'absolute',
  left: '50%',
  top: '25%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '800px',
  margin: '0',
  pointerEvents: 'auto'
  };

  const welcomeTitleStyle = {
  color: 'var(--asknet-green)',
    marginBottom: '8px',
    lineHeight: '1',
    whiteSpace: 'nowrap'
  };

  const messagesContainerStyle = {
    width: '100%',
    margin: '0 auto',
    padding: '10px 20px'
  };

  // Messages content should fade in after the container expands
  const computedMessagesContainerStyle = {
    ...messagesContainerStyle,
  opacity: isClearing ? 0 : (showWelcome ? 0 : 1),
  transition: isClearing ? 'opacity 320ms ease, transform 320ms ease' : 'opacity 520ms ease 260ms', // shorter when clearing
  transform: isClearing ? 'scale(0.985) translateY(-6px)' : 'none',
  willChange: isClearing ? 'opacity, transform' : 'opacity',
  pointerEvents: isClearing ? 'none' : undefined
  };

  const messageStyle = {
    marginBottom: '32px'
  };

  const avatarStyle = (type) => ({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0,
    fontSize: '18px',
    background: type === 'user' 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, var(--asknet-green) 0%, #00d46a 100%)',
    color: 'white'
  });

  const inputContainerStyle = {
    background: isDarkMode ? 'var(--ifm-background-surface-color)' : 'white',
    border: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
    padding: '8px 12px',
    borderRadius: '50px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    width: '100%'
  };

  // Animate the input pill separately: scale and fade subtly when the layout expands
  const computedInputContainerStyle = {
    ...inputContainerStyle,
    transition: 'transform 520ms cubic-bezier(0.2, 0, 0, 1), opacity 320ms ease, box-shadow 260ms ease',
    transform: showWelcome ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
    opacity: showWelcome ? 1 : 0.98,
    // Add a green outline ring when the textarea is focused without affecting layout
    boxShadow: isInputFocused
      ? `${inputContainerStyle.boxShadow}, 0 0 0 4px rgba(var(--asknet-green-rgb), 0.18), 0 0 18px rgba(var(--asknet-green-rgb), 0.12)`
      : inputContainerStyle.boxShadow,
    willChange: 'transform, opacity, box-shadow'
  };

  const inputFormStyle = {
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  };

  const chatInputStyle = {
    position: 'absolute',
    top: '50%',
    left: '16px',
    right: '50px',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: 'calc(100% - 20px)',
    backgroundColor: 'transparent',
    border: 'none',
    color: isDarkMode ? 'var(--ifm-font-color-base)' : '#1f2937',
    fontSize: '16px',
    fontFamily: 'inherit',
    lineHeight: '1.4',
    padding: 0,
    resize: 'none',
    outline: 'none',
    height: 'auto', // Let height be determined by content
    maxHeight: '100px', // Match original maxHeight
  };

  const inputWrapperStyle = {
    position: 'relative',
    flex: 1
  };

  const animatedPlaceholderStyle = {
    position: 'absolute',
    top: '50%',
    left: '16px',
    right: '50px',
    fontSize: '16px',
  // Default placeholder color; keep green when hovered only
  color: (isSendHovered && !input.trim()) ? 'var(--asknet-green)' : (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
    fontFamily: 'inherit',
    pointerEvents: 'none',
  // Slightly gentler color transition
  transition: 'all 0.4s ease, color 360ms ease',
    transform: isPlaceholderAnimating ? 'translateY(calc(-50% - 5px))' : 'translateY(-50%)',
    opacity: isPlaceholderAnimating ? 0 : (input ? 0 : 1),
    zIndex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.4',
    display: 'flex',
    alignItems: 'center'
  };

  const sendButtonStyle = {
    background: 'var(--asknet-green)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isLoading ? 0.5 : 1,
  transition: 'background 0.2s, box-shadow 260ms',
  boxShadow: isDarkMode ? '0 2px 10px rgba(0,0,0,0.6)' : '0 4px 18px rgba(var(--asknet-green-rgb), 0.28)',
    flexShrink: 0
  };


  // Dimmed background color (solid) for light/dark modes
  // More prominent dimmed background so the inactive button reads as interactive
  const dimmedBg = isDarkMode ? 'rgba(var(--asknet-green-rgb), 0.42)' : 'rgba(var(--asknet-green-rgb), 0.28)';
  const computedSendButtonStyle = {
    ...sendButtonStyle,
  background: input.trim() ? 'var(--asknet-green)' : dimmedBg,
  // On hover, always show full green background (unless disabled)
  ...(isSendHovered && !isLoading ? { background: 'var(--asknet-green)' } : {}),
  };

  // When messages array changes, animate them in with a small stagger
  useEffect(() => {
    // Clear any pending timeouts
    appearTimeouts.current.forEach(id => clearTimeout(id));
    appearTimeouts.current = [];

    const newIds = messages.map(m => m.id);
    const newSet = new Set();
    let delay = 0;
    newIds.forEach(id => {
      const t = setTimeout(() => {
        setAppearedMessages(prev => {
          const copy = new Set(prev);
          copy.add(id);
          return copy;
        });
      }, delay);
      appearTimeouts.current.push(t);
      delay += 90; // stagger gap
    });

    return () => {
      appearTimeouts.current.forEach(id => clearTimeout(id));
      appearTimeouts.current = [];
    };
  }, [messages]);

  // Shared renderer for the input form so floating and docked views are identical
  const renderInputForm = ({ attachRef = false, placeholderOverride = null } = {}) => {
    const placeholderText = placeholderOverride !== null ? placeholderOverride : (currentPlaceholder || "Ask anything about Netdata, in any language... (Shift+Enter for new line)");
    const placeholderStyle = placeholderOverride !== null
      ? { ...animatedPlaceholderStyle, color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }
      : animatedPlaceholderStyle;

    return (
      <div style={computedInputContainerStyle}>
        <form onSubmit={handleSubmit} style={inputFormStyle} data-asknet-input>
          <div style={{ ...inputWrapperStyle, overflow: 'visible' }}>
            <div style={placeholderStyle}>{placeholderText}</div>
            <textarea
              className="asknetdata-textarea"
              ref={(el) => {
                if (attachRef) {
                  inputRef.current = el;
                  textareaRef.current = el;
                }
              }}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustTextareaHeight(); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onWheel={handleTextareaWheel}
              placeholder=""
              style={{ ...chatInputStyle, caretColor: isSendHovered ? 'transparent' : undefined }}
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            type="button"
            className={placeholderPulse ? styles.sendPulse : ''}
            style={computedSendButtonStyle}
            disabled={isLoading}
            onMouseEnter={() => setIsSendHovered(true)}
            onMouseLeave={() => setIsSendHovered(false)}
            onClick={(e) => {
              e.preventDefault();
              if (isLoading) return;
              // If a placeholder override is provided for the docked/portal view, don't auto-submit that placeholder
              if (!input.trim()) {
                if (placeholderOverride !== null) handleSubmit(null, '');
                else handleSubmit(null, currentPlaceholder || '');
              } else {
                handleSubmit();
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
          </button>
        </form>
      </div>
    );
  };

  return (
  <div ref={containerRef} style={containerStyle}>
      <style>{`
        /* Disable native resize handle but allow internal vertical scrolling */
  .asknetdata-textarea { resize: none !important; overflow-y: auto !important; -webkit-appearance: none !important; appearance: none !important; }
  /* Hide the tiny native resize handle on WebKit/Blink */
  .asknetdata-textarea::-webkit-resizer, .asknetdata-textarea::-webkit-resize-handle { display: none !important; }
  /* By default hide the scrollbar; show it only when the textarea has .is-scrollable */
  .asknetdata-textarea:not(.is-scrollable) { scrollbar-width: none; -ms-overflow-style: none; }
  .asknetdata-textarea:not(.is-scrollable)::-webkit-scrollbar { display: none; }
  
  /* Override Docusaurus container width limits for Ask Netdata page */
  .container { max-width: none !important; }
  .docMainContainer_TBSr { max-width: none !important; }
  [class*="docMainContainer"] { max-width: none !important; }
  [class*="container"] { max-width: none !important; }
  .main-wrapper { max-width: none !important; }
      `}</style>
  <div ref={chatAreaRef} style={computedChatAreaStyle}>
        {showWelcome ? (
          <>
            {/* Corner Arrow Icon */}
            <svg style={{ display: 'none' }}>
              <defs>
                <symbol id="corner-arrow-icon" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M2.75 2a.75.75 0 0 1 .75.75v6.5h7.94l-.97-.97a.75.75 0 0 1 1.06-1.06l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H2.75A.75.75 0 0 1 2 10V2.75A.75.75 0 0 1 2.75 2Z" clipRule="evenodd"></path>
                </symbol>
              </defs>
            </svg>

            {/* Floating Title and Input Container */}
            <div ref={floatingContainerRef} style={floatingContainerStyle}>
              <div style={welcomeStyle}>
                <h2 style={welcomeTitleStyle}>
                  Ask Netdata Docs
                </h2>
                <p style={{ 
                  fontSize: '15px', 
                  color: isDarkMode ? '#787b81ff' : '#6b7280', 
                  marginBottom: '0', 
                  lineHeight: '1.3', 
                  margin: '0 auto',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  {titleSubtitle}
                </p>
              </div>
              
              {renderInputForm({ attachRef: true })}
            </div>

              {/* Categorized suggestions below the centered chatbox */}
              <div style={{
                position: 'absolute',
                // Use full available width from sidebar to screen edge
                left: '0',
                right: '0',
                top: suggestionsTopPx != null ? `${suggestionsTopPx}px` : `calc(${ASK_LAYOUT.TOP_PERCENT * 100}% + ${ASK_LAYOUT.TOP_OFFSET_PX}px)`,
                // Full width with minimal padding
                padding: '0 8px',
                margin: 0,
                boxSizing: 'border-box',
                pointerEvents: 'auto',
                zIndex: 1
              }}>
                {/* Center wrapper to align grid columns under the chatbox. When possible, force a single centered row. */}
                <div style={{
                  width: '100%',
                  margin: '0 auto'
                }}>
                  <div ref={suggestionBoxRef} style={{
                    display: 'grid',
                    gridTemplateColumns: forcedTemplateColumns || generalTemplateColumns,
                    gap: `${GRID_GAP_PX}px`,
                    marginTop: '8px',
                    justifyItems: 'stretch',
                    alignItems: 'stretch',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
      {visibleCategories.map((cat) => (
                    <div key={cat.key} style={{ 
                      padding: '8px', 
                      borderRadius: '12px', 
                      width: '100%', 
                      boxSizing: 'border-box',
                      minHeight: cat.isFirstRow ? '300px' : 'auto', // Consistent height for first row
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{categoryEmoji[cat.key] || '•'}</span> {cat.title}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px',
                        flex: cat.isFirstRow ? '1' : 'none' // Fill available space for first row cards
                      }}>
                        {cat.items.length > 0 ? (
                          cat.items.map((q, i) => (
                            <button key={i} onClick={() => handleSuggestionClick(q)}
                              style={{ textAlign: 'left', padding: '8px', borderRadius: '6px', border: '1px solid transparent', backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white', cursor: 'pointer', fontSize: '0.875rem', color: 'inherit', transition: 'all 0.2s', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--asknet-green)'; e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 171, 68, 0.08)' : '#f0fff4'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--ifm-background-color)' : 'white'; }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="14" height="14" style={{ flexShrink: 0 }}><use href="#corner-arrow-icon" /></svg>
                                <span>{q}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div style={{ 
                            padding: '8px', 
                            fontSize: '0.875rem', 
                            color: isDarkMode ? 'var(--ifm-color-content-secondary)' : '#6c757d',
                            fontStyle: 'italic',
                            textAlign: 'center'
                          }}>
                            More questions coming soon...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>

          </>
        ) : (
          <div style={computedMessagesContainerStyle}>
            {messages.length > 0 && (
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button
                  onClick={handleNewChat}
                  aria-label="Start a new chat"
                  style={{
                    background: 'transparent',
                    border: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: isDarkMode ? 'var(--ifm-color-secondary)' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.28s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'var(--ifm-background-surface-color)' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {isClearing ? 'Starting...' : 'New chat'}
                </button>
              </div>
            )}
            {messages.map((message) => {
              const hasAppeared = appearedMessages.has(message.id);
              const appearStyle = hasAppeared ? {
                opacity: 1,
                transform: 'translateY(0)',
                transition: 'opacity 420ms ease, transform 420ms ease'
              } : {
                opacity: 0,
                transform: 'translateY(8px)'
              };

              return (
              <div 
                key={message.id} 
                ref={(el) => { if (el) messageRefs.current[message.id] = el; }}
                style={{
                  ...messageStyle,
                  ...(message.isError ? {
                    backgroundColor: isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(220, 38, 38, 0.3)' : '#fecaca',
                    borderRadius: '8px',
                    padding: '16px'
                  } : {}),
                  ...appearStyle
                }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    ...avatarStyle(message.type),
                    ...(message.isError ? {
                      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                    } : {})
                  }}>
                    {message.isError ? '⚠' : (message.type === 'user' ? 'U' : 'N')}
                  </div>
                  <div style={{ 
                    flex: 1, 
                    minWidth: 0, // Critical: allows flex item to shrink below content size
                    maxWidth: '100%',
                    overflow: 'hidden', // Prevent expansion
                    lineHeight: '1.7', 
                    color: message.isError ? (isDarkMode ? '#fca5a5' : '#dc2626') : (isDarkMode ? 'var(--ifm-font-color-base)' : '#1f2937'), 
                    fontSize: '16px' 
                  }}>
                    {message.content && <MessageContent content={message.content} />}
                    {message.errorInfo && (
                      <div style={{ 
                        marginTop: '8px', 
                        fontSize: '14px', 
                        color: isDarkMode ? '#f87171' : '#b91c1c',
                        fontStyle: 'italic'
                      }}>
                        {message.errorInfo}
                      </div>
                    )}
                    {message.citations && message.citations.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: isDarkMode ? 'var(--ifm-color-secondary)' : '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                          Learn more:
                        </div>
                        {message.citations.map((citation, idx) => {
                          const isInternalLink = citation.url && (
                            citation.url.startsWith('https://learn.netdata.cloud/docs/') ||
                            citation.url.startsWith('http://learn.netdata.cloud/docs/') ||
                            citation.url.startsWith('/docs/')
                          );
                          
                          if (isInternalLink) {
                            let internalPath = citation.url;
                            if (citation.url.includes('learn.netdata.cloud/docs/')) {
                              internalPath = citation.url.substring(citation.url.indexOf('/docs/'));
                            }
                            
                            return (
                              <Link
                                key={idx}
                                to={internalPath}
                                style={{
                                  display: 'inline-block',
                                  marginRight: '16px',
                                  marginBottom: '8px',
                                  color: '#667eea',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  borderBottom: '1px dotted #667eea',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#4c51bf';
                                  e.currentTarget.style.borderBottomColor = '#4c51bf';
                                  e.currentTarget.style.textDecoration = 'none';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = '#667eea';
                                  e.currentTarget.style.borderBottomColor = '#667eea';
                                  e.currentTarget.style.textDecoration = 'none';
                                }}
                              >
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    backgroundColor: 'rgba(0,0,0,0.03)',
                                    borderRadius: '4px',
                                    padding: '1px 4px',
                                    minWidth: '20px',
                                    textAlign: 'center'
                                  }}>
                                    {idx + 1}
                                  </span>
                                  <span>{citation.title}</span>
                                  <span style={{ 
                                    fontSize: '10px', 
                                    opacity: '0.7',
                                    marginLeft: '2px'
                                  }}>→</span>
                                </span>
                              </Link>
                            );
                          }
                          
                          // External links still open in new tab
                          return (
                            <a
                              key={idx}
                              href={citation.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-block',
                                marginRight: '16px',
                                marginBottom: '8px',
                                color: '#667eea',
                                textDecoration: 'none',
                                fontSize: '14px',
                                borderBottom: '1px dotted #667eea',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = '#4c51bf';
                                e.target.style.borderBottomColor = '#4c51bf';
                                e.target.style.textDecoration = 'none';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = '#667eea';
                                e.target.style.borderBottomColor = '#667eea';
                                e.target.style.textDecoration = 'none';
                              }}
                            >
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: isDarkMode ? 'var(--ifm-color-secondary)' : '#6b7280',
                                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                borderRadius: '4px',
                                padding: '1px 4px',
                                minWidth: '20px',
                                textAlign: 'center'
                              }}>
                                {idx + 1}
                              </span>
                              <span>{citation.title}</span>
                              <span style={{ 
                                fontSize: '10px', 
                                opacity: '0.7',
                                marginLeft: '2px'
                              }}>→</span>
                            </span>
                          </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
            {/* Dock target: place the input at bottom of messages when docked */}
            <div ref={dockTargetRef} style={{ height: isDocked ? '80px' : '0px', transition: 'height 260ms ease' }} />
            {/* Portal: animated clone of the floating input while transitioning */}
            {isAnimatingDock && portalStyles && (
              <div ref={inputPortalRef} style={portalStyles} aria-hidden>
                {renderInputForm({ attachRef: false, placeholderOverride: 'Reply / Ask something else' })}
              </div>
            )}

            {/* When docked, show the real input inside the messages area */}
            {!isAnimatingDock && isDocked && (
              <div style={{ marginTop: '12px', padding: '8px 20px', width: '100%', maxWidth: dockSize ? `${dockSize.width}px` : '800px', marginLeft: 'auto', marginRight: 'auto', height: dockSize ? `${dockSize.height}px` : undefined }}>
                {renderInputForm({ attachRef: true, placeholderOverride: 'Reply / Ask something else' })}
              </div>
            )}
            {isLoading && (
              <div style={{ ...messageStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
                <div style={{ position: 'relative', width: '300px', height: '4px', overflow: 'hidden', borderRadius: '2px', backgroundColor: 'rgba(156, 163, 175, 0.1)' }}>
                  {/* Horizontal scanning line */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100px',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, var(--asknet-green), transparent)`,
                    animation: 'scanBackForth 2s ease-in-out infinite',
                    boxShadow: `0 0 10px rgba(${getComputedStyle(document.documentElement).getPropertyValue('--asknet-green-rgb') || '0,171,68'}, 0.32), 0 0 20px rgba(${getComputedStyle(document.documentElement).getPropertyValue('--asknet-green-rgb') || '0,171,68'}, 0.16)`
                  }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}