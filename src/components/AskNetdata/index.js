import React, { useState, useEffect, useRef, useMemo } from 'react';
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
      'Can Netdata identify the root cause of an issue for me?'
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
  SIDE_GUTTERS_PX: 48,          // combined side paddings (approx 24px each side)
  GRID_GAP_PX: 20,              // gap between cards in the grid
  ROW_GAP_PX: 20,               // vertical gap between grid rows (for measurement)
  MIN_CARD_WIDTH_PX: 260,       // minimum card width used to compute columns
  MAX_COLUMNS: 6,               // cap for columns on very wide screens
  MAX_ITEMS_PER_CATEGORY: 5,    // richest per-category sentences for first row
  MIN_ITEMS_PER_CATEGORY: 1,    // never show fewer than this per category
  MIN_VISIBLE_CATEGORIES: 2     // preference for number of categories when trimming
};

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
          0%, 100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5), 0 0 10px rgba(0, 212, 255, 0.3), 0 0 15px rgba(0, 171, 68, 0.2); }
          50% { box-shadow: 0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 171, 68, 0.4); }
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
  const [isPlaceholderAnimating, setIsPlaceholderAnimating] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messageRefs = useRef({});
  const chatAreaRef = useRef(null);
  const lastUserMessageId = useRef(null);
  const lastAssistantMessageId = useRef(null);
  const targetScrollPosition = useRef(null);
  const hasReachedTarget = useRef(false);
  const userHasScrolled = useRef(false);
  const textareaRef = useRef(null);
  const scrollSaveTimer = useRef(null);
  const hasRestoredScroll = useRef(false);
  const suggestionBoxRef = useRef(null);
  const [visibleSuggestionCount, setVisibleSuggestionCount] = useState(null);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isPrevHover, setIsPrevHover] = useState(false);
  const [isNextHover, setIsNextHover] = useState(false);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

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

  const currentGroup = groups.length ? groups[currentGroupIndex % groups.length] : null;

  // Multi-category layout: choose as many categories as fit and 4-5 items per category (most that fit)
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
      const vp = getViewport();
  // Suggestion container anchor
  const top = (vp.height * ASK_LAYOUT.TOP_PERCENT) + ASK_LAYOUT.TOP_OFFSET_PX;
  const availableH = Math.max(0, vp.height - top - ASK_LAYOUT.BOTTOM_MARGIN_PX);

  // Columns based on available viewport width (use near-full width)
  const containerW = Math.max(0, vp.width - ASK_LAYOUT.SIDE_GUTTERS_PX);
  let columns = Math.max(1, Math.floor(containerW / ASK_LAYOUT.MIN_CARD_WIDTH_PX));
  columns = Math.min(columns, ASK_LAYOUT.MAX_COLUMNS);

  const ROW_GAP = ASK_LAYOUT.ROW_GAP_PX;
      const order = categoriesOrderRef.current || groups;
  const MAX_EQ_ITEMS = ASK_LAYOUT.MAX_ITEMS_PER_CATEGORY;
  const MIN_EQ_ITEMS = ASK_LAYOUT.MIN_ITEMS_PER_CATEGORY; // never go below per requirement
  const GRID_GAP = ASK_LAYOUT.GRID_GAP_PX; // must match render gap

      // Helper: measure tallest card height for N items at current card width
      const cardWidth = columns > 0 ? Math.max(0, (containerW - (columns - 1) * GRID_GAP) / columns) : containerW;
      const measureHeightForN = (N, eligible) => {
        if (!eligible || eligible.length === 0) return 0;
        const measureRoot = document.createElement('div');
        measureRoot.style.position = 'absolute';
        measureRoot.style.visibility = 'hidden';
        measureRoot.style.pointerEvents = 'none';
        measureRoot.style.left = '-99999px';
        measureRoot.style.top = '0';
        measureRoot.style.width = `${Math.floor(cardWidth)}px`;
        measureRoot.style.boxSizing = 'border-box';
        document.body.appendChild(measureRoot);

        let maxCardH = 0;
        const sampleCount = Math.min(eligible.length, Math.max(columns * 2, 4));
        for (let i = 0; i < sampleCount; i++) {
          const g = eligible[i];
          const card = document.createElement('div');
          card.style.padding = '20px';
          card.style.border = '1px solid transparent';
          card.style.boxSizing = 'border-box';
          card.style.borderRadius = '12px';
          const title = document.createElement('div');
          title.style.fontWeight = '700';
          title.style.fontSize = '17px';
          title.style.textAlign = 'center';
          title.style.marginBottom = '8px';
          title.textContent = g.title || '';
          card.appendChild(title);
          const list = document.createElement('div');
          list.style.display = 'grid';
          list.style.gap = '10px';
          for (let k = 0; k < N; k++) {
            const btn = document.createElement('button');
            btn.style.textAlign = 'left';
            btn.style.padding = '10px 12px';
            btn.style.borderRadius = '8px';
            btn.style.border = 'none';
            btn.style.background = 'transparent';
            btn.style.width = '100%';
            btn.style.boxSizing = 'border-box';
            btn.style.whiteSpace = 'normal';
            btn.style.wordBreak = 'break-word';
            btn.style.overflowWrap = 'anywhere';
            btn.style.lineHeight = '1.4';
            btn.textContent = (g.items && g.items[k]) ? g.items[k] : '';
            list.appendChild(btn);
          }
          card.appendChild(list);
          measureRoot.appendChild(card);
          const h = card.getBoundingClientRect().height;
          if (h > maxCardH) maxCardH = h;
          measureRoot.removeChild(card);
        }
        document.body.removeChild(measureRoot);
        return maxCardH;
      };

      // 1) Choose richest first row (highest N that fits at least one row)
      let firstRowN = MIN_EQ_ITEMS;
      let firstRowH = 0;
      let eligibleForFirst = [];
      for (let N = MAX_EQ_ITEMS; N >= MIN_EQ_ITEMS; N--) {
        const eligible = order.filter(g => (g.items || []).length >= N);
        if (eligible.length === 0) continue;
        const H = measureHeightForN(N, eligible);
        if (H <= availableH + 0.5) { // at least one row fits
          firstRowN = N;
          firstRowH = H;
          eligibleForFirst = eligible;
          break;
        }
      }

      // Pick categories for first row
      let layout = [];
      if (eligibleForFirst.length > 0) {
        const firstRowCats = eligibleForFirst.slice(0, Math.min(columns, eligibleForFirst.length)).map(g => {
          if (!categoryItemOrderRef.current[g.key]) {
            categoryItemOrderRef.current[g.key] = [...(g.items || [])].sort(() => Math.random() - 0.5);
          }
          const ordered = categoryItemOrderRef.current[g.key];
          return { key: g.key, title: g.title, items: ordered.slice(0, firstRowN) };
        });
        layout = layout.concat(firstRowCats);
      }

      // 2) Append additional rows with as many sentences as possible (may use smaller N per row)
      let usedKeys = new Set(layout.map(b => b.key));
      let remainingH = availableH - firstRowH;
      if (layout.length > 0) remainingH -= ROW_GAP; // account for gap before next row
      while (remainingH > 0) {
        let appended = false;
        for (let N = Math.min(firstRowN, MAX_EQ_ITEMS); N >= MIN_EQ_ITEMS; N--) {
          const eligible = order.filter(g => (g.items || []).length >= N && !usedKeys.has(g.key));
          if (eligible.length === 0) continue;
          const H = measureHeightForN(N, eligible);
          if (H <= remainingH + 0.5) {
            const addCats = eligible.slice(0, Math.min(columns, eligible.length)).map(g => {
              if (!categoryItemOrderRef.current[g.key]) {
                categoryItemOrderRef.current[g.key] = [...(g.items || [])].sort(() => Math.random() - 0.5);
              }
              const ordered = categoryItemOrderRef.current[g.key];
              return { key: g.key, title: g.title, items: ordered.slice(0, N) };
            });
            layout = layout.concat(addCats);
            addCats.forEach(c => usedKeys.add(c.key));
            remainingH -= H + ROW_GAP; // prepare for possible next row
            appended = true;
            break; // move to next row with updated remainingH
          }
        }
        if (!appended) break; // no N fits, stop
      }

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

  // Post-render safety net: prefer fewer categories over fewer items per category
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showWelcome) return; // only applies to welcome grid
    if (!suggestionBoxRef.current) return;
    if (!visibleCategories || visibleCategories.length === 0) return;

    const vp = window.visualViewport || window;
    const rect = suggestionBoxRef.current.getBoundingClientRect();
    const bottomLimit = (vp.height || window.innerHeight) - 16; // a bit more padding
    const overflows = rect.bottom > bottomLimit;

    if (!overflows) {
      // Reset guard when it fits
      fitPassRef.current = 0;
      return;
    }

    if (fitPassRef.current >= MAX_FIT_PASSES) return;

  const MIN_VISIBLE_CATEGORIES = ASK_LAYOUT.MIN_VISIBLE_CATEGORIES;
    const next = visibleCategories.map(c => ({ ...c, items: [...c.items] }));

    // Prefer removing categories first (keep richer per-category content)
    if (next.length > MIN_VISIBLE_CATEGORIES) {
      next.pop();
      fitPassRef.current += 1;
      setVisibleCategories(next);
      return;
    }

    // If we already are at the minimum category count, start trimming items per category
    let trimmed = false;
    for (let i = 0; i < next.length; i++) {
      if (next[i].items.length > 2) {
        next[i].items.pop();
        trimmed = true;
      }
    }
    if (trimmed) {
      fitPassRef.current += 1;
      setVisibleCategories(next);
    } else if (next.length > 1) {
      // As a last resort, drop a category if all items are at minimum
      next.pop();
      fitPassRef.current += 1;
      setVisibleCategories(next);
    } else {
      fitPassRef.current = 0;
    }
  }, [visibleCategories, showWelcome]);

  const goPrevGroup = () => setCurrentGroupIndex(i => (i - 1 + groups.length) % groups.length);
  const goNextGroup = () => setCurrentGroupIndex(i => (i + 1) % groups.length);

  // Compute how many suggestion items fit in the viewport below the suggestion box top
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!currentGroup) return;

    let rafId = null;
    const computeVisible = () => {
      const container = suggestionBoxRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const top = rect.top;
      const available = window.innerHeight - top - 24; // 24px bottom margin

      // Measure item height
      const firstBtn = container.querySelector('button');
      let itemHeight = 36; // fallback
      if (firstBtn) {
        const r = firstBtn.getBoundingClientRect();
        itemHeight = r.height + 6; // include gap
      }

      // We want a single column; compute how many rows fit and cap to 6
      const rows = Math.max(1, Math.floor(available / itemHeight));
      const cappedRows = Math.min(rows, 6);

      setVisibleSuggestionCount(curr => {
        const items = currentGroup ? currentGroup.items.length : 0;
        return Math.min(items, cappedRows);
      });
    };

    // Compute on next frame to allow DOM to layout
    rafId = window.requestAnimationFrame(computeVisible);
    const t = setTimeout(computeVisible, 120);
    window.addEventListener('resize', computeVisible);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      clearTimeout(t);
      window.removeEventListener('resize', computeVisible);
    };
  }, [currentGroup]);

  // Combine all questions for placeholder rotation
  const allQuestions = useMemo(() => {
    return groups.flatMap(g => g.items || []);
  }, [groups]);

  // Placeholder rotation effect
  useEffect(() => {
    if (allQuestions.length === 0) return;
    
    // Set initial placeholder
    setCurrentPlaceholder(allQuestions[0]);
    
    const interval = setInterval(() => {
      // If paused (user hovering send button), skip rotation
      if (sendHoverRef.current) return;

      // Start fade out animation
      setIsPlaceholderAnimating(true);
      
      // After fade out, change text and fade in
      setTimeout(() => {
        setCurrentPlaceholder(prev => {
          const currentIndex = allQuestions.indexOf(prev);
          const nextIndex = (currentIndex + 1) % allQuestions.length;
          return allQuestions[nextIndex];
        });
        setIsPlaceholderAnimating(false);
      }, 200); // Half animation duration
      
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [allQuestions]);

  const handleSubmit = async (e, overrideMessage = null) => {
    e?.preventDefault();
    const message = overrideMessage || input.trim();
    if (!message || isLoading) return;

    setShowWelcome(false);

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
    }
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
    padding: '20px'
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
    maxWidth: showWelcome ? chatAreaStyle.maxWidth : '100%'
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
    color: '#00AB44',
    marginBottom: '8px',
    lineHeight: '1',
    whiteSpace: 'nowrap'
  };

  const suggestionContainerStyle = {
  marginTop: 'auto',
  marginBottom: '10px',
  width: '100%',
  maxWidth: '980px',
  marginLeft: 'auto',
  marginRight: 'auto',
  padding: '0 24px',
  boxSizing: 'border-box'
  };

  const suggestionGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  justifyItems: 'center',
  alignItems: 'start'
  };

  const suggestionButtonStyle = {
  textAlign: 'center',
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    lineHeight: '1.2',
    color: isDarkMode ? 'var(--ifm-font-color-base)' : '#495057',
    transition: 'all 0.2s'
  };

  const suggestionCardStyle = {
    background: isDarkMode ? 'var(--ifm-background-surface-color)' : 'white',
    border: isDarkMode ? '2px solid var(--ifm-color-emphasis-300)' : '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column'
  };

  const messagesContainerStyle = {
    width: '100%',
    margin: '0 auto',
    padding: '10px 20px'
  };

  // Messages content should fade in after the container expands
  const computedMessagesContainerStyle = {
    ...messagesContainerStyle,
    opacity: showWelcome ? 0 : 1,
    transition: 'opacity 520ms ease 260ms', // delay so expansion happens first
    willChange: 'opacity'
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
      : 'linear-gradient(135deg, #00ab44 0%, #00d46a 100%)',
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
      ? `${inputContainerStyle.boxShadow}, 0 0 0 3px rgba(0, 171, 68, 0.12), 0 0 12px rgba(0, 171, 68, 0.06)`
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
  // Turn placeholder green when the send button is hovered and there's no user input
  color: (isSendHovered && !input.trim()) ? '#00AB44' : (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
    fontFamily: 'inherit',
    pointerEvents: 'none',
  transition: 'all 0.4s ease, color 220ms ease',
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
    background: '#00AB44',
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
    transition: 'background 0.2s',
    flexShrink: 0
  };


  // Dimmed background color (solid) for light/dark modes
  const dimmedBg = isDarkMode ? 'rgba(0,171,68,0.12)' : 'rgba(0,171,68,0.08)';
  const computedSendButtonStyle = {
    ...sendButtonStyle,
    background: input.trim() ? '#00AB44' : dimmedBg,
    // On hover, always show full green background (unless disabled)
    ...(isSendHovered && !isLoading ? { background: '#00AB44' } : {})
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

  return (
    <div style={containerStyle}>
      <style>{`
        /* Disable native resize handle but allow internal vertical scrolling */
  .asknetdata-textarea { resize: none !important; overflow-y: auto !important; -webkit-appearance: none !important; appearance: none !important; }
  /* Hide the tiny native resize handle on WebKit/Blink */
  .asknetdata-textarea::-webkit-resizer, .asknetdata-textarea::-webkit-resize-handle { display: none !important; }
  /* By default hide the scrollbar; show it only when the textarea has .is-scrollable */
  .asknetdata-textarea:not(.is-scrollable) { scrollbar-width: none; -ms-overflow-style: none; }
  .asknetdata-textarea:not(.is-scrollable)::-webkit-scrollbar { display: none; }
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
            <div style={floatingContainerStyle}>
              <div style={welcomeStyle}>
                <h2 style={welcomeTitleStyle}>
                  Ask Netdata Docs
                </h2>
                <p style={{ 
                  fontSize: '20px', 
                  color: isDarkMode ? 'var(--ifm-color-secondary)' : '#6b7280', 
                  marginBottom: '0', 
                  lineHeight: '1.3', 
                  margin: '0 auto',
                  textAlign: 'center'
                }}>
                  Placeholder text below title
                </p>
              </div>
              
              <div style={computedInputContainerStyle}>
                <form onSubmit={handleSubmit} style={inputFormStyle}>
                  <div style={{ ...inputWrapperStyle, overflow: 'visible' }}>
                    <div style={animatedPlaceholderStyle}>
                      {currentPlaceholder || "Ask anything about Netdata, in any language... (Shift+Enter for new line)"}
                    </div>
                    <textarea
                      className="asknetdata-textarea"
                      ref={(el) => {
                        inputRef.current = el;
                        textareaRef.current = el;
                      }}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        adjustTextareaHeight();
                      }}
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
                    style={computedSendButtonStyle}
                    disabled={isLoading}
                    onMouseEnter={() => { setIsSendHovered(true); sendHoverRef.current = true; }}
                    onMouseLeave={() => { setIsSendHovered(false); sendHoverRef.current = false; }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isLoading) return;
                      if (!input.trim()) {
                        // Submit the current placeholder when input is empty
                        handleSubmit(null, currentPlaceholder || '');
                      } else {
                        handleSubmit();
                      }
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

              {/* Responsive multi-category suggestions grid below the centered chatbox */}
              {visibleCategories.length > 0 && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  // Keep this in sync with ASK_LAYOUT TOP_PERCENT/OFFSET
                  top: `calc(${ASK_LAYOUT.TOP_PERCENT * 100}% + ${ASK_LAYOUT.TOP_OFFSET_PX}px)`,
                  width: '100%',
                  maxWidth: '100%',
                  padding: '0 24px',
                  margin: '0 auto',
                  boxSizing: 'border-box',
                  pointerEvents: 'auto',
                  zIndex: 1
                }}>
                  {(() => {
                    // Accessible suggestion colors
                    var suggestionTextColor = isDarkMode ? '#7ED9A6' : '#0B7D3B';
                    var suggestionTitleColor = isDarkMode ? '#98E9BC' : '#0E8A43';
                    return (
                  <div ref={suggestionBoxRef} style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(auto-fit, minmax(${ASK_LAYOUT.MIN_CARD_WIDTH_PX}px, 1fr))`,
                    gap: `${ASK_LAYOUT.GRID_GAP_PX}px`,
                    alignItems: 'stretch'
                  }}>
                    {visibleCategories.map((cat) => (
                      <div key={cat.key} style={{
                        background: isDarkMode ? 'var(--ifm-background-surface-color)' : 'white',
                        border: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '20px',
                        boxSizing: 'border-box',
                        height: '100%'
                      }}>
                        <div style={{
                          fontWeight: 700,
                          color: suggestionTitleColor,
                          fontSize: '1.05rem',
                          marginBottom: '8px',
                          textAlign: 'center'
                        }}>
                          {cat.title}
                        </div>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {cat.items.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(q)}
                              style={{
                                textAlign: 'left',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'transparent',
                                color: suggestionTextColor,
                                cursor: 'pointer',
                                transition: 'color 160ms, transform 120ms',
                                width: '100%',
                                boxSizing: 'border-box',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                lineHeight: 1.4
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#00AB44'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = suggestionTextColor; }}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                    ); })()}
                </div>
              )}

            {/* Title and Categorized Questions together */}
            <div style={suggestionContainerStyle}>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                width: '100%',
                maxWidth: '880px',
                margin: '0 auto',
                boxSizing: 'border-box'
              }}>
            </div>
            </div>
          </>
        ) : (
          <div style={computedMessagesContainerStyle}>
            {messages.length > 0 && (
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button
                  onClick={clearHistory}
                  style={{
                    background: 'transparent',
                    border: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: isDarkMode ? 'var(--ifm-color-secondary)' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? 'var(--ifm-background-surface-color)' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Clear History
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
                    background: 'linear-gradient(90deg, transparent, #00ab44, transparent)',
                    animation: 'scanBackForth 2s ease-in-out infinite',
                    boxShadow: '0 0 10px rgba(0, 171, 68, 0.32), 0 0 20px rgba(0, 171, 68, 0.16)'
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