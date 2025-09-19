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

// Exposed toggle colors (off/on) so other modules can import and configure
// Toggle colors now include primary and secondary entries for each state.
// primary = main accent (used across the chatbox)
// secondary = header/contrast accent (used for the opposite title)
// Primary and secondary color constants - change these to customize the theme
// Central color constants now centralized in colors.js so widget & main stay in sync
import { ASKNET_PRIMARY, ASKNET_SECOND, rgba, rgbString, OPACITY } from './colors';
export { ASKNET_PRIMARY, ASKNET_SECOND };

// Configurable visual defaults (keep at top so authors can change them)
export const TITLE_DIM_LIGHT = 'rgba(0,0,0,0.56)';
export const TITLE_DIM_DARK = 'rgba(255,255,255,0.56)';

// How opaque the active search-title should be when using the secondary hue (0-1)
export const TITLE_ACTIVE_SECONDARY_OPACITY = 0.92;

// Secondary color derivation: keep defaults 0/1 so nothing changes unless you edit these
// Change these to shift the hue (degrees) and multiply saturation (e.g., 1.2) for the
export const SECONDARY_DERIVE_FROM_PRIMARY = false;
// secondary palette when deriving it from the primary color.
// By default we do not derive or change secondary colors. Set to true to enable
// deriving the secondary palette from the primary by shifting hue/saturation.
// When enabled, tweak these to taste. Example: set SECONDARY_HUE_SHIFT_DEG = 30
// to shift hue +30 degrees, and SECONDARY_SATURATION_MULT = 0.9 to slightly
// reduce saturation.
export const SECONDARY_HUE_SHIFT_DEG = 0; // degrees to add to hue (can be negative)
export const SECONDARY_SATURATION_MULT = 1.0; // multiplier for saturation (1.0 = unchanged)

// Title desaturation control - how much to desaturate unselected titles (0.0 = no change, 1.0 = fully gray)
export const TITLE_DESATURATION = 0.9; // 65% desaturation for unselected titles
// Unified inactive title grayscale (avoid per-hue discrepancies)
export const TITLE_INACTIVE_LIGHT = '#6b7280';
export const TITLE_INACTIVE_DARK = '#787b81';

// UI sizing constants
export const TITLE_FONT_SIZE = '1.7rem'; // Font size for AI/Search titles
export const TITLE_FONT_WEIGHT = 'bold'; // Font weight for AI/Search titles (normal, bold, 600, 700, etc.)
export const TITLE_GAP = '2rem'; // Gap between AI and Search titles
export const TOGGLE_SIZE_MULTIPLIER = 1; // Align with widget exact sizing
// How far the knob sits from track edges (increase to move the circle inward)
export const TOGGLE_KNOB_INSET_PX = 6;

export const TOGGLE_COLORS = {
  off: { primary: ASKNET_PRIMARY, secondary: ASKNET_SECOND },
  on:  { primary: ASKNET_PRIMARY, secondary: ASKNET_SECOND }
};

// Feature flags
export const SHOW_SEARCH_RELEVANCE_SCORE = false; // Set to false to hide relevance scores in search results

// Exposed header titles
export const HEADER_TITLES = {
  left: 'Ask Netdata',
  right: 'Search Docs'
};


// Hard-coded flag to hide the subtitle (set true to hide)
export const HIDE_SUBTITLE = true;

// Platform-aware keybind labels (Ctrl vs Cmd)
const IS_MAC = (typeof navigator !== 'undefined') && /Mac|Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.platform);
const SHORTCUT_LABEL = (IS_MAC ? '⌘' : 'Ctrl') + ' + /';
const FOCUS_SHORTCUT_LABEL = (IS_MAC ? '⌘' : 'Ctrl') + ' + K';





// API configuration: when docs run on localhost, use local Ask Netdata; otherwise use production
const getApiBase = () => {
  try {
    if (typeof window !== 'undefined') {
      const h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000/api';
    }
  } catch {}
  return 'https://agent-events.netdata.cloud/ask-netdata/api';
};

const API_BASE = getApiBase();
const apiUrl = API_BASE;

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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideUpIn {
          0% { 
            transform: translateY(20px);
            opacity: 0;
          }
          100% { 
            transform: translateY(0px);
            opacity: 1;
          }
        }
        @keyframes slideUpInSmooth {
          0% { 
            transform: translateY(40px) scale(0.96);
            opacity: 0;
            filter: blur(1px);
          }
          60% {
            transform: translateY(-2px) scale(1.01);
            opacity: 0.8;
            filter: blur(0px);
          }
          100% { 
            transform: translateY(0px) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
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
  // Ensure global animation keyframes exist even before any messages render (search view needs scanBackForth)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!document.getElementById('asknet-global-animations')) {
      const style = document.createElement('style');
      style.id = 'asknet-global-animations';
      style.textContent = `@keyframes scanBackForth { 0% { transform: translateX(-100px);} 50% { transform: translateX(300px);} 100% { transform: translateX(-100px);} }`;
      try { document.head.appendChild(style); } catch (e) {}
    }
  }, []);
  // Initialize state from sessionStorage if available
  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      // Detect if the page load is a full reload. If so, clear previous session messages
      // so a refresh forces a new chat. Back/forward navigations preserve chat.
      try {
        const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
        const navType = (navEntries && navEntries[0] && navEntries[0].type) || (performance && performance.navigation && performance.navigation.type);
        const isReload = (navType === 'reload') || (navType === 1); // 1 === TYPE_RELOAD in older API
        if (isReload) {
          sessionStorage.removeItem('askNetdataMessages');
          sessionStorage.removeItem('askNetdataScrollPosition');
          return [];
        }
      } catch (e) {
        // ignore and fall back to loading saved messages
      }
      const saved = sessionStorage.getItem('askNetdataMessages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
        const navType = (navEntries && navEntries[0] && navEntries[0].type) || (performance && performance.navigation && performance.navigation.type);
        const isReload = (navType === 'reload') || (navType === 1);
        if (isReload) return true; // Force welcome on reload
      } catch (e) {
        // ignore
      }
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
  // Centered pill toggle (sliding) state - controls a feature (user will decide what it does)
  const [toggleOn, setToggleOn] = useState(false);
  // Search functionality state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Track previous toggle to handle mode transitions cleanly
  const prevToggleRef = useRef(toggleOn);
  useEffect(() => {
    // Always focus the input shortly after any toggle change
    setTimeout(() => {
      try { (textareaRef.current || inputRef.current)?.focus(); } catch (e) {}
    }, 30);
    // If we just left search mode, clear residual search UI state so Ask view is unaffected
    if (prevToggleRef.current && !toggleOn) {
      setSearchResults([]);
      setSearchQuery('');
      setIsSearching(false);
    }
    prevToggleRef.current = toggleOn;
  }, [toggleOn]);
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
  // Positioning for the bottom notice: left (px) and width (px)
  const [noticeLeftPx, setNoticeLeftPx] = useState(null);
  const [noticeWidthPx, setNoticeWidthPx] = useState(null);
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

  // Helper: try to extract RGB components from common color formats (#rrggbb, rgb(...)).
  const extractRgb = (color) => {
    if (!color) return null;
    color = color.trim();
    // rgb(...) -> extract numbers
    const rgbMatch = color.match(/rgb\s*\(([^)]+)\)/i);
    if (rgbMatch) {
      const parts = rgbMatch[1].split(',').map(p => parseInt(p.trim(), 10));
      if (parts.length >= 3 && parts.every(n => !isNaN(n))) return `${parts[0]},${parts[1]},${parts[2]}`;
    }
    // hex #rrggbb
    const hexMatch = color.match(/^#([0-9a-f]{6})$/i);
    if (hexMatch) {
      const hex = hexMatch[1];
      const r = parseInt(hex.substring(0,2), 16);
      const g = parseInt(hex.substring(2,4), 16);
      const b = parseInt(hex.substring(4,6), 16);
      return `${r},${g},${b}`;
    }
    return null;
  };

  // Extract RGB values from the color constants
  const activeGreenRgb = (() => {
    const rgb = extractRgb(ASKNET_PRIMARY);
    return rgb || '0,171,68';
  })();

  // Extract RGB for secondary color
  const activeSecondRgb = (() => {
    const secondaryColor = SECONDARY_DERIVE_FROM_PRIMARY && derivedSecondaryState ? derivedSecondaryState : ASKNET_SECOND;
    const rgb = extractRgb(secondaryColor);
    return rgb || activeGreenRgb;
  })();

  // Which accent to use across the chat UI: when in search mode (toggleOn) prefer secondary
  const [derivedSecondaryState, setDerivedSecondaryState] = useState(null);
  // If derivation is enabled, prefer the derived secondary color when available.
  // Effective secondary: use derived if derivation is enabled and available, otherwise use ASKNET_SECOND
  const effectiveSecondary = SECONDARY_DERIVE_FROM_PRIMARY && derivedSecondaryState ? derivedSecondaryState : ASKNET_SECOND;
  const currentAccent = toggleOn ? effectiveSecondary : ASKNET_PRIMARY;
  const currentAccentRgb = rgbString(currentAccent);

  // Compute and set derived secondary on the client when configured.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!SECONDARY_DERIVE_FROM_PRIMARY) {
      setDerivedSecondaryState(null);
      return;
    }
    try {
      // Resolve primary color string (handle var(--asknet-green))
      let primaryRaw = ASKNET_PRIMARY || '';
      if (/var\(/.test(primaryRaw)) {
        const val = getComputedStyle(document.documentElement).getPropertyValue('--asknet-green');
        if (val && val.trim()) primaryRaw = val.trim();
      }
      // Try parse rgb(...) or hex #rrggbb
      const rgbMatch = primaryRaw.match(/rgb\s*\(([^)]+)\)/i);
      let r=0,g=0,b=0;
      if (rgbMatch) {
        const parts = rgbMatch[1].split(',').map(p => parseInt(p.trim(),10));
        if (parts.length >=3) { r=parts[0]/255; g=parts[1]/255; b=parts[2]/255; }
      } else {
        const hexMatch = primaryRaw.trim().match(/^#([0-9a-f]{6})$/i);
        if (hexMatch) {
          const hex = hexMatch[1];
          r = parseInt(hex.substring(0,2),16)/255;
          g = parseInt(hex.substring(2,4),16)/255;
          b = parseInt(hex.substring(4,6),16)/255;
        }
      }
      // If we don't have valid rgb, bail
      if ([r,g,b].some(v => isNaN(v))) { setDerivedSecondaryState(null); return; }
      const max = Math.max(r,g,b), min = Math.min(r,g,b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h = h / 6;
      }
      // Apply configured adjustments
      const newH = (h * 360 + SECONDARY_HUE_SHIFT_DEG + 360) % 360;
      const newS = Math.min(1, Math.max(0, s * SECONDARY_SATURATION_MULT));
      const newL = l;
      // HSL->RGB helper
      const h2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      let r2,g2,b2;
      if (newS === 0) {
        r2 = g2 = b2 = Math.round(newL * 255);
      } else {
        const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS;
        const p = 2 * newL - q;
        const hn = newH / 360;
        r2 = Math.round(h2rgb(p, q, hn + 1/3) * 255);
        g2 = Math.round(h2rgb(p, q, hn) * 255);
        b2 = Math.round(h2rgb(p, q, hn - 1/3) * 255);
      }
      const toHex = n => n.toString(16).padStart(2, '0');
      const derived = `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
      setDerivedSecondaryState(derived);
    } catch (e) {
      setDerivedSecondaryState(null);
    }
  }, [ASKNET_PRIMARY, SECONDARY_DERIVE_FROM_PRIMARY, SECONDARY_HUE_SHIFT_DEG, SECONDARY_SATURATION_MULT]);

  // Unified inactive color (we keep function stub in case future logic needs it)
  const desaturateColor = () => (isDarkMode ? TITLE_INACTIVE_DARK : TITLE_INACTIVE_LIGHT);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    try {
      const existingGreenRgb = (getComputedStyle(document.documentElement).getPropertyValue('--asknet-green-rgb') || '').trim();
      const g = extractRgb(ASKNET_PRIMARY) || extractRgb(getComputedStyle(document.documentElement).getPropertyValue('--asknet-green')) || '0,171,68';
      if (!existingGreenRgb) {
        document.documentElement.style.setProperty('--asknet-green-rgb', g);
      }
      // Only set second rgb if we derived a secondary, otherwise keep existing value if present
      const existingSecondRgb = (getComputedStyle(document.documentElement).getPropertyValue('--asknet-second-rgb') || '').trim();
      const sCandidate = extractRgb(effectiveSecondary) || extractRgb(getComputedStyle(document.documentElement).getPropertyValue('--asknet-second')) || g;
      // If we derived a secondary and derivation is enabled, set the CSS var so
      // any styles using `var(--asknet-second)` pick up the derived hue.
      if (derivedSecondaryState && SECONDARY_DERIVE_FROM_PRIMARY) {
        try { document.documentElement.style.setProperty('--asknet-second', derivedSecondaryState); } catch (e) {}
        try { document.documentElement.style.setProperty('--asknet-second-rgb', sCandidate); } catch (e) {}
      } else if (!existingSecondRgb) {
        // If no derived secondary, set the rgb var only if it's missing to avoid overwriting host styles.
        try { document.documentElement.style.setProperty('--asknet-second-rgb', sCandidate); } catch (e) {}
      }
    } catch (e) {}
  }, [ASKNET_PRIMARY, effectiveSecondary, derivedSecondaryState]);
  
  // Simplified title coloring with desaturation for unselected titles
  // Use the constants directly for maximum clarity
  const baseLeftColor = ASKNET_PRIMARY;  // AI title always uses primary
  const baseRightColor = effectiveSecondary;  // Search title uses effective secondary (derived or constant)
  
  // AI title: use primary when active (toggleOff), desaturated primary when inactive (toggleOn)
  const inactiveTitleColor = isDarkMode ? TITLE_INACTIVE_DARK : TITLE_INACTIVE_LIGHT;
  const titleLeftColor = toggleOn ? inactiveTitleColor : baseLeftColor;
  const titleRightColor = toggleOn ? baseRightColor : inactiveTitleColor;

  // Ensure CSS variable --asknet-second is available on the document root so it can be used in styles
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Only set a default asknet-second if the document does not already provide one.
    const current = getComputedStyle(document.documentElement).getPropertyValue('--asknet-second');
    if (!current || !current.trim()) {
      try { document.documentElement.style.setProperty('--asknet-second', ASKNET_SECOND); } catch (e) {}
      // On unmount, remove the var so we don't leave side-effects
      return () => { try { document.documentElement.style.removeProperty('--asknet-second'); } catch (e) {} };
    }
    return () => {};
  }, []);

  // Derived early flags for keyboard logic
  const hasSearchPanelActiveEarly = toggleOn && (isSearching || searchResults.length > 0 || (searchQuery && !isSearching));
  const hasResultsOrAnswers = hasSearchPanelActiveEarly || (messages && messages.length > 0);

  // Global keyboard shortcuts: Ctrl+/ toggles mode, Ctrl+K focuses input (no auto-focus on load)
  useEffect(() => {
    const onGlobalKey = (e) => {
      // When results panel is active or we have answers, lock mode switching
      const modeLocked = hasResultsOrAnswers;
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        if (modeLocked) {
          // Ignore toggle shortcut while locked; keep focus on input for convenience
          try { (textareaRef.current || inputRef.current)?.focus(); } catch (_) {}
          return;
        }
        setToggleOn(v => !v);
        return; // Do not auto focus; user can press Ctrl+K next
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        (textareaRef.current || inputRef.current)?.focus();
        return;
      }
      // Escape behavior:
      // - If search results are open, clear the panel (back to main page) without changing mode.
      // - Otherwise (answers), just focus the textbox.
      if (e.key === 'Escape') {
        if (hasSearchPanelActiveEarly) {
          e.preventDefault();
          setSearchResults([]);
          setSearchQuery('');
          setIsSearching(false);
          setInput('');
          try { (textareaRef.current || inputRef.current)?.focus(); } catch (_) {}
          return;
        }
        if (messages && messages.length > 0) {
          e.preventDefault();
          try { (textareaRef.current || inputRef.current)?.focus(); } catch (_) {}
          return;
        }
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [toggleOn, isSearching, searchResults.length, searchQuery, hasResultsOrAnswers, hasSearchPanelActiveEarly, messages]);

  // Removed initial auto-focus to align with widget behavior; user triggers focus via Ctrl+K

  // --- Feedback state & helpers (missing previously) ---
  // Tracks per-message feedback status: { [messageId]: { sending, sent, rating } }
  const [feedbackState, setFeedbackState] = useState({});
  // Tracks which message's comment box is open
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  // Draft comments per message
  const [commentDraft, setCommentDraft] = useState({});
  // Which feedback button is hovered (string key like `${messageId}:up|down|copy`)
  const [hoveredButton, setHoveredButton] = useState(null);
  // Per-message copied state to show transient checkmark animation
  const [copiedState, setCopiedState] = useState({});
  const copiedTimersRef = useRef({});

  // Clear any pending copied timers on unmount
  useEffect(() => {
    return () => {
      Object.values(copiedTimersRef.current).forEach(t => {
        try { clearTimeout(t); } catch (e) {}
      });
      copiedTimersRef.current = {};
    };
  }, []);

  // Post feedback to same-origin endpoint. Return true on success.
  const postFeedback = async ({ question, answer, rating, comment = '', citations = [], meta = {} }) => {
    const payload = {
      question: question || '',
      answer: answer || '',
      rating: rating || '',
      comment: comment || '',
      citations: citations || [],
      responseTimeMs: meta.responseTimeMs || null,
      model: meta.model || null,
      sessionId: meta.sessionId || (typeof window !== 'undefined' && window.askNetdataSessionId) || null
    };

    try {
      const resp = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return resp.ok;
    } catch (err) {
      console.error('postFeedback error', err);
      return false;
    }
  };

  // Expand suggestions to the full screen area (right of the sidebar) with dynamic columns
  const [contentBounds, setContentBounds] = useState(null);
  const GRID_MIN_COL_PX = 300; // desired min width per column for centering math
  const GRID_GAP_PX = 12;      // reduce gap slightly to allocate more space to cards
  const [suggestionsTopPx, setSuggestionsTopPx] = useState(null);
  const TOTAL_SECTIONS = 6; // About, Deployment, Operations, AI, Dashboards, Alerts
  const MIN_SINGLE_ROW_COL_PX = 300; // force single row even with narrow columns for max cards
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

  // Measure chat area to center the bottom notice relative to it
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      try {
        const el = chatAreaRef.current || containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const leftCenter = Math.round(rect.left + rect.width / 2);
        const width = Math.round(Math.min(rect.width, 800));
        setNoticeLeftPx(leftCenter);
        setNoticeWidthPx(width);
      } catch (e) {
        // ignore
      }
    };

    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    if (ro && (chatAreaRef.current || containerRef.current)) {
      try { ro.observe(chatAreaRef.current || containerRef.current); } catch (e) {}
    }
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      if (ro) try { ro.disconnect(); } catch (e) {}
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [chatAreaRef.current, containerRef.current, isDocked, dockSize]);

  // If the page is opened with a question in the URL (e.g. ?q=how+to+install),
  // trigger a search automatically. Supports `q` and `question` params.
  useEffect(() => {
    try {
      // If this load was a full reload, don't auto-submit the URL query (we clear URL below on reload)
      const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
      const navType = (navEntries && navEntries[0] && navEntries[0].type) || (performance && performance.navigation && performance.navigation.type);
      const isReload = (navType === 'reload') || (navType === 1);

      if (isReload) {
        // Don't auto-submit on reload; ensure URL params are removed so future reloads stay clean
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('q');
          url.searchParams.delete('question');
          window.history.replaceState({}, '', url.toString());
        } catch (err) {}
        return;
      }

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

  // On mount, detect full page reload and clear any persisted messages so a refresh always starts a new chat.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
      const navType = (navEntries && navEntries[0] && navEntries[0].type) || (performance && performance.navigation && performance.navigation.type);
      const isReload = (navType === 'reload') || (navType === 1);
      if (isReload) {
        sessionStorage.removeItem('askNetdataMessages');
        sessionStorage.removeItem('askNetdataScrollPosition');
        setMessages([]);
        setShowWelcome(true);
        // Clean up URL as well
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('q');
          url.searchParams.delete('question');
          window.history.replaceState({}, '', url.toString());
        } catch (err) {}
      }
    } catch (e) {
      // ignore
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

  // Disable page scroll only while the welcome view is visible.
  // Avoid locking the page while an answer is streaming (isLoading) because
  // changing document overflow during streaming causes the page to jump to the top.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const shouldLock = showWelcome;

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

  // Removed delayed mount auto-focus

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
      
      // SINGLE ROW: calculate how many columns (categories) fit in one responsive row
  // Determine available width from the left edge of the AskNetdata container to the viewport right
  const containerLeft = containerRef.current ? Math.max(0, Math.round(containerRef.current.getBoundingClientRect().left)) : 0;
  const viewportWidth = getViewport().width;
  const availableWidthForRow = Math.max(0, viewportWidth - containerLeft - H_PADDING_PX);

      // Decide how many columns we can fit based on minimum/maximum single-row column widths
      const maxPossibleCols = allCategories.length;
      // Compute a candidate cols count by dividing available width by minimum card width + gap
      const approxCols = Math.floor((availableWidthForRow + GRID_GAP_PX) / (MIN_SINGLE_ROW_COL_PX + GRID_GAP_PX));
      const cols = Math.max(1, Math.min(maxPossibleCols, approxCols || 1));

      // Calculate target column pixel width and clamp it into min/max bounds
      const rawColPx = Math.floor((availableWidthForRow - (cols - 1) * GRID_GAP_PX) / cols);
      const colPx = Math.max(MIN_SINGLE_ROW_COL_PX, Math.min(MAX_SINGLE_ROW_COL_PX, rawColPx || MIN_SINGLE_ROW_COL_PX));

      // Build forced grid template so CSS Grid renders exactly one row with `cols` columns
      setForcedTemplateColumns(`repeat(${cols}, minmax(${colPx}px, 1fr))`);

      // Calculate how many suggestion items per category can fit vertically given the available height
      const maxFirstRowHeight = availableHeight * 0.7; // Use 70% of space for first row
      const maxSuggestionsFirstRow = Math.floor((maxFirstRowHeight - categoryTitleHeight) / suggestionItemHeight);
      const suggestionsPerFirstRowCategory = Math.max(1, Math.min(ASK_LAYOUT.MAX_ITEMS_PER_CATEGORY, maxSuggestionsFirstRow));

      // Take the first `cols` categories for the single row layout
      const firstRowCategories = allCategories.slice(0, cols);
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
      window.visualViewport.addEventListener('scroll', onResize);
    }

    // ResizeObserver fallback: observe container changes (helps with zoom in some browsers)
    let ro = null;
    try {
      if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
        ro = new ResizeObserver(() => {
          computeLayout();
        });
        ro.observe(containerRef.current);
        if (suggestionBoxRef.current) ro.observe(suggestionBoxRef.current);
      }
    } catch (e) {
      ro = null;
    }

    // Polling fallback for browsers that don't emit viewport resize on zoom (cheap, 300ms)
    let lastViewportWidth = getViewport().width;
    const pollId = setInterval(() => {
      const vw = getViewport().width;
      if (vw !== lastViewportWidth) {
        lastViewportWidth = vw;
        computeLayout();
      }
    }, 300);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onResize);
        window.visualViewport.removeEventListener('scroll', onResize);
      }
      if (ro) {
        try { ro.disconnect(); } catch (err) {}
      }
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(pollId);
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
  // Pause placeholder rotation when search mode (toggle) is active
  if (toggleOn) return;
    
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
  }, [placeholderQuestions, isDocked, isAnimatingDock, showWelcome, toggleOn]);

  // Search function for docs search mode
  const handleSearch = async (query) => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setSearchResults([]);

    // Static fallback results (detailed) used for quick local testing when the search endpoint is missing (404)
    const staticFallbackResults = [
      {
        title: 'Netdata Agent Installation',
  url: '/docs/netdata-agent/installation',
  snippet: `# Netdata Agent Installation  Netdata is very flexible and can be used to monitor all kinds of infrastructure. Read more about possible [Deployment guides](/docs/deployment-guides) to understand what...`,
        score: 0.35,
        section: 'Documentation'
      },
      {
        title: 'Netdata Cloud On-Prem Installation - Before You Begin',
  url: '/docs/netdata-cloud-on-prem/installation',
  snippet: `# Netdata Cloud On-Prem Installation  # Netdata Cloud On-Prem Installation ## Before You Begin  ## Before You Begin  Ensure you have the following ready before starting the installation:  **Required:*...`,
        score: 0.31,
        section: 'Documentation'
      },
      {
        title: 'Install Netdata with kickstart.sh',
  url: '/docs/netdata-agent/installation/linux',
  snippet: `import { OneLineInstallWget, OneLineInstallCurl } from '@site/src/components/OneLineInstall/' import { Install, InstallBox } from '@site/src/components/Install/' import Tabs from '@theme/Tabs'; import...`,
        score: 0.31,
        section: 'Documentation'
      },
      {
        title: 'Optional parameters to alter your installation - Connect node to Netdata Cloud during installation',
  url: '/docs/developer-and-contributor-corner/install-the-netdata-agent-from-a-git-checkout',
  snippet: `# run script with root privileges to build, install, start Netdata ## Optional parameters to alter your installation  ## Optional parameters to alter your installation  \`netdata-installer.sh\` accepts...`,
        score: 0.31,
        section: 'Documentation'
      },
      {
        title: 'Install Netdata on FreeBSD',
  url: '/docs/netdata-agent/installation/freebsd',
  snippet: `# Install Netdata on FreeBSD  > :bulb: This guide is community-maintained and might not always reflect the latest details (like package versions).   > Double-check before proceeding!   > Want to help? [Su...`,
        score: 0.31,
        section: 'Documentation'
      },
      {
        title: 'Install Netdata on Windows',
  url: '/docs/netdata-agent/installation/windows',
  snippet: `# Install Netdata on Windows  Netdata provides a simple Windows installer for quick setup.  :::note  The Windows Agent is available for users with paid Netdata subscriptions.   Free users will have li...`,
        score: 0.3,
        section: 'Documentation'
      },
      {
        title: 'Install Netdata on Offline Systems',
  url: '/docs/netdata-agent/installation/linux/offline-systems',
  snippet: `# Install Netdata on Offline Systems  This guide explains how to install Netdata Agent on systems without internet access.  Netdata supports offline installation of the Agent using our \`kickstart.sh\`...`,
        score: 0.3,
        section: 'Documentation'
      },
      {
        title: 'Netdata Cloud On-Prem PoC without Kubernetes',
  url: '/docs/netdata-cloud-on-prem/poc-without-k8s',
  snippet: `# Netdata Cloud On-Prem PoC without Kubernetes  These instructions show you how to install a lightweight version of Netdata Cloud when you don't have a Kubernetes cluster. This setup is **for demonstr...`,
        score: 0.3,
        section: 'Documentation'
      },
      {
        title: 'Example: Complete Installation on Ubuntu 22.04 (Jammy) - Step 1: Download the repository configuration package',
  url: '/docs/netdata-agent/installation/linux/native-linux-distribution-packages',
  snippet: `# Install Netdata Using Native DEB/RPM Packages ## Example: Complete Installation on Ubuntu 22.04 (Jammy)  ## Example: Complete Installation on Ubuntu 22.04 (Jammy)  <details> <summary>Click to view c...`,
        score: 0.3,
        section: 'Documentation'
      },
      {
        title: 'Install Netdata on Linux from a Git checkout - Prepare your system',
  url: '/docs/developer-and-contributor-corner/install-the-netdata-agent-from-a-git-checkout',
  snippet: `# Install Netdata on Linux from a Git checkout  To install the latest git version of Netdata, please follow these 2 steps:  1. [Prepare your system](#prepare-your-system)     Install the required pack...`,
        score: 0.29,
        section: 'Documentation'
      }
    ];

    try {
      const response = await fetch(`${apiUrl}/chat/docs/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() })
      });

      if (response.status === 404) {
        // Endpoint not available — surface static test results
  setSearchResults(staticFallbackResults.sort((a,b)=>(b.score||0)-(a.score||0)));
        setIsSearching(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      {
        const sorted = (data.results || []).slice().sort((a,b)=> (b.score||0) - (a.score||0));
        setSearchResults(sorted);
      }
    } catch (error) {
      console.error('Search error:', error);
      // For network/errors, keep behavior of empty results but still allow quick local testing:
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e, overrideMessage = null) => {
    e?.preventDefault();
    const message = overrideMessage || input.trim();
    if (!message || isLoading) return;

    // If in search mode (toggle is ON), handle as search instead of chat
    if (toggleOn) {
      // Preserve search text after sending
      await handleSearch(message);
      return;
    }

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
      let response = await fetch(`${apiUrl}/chat/docs/stream`, {
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

      // Fallback to agent-specific stream if the generic one isn't available
      if (!response.ok) {
        try {
          response = await fetch(`${apiUrl}/chat/docs/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                ...(() => {
                  const maxMessages = MAX_CONVERSATION_PAIRS * 2;
                  const recentMessages = messages.slice(-maxMessages);
                  return recentMessages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content }));
                })(),
                { role: 'user', content: message }
              ]
            })
          });
        } catch (err) {
          // ignore, handled by !ok below
        }
      }

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

  // Press Escape to start a new chat when viewing answers (welcome is hidden)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        if (!showWelcome) {
          try { e.preventDefault(); } catch (err) {}
          handleNewChat();
        }
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showWelcome, handleNewChat]);

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

  // Position the floating container: when the welcome screen is visible, anchor it near the top
  // with a sensible gap from the navbar; when not visible keep it centered.
  const TOP_BAR_GAP_PX = 88; // reasonable gap from topbar when visible (adjustable)
  // When search results are active, pin the input section nearer the top to maximize vertical space.
  // Consider panel "active" when we are in search mode and either loading, have results, or have a query entered (panel visible)
  const hasSearchPanelActive = toggleOn && (isSearching || searchResults.length > 0 || (searchQuery && !isSearching));
  const SEARCH_PIN_OFFSET_PX = -100; // tweak if you want a tiny gap below navbar
  const floatingPinnedTop = `calc(var(--ifm-navbar-height) + ${SEARCH_PIN_OFFSET_PX}px)`;
  const floatingTop = hasSearchPanelActive
    ? floatingPinnedTop
    : (showWelcome ? `${TOP_BAR_GAP_PX}px` : '25%');
  const floatingTransform = hasSearchPanelActive
    ? 'translate(-50%, 0)' // no vertical centering when pinned
    : (showWelcome ? 'translate(-50%, 0)' : 'translate(-50%, -50%)');

  const floatingContainerStyle = {
    position: 'absolute',
    left: '50%',
    top: floatingTop,
    transform: floatingTransform,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '800px',
    margin: '0',
    pointerEvents: 'auto',
    transition: 'top 420ms cubic-bezier(0.16,1,0.3,1), transform 420ms cubic-bezier(0.16,1,0.3,1)'
  };

  // Recompute suggestions anchor after mode or results visibility changes (pin/unpin & header show/hide)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      try {
        if (!floatingContainerRef.current || !containerRef.current) return;
        const fRect = floatingContainerRef.current.getBoundingClientRect();
        const cRect = containerRef.current.getBoundingClientRect();
        const top = Math.max(0, Math.round(fRect.bottom - cRect.top + 12));
        setSuggestionsTopPx(top);
      } catch (e) {}
    };
    // Run immediately and after transition duration to capture final layout
    update();
    const t = setTimeout(update, 440); // matches floating transition ~420ms
    return () => { try { clearTimeout(t); } catch (e) {} };
  }, [toggleOn, hasSearchPanelActive, isSearching, searchResults.length]);

  // Compute a pixel max-height for the search results panel so it never overflows
  // the visible viewport even when zoomed. We base it on the floating container's
  // bottom position (so results appear below the input) and reserve a small bottom gap.
  const [resultsMaxHeightPx, setResultsMaxHeightPx] = useState(null);
  const searchPanelRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      try {
        const bottomGap = 24; // px gap from bottom of the screen
        // Prefer to compute based on the actual rendered panel's top (handles transforms/zoom)
        const panelRect = searchPanelRef.current?.getBoundingClientRect();
        const topY = panelRect ? Math.max(0, panelRect.top) : (floatingContainerRef.current?.getBoundingClientRect().bottom || (TOP_BAR_GAP_PX + 12));
        // Use the full available viewport space under the panel's top, minus bottomGap
        const available = Math.max(0, window.innerHeight - topY - bottomGap);
        // Ensure a sensible minimum so the panel never becomes too small
        const maxH = Math.max(240, available);
        setResultsMaxHeightPx(maxH);
      } catch (e) {
        setResultsMaxHeightPx(null);
      }
    };

    // Run compute after layout to ensure refs measure correctly
    const raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute);
    };
  }, [floatingContainerRef.current, showWelcome, searchResults.length]);

  const welcomeTitleStyle = {
  // Leave color off here so individual titles use their computed colors (titleLeftColor/titleRightColor)
  fontSize: TITLE_FONT_SIZE,
  fontWeight: TITLE_FONT_WEIGHT,
  margin: 0,
    lineHeight: '1',
    whiteSpace: 'nowrap'
  };

  // Toggle (pill) styles
  const toggleWrapperStyle = {
    display: 'flex',
    alignItems: 'center'
  };

  const toggleTrackStyle = (on) => ({
    width: `${105 * TOGGLE_SIZE_MULTIPLIER}px`,
    height: `${40 * TOGGLE_SIZE_MULTIPLIER}px`,
    borderRadius: '999px',
    background: on ? effectiveSecondary : ASKNET_PRIMARY,
    boxShadow: on ? `0 6px 18px rgba(${currentAccentRgb}, 0.12)` : 'inset 0 1px 2px rgba(0,0,0,0.04)',
    padding: `${4 * TOGGLE_SIZE_MULTIPLIER}px`,
    position: 'relative',
    display: 'block',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'background 220ms ease, box-shadow 180ms ease',
    userSelect: 'none'
  });

  const toggleKnobStyle = (on) => ({
    width: `${30 * TOGGLE_SIZE_MULTIPLIER}px`,
    height: `${30 * TOGGLE_SIZE_MULTIPLIER}px`,
    borderRadius: '50%',
    background: isDarkMode ? '#0b1220' : '#fff',
    position: 'absolute',
    top: '50%',
    left: on
      ? `calc(100% - ${30 * TOGGLE_SIZE_MULTIPLIER + TOGGLE_KNOB_INSET_PX}px)`
      : `${TOGGLE_KNOB_INSET_PX}px`,
    transform: 'translateY(-50%)',
    transition: 'left 220ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms ease',
    boxShadow: '0 6px 12px rgba(11,18,32,0.12)'
  });

  // Toggle hint style (inside the track, opposite the knob)
  const toggleHintStyle = (on) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    left: on ? '10px' : 'auto',
    right: on ? 'auto' : '10px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '.4px',
    color: 'white',
    userSelect: 'none',
    pointerEvents: 'none'
  });

  const titleRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '800px',
  gap: TITLE_GAP
  };

  const secondTitleStyle = {
    fontSize: '15px',
    color: isDarkMode ? '#787b81ff' : '#6b7280',
    margin: 0,
    fontStyle: 'italic'
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
      ? ASKNET_SECOND
      : ASKNET_PRIMARY,
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
      ? `${inputContainerStyle.boxShadow}, 0 0 0 4px rgba(${currentAccentRgb}, 0.18), 0 0 18px rgba(${currentAccentRgb}, 0.12)`
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

  // Reserve horizontal space inside the absolute-positioned textarea area for the toggle + send button
  const TOGGLE_TRACK_WIDTH = 110 * TOGGLE_SIZE_MULTIPLIER; // keep in sync with toggleTrackStyle width
  const SEND_BUTTON_RESERVE = 50; // existing reserved space for send button
  const EXTRA_GAP_RESERVE = 24; // breathing room between text and toggle
  const RIGHT_RESERVE_TOTAL = TOGGLE_TRACK_WIDTH + SEND_BUTTON_RESERVE + EXTRA_GAP_RESERVE; // default reserve when toggle is visible

  const chatInputStyle = {
    position: 'absolute',
    top: '50%',
    left: '16px',
    right: `${RIGHT_RESERVE_TOTAL}px`,
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
    right: `${RIGHT_RESERVE_TOTAL}px`,
    fontSize: '16px',
  // Default placeholder color; keep green when hovered only
  color: (isSendHovered && !input.trim()) ? currentAccent : (isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'),
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
  background: currentAccent,
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
  boxShadow: isDarkMode ? '0 2px 10px rgba(0,0,0,0.6)' : `0 4px 18px rgba(${currentAccentRgb}, 0.28)`,
    flexShrink: 0
  };


  // Dimmed background color (solid) for light/dark modes
  // More prominent dimmed background so the inactive button reads as interactive
  const dimmedBg = isDarkMode ? `rgba(${currentAccentRgb}, 0.42)` : `rgba(${currentAccentRgb}, 0.28)`;
  const computedSendButtonStyle = {
    ...sendButtonStyle,
  background: input.trim() ? currentAccent : dimmedBg,
  // On hover, always show full accent background (unless disabled)
  ...(isSendHovered && !isLoading ? { background: currentAccent } : {}),
  transition: 'background 220ms ease, box-shadow 220ms ease'
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
  const renderInputForm = ({ attachRef = false, placeholderOverride = null, showToggle = true } = {}) => {
  const placeholderText = placeholderOverride !== null ? placeholderOverride : (toggleOn ? 'Enter search term' : (currentPlaceholder || "Ask anything about Netdata, in any language... (Shift+Enter for new line)"));
    const placeholderStyle = placeholderOverride !== null
      ? { ...animatedPlaceholderStyle, color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }
      : { ...animatedPlaceholderStyle, right: `${(showToggle ? TOGGLE_TRACK_WIDTH : 0) + SEND_BUTTON_RESERVE + EXTRA_GAP_RESERVE}px` };

    // When toggle is hidden, reduce the reserved right space for the textarea/placeholder
    const rightReservePx = (showToggle ? TOGGLE_TRACK_WIDTH : 0) + SEND_BUTTON_RESERVE + EXTRA_GAP_RESERVE;
    const localChatInputStyle = { ...chatInputStyle, right: `${rightReservePx}px` };

    // Wrapper styles to animate toggle hide/show smoothly
    const toggleWrapperAnimatedStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: showToggle ? `${TOGGLE_TRACK_WIDTH}px` : '0px',
      minWidth: showToggle ? `${TOGGLE_TRACK_WIDTH}px` : '0px',
      height: `${40 * TOGGLE_SIZE_MULTIPLIER}px`,
      marginRight: '0px',
      overflow: 'visible', // avoid clipping rounded corners
      opacity: showToggle ? 1 : 0,
      transform: showToggle ? 'translateY(0)' : 'translateY(4px)',
      transition: 'width 260ms ease, opacity 180ms ease, transform 220ms ease',
      pointerEvents: showToggle ? 'auto' : 'none'
    };

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
              style={{ ...localChatInputStyle, caretColor: isSendHovered ? 'transparent' : undefined }}
              rows={1}
              disabled={isLoading}
            />
          </div>
          {/* Toggle now positioned immediately before send button on right edge */}
          <div style={toggleWrapperAnimatedStyle} aria-hidden={!showToggle}>
            {showToggle && (
              <div
                role="switch"
                aria-checked={toggleOn}
                tabIndex={0}
                onClick={() => { setToggleOn(v=>!v); setTimeout(()=> (textareaRef.current||inputRef.current)?.focus(),0); }}
                onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); setToggleOn(v=>!v); } }}
                style={{ ...toggleTrackStyle(toggleOn), flexShrink:0 }}
                title="Toggle search / chat"
              >
                <div style={toggleHintStyle(toggleOn)}><span style={{
                  fontSize:11,fontWeight:600,letterSpacing:'.5px',padding:'3px 7px',borderRadius:6,background:'rgba(255,255,255,0.25)',color:'#fff',lineHeight:1, userSelect:'none'
                }}>{SHORTCUT_LABEL}</span></div>
                <div style={toggleKnobStyle(toggleOn)} />
              </div>
            )}
          </div>
          <button
            type="button"
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

  @keyframes fadeIn { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes slideUpIn { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0px); opacity: 1; } }
  @keyframes slideUpInSmooth { 0% { transform: translateY(40px) scale(0.96); opacity: 0; filter: blur(1px); } 60% { transform: translateY(-2px) scale(1.01); opacity: 0.8; filter: blur(0px); } 100% { transform: translateY(0px) scale(1); opacity: 1; filter: blur(0px); } }
  `}</style>
  <div ref={chatAreaRef} style={computedChatAreaStyle}>
    {/* Fixed bottom-center notice visible in both welcome and messages views */}
  {showWelcome && (
          <div aria-hidden style={{
            position: 'fixed',
            bottom: isDocked ? (dockSize ? `calc(${dockSize.height}px + 20px)` : '100px') : '12px',
            left: noticeLeftPx ? `${noticeLeftPx}px` : '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 1300,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 12px',
            boxSizing: 'border-box',
            width: noticeWidthPx ? `${noticeWidthPx}px` : '100%',
            transition: 'opacity 240ms ease, visibility 240ms',
            opacity: toggleOn ? 0 : 1,
            visibility: toggleOn ? 'hidden' : 'visible'
          }}>
            <div style={{
              fontSize: '12px',
              color: isDarkMode ? 'rgba(255,255,255,0.78)' : 'rgba(0,0,0,0.72)',
              background: 'transparent',
              padding: '4px 8px',
              borderRadius: '6px',
              maxWidth: '800px',
              textAlign: 'center',
              width: '100%'
            }}>
              <div style={{ transition: 'opacity 220ms ease', opacity: toggleOn ? 0.18 : 1 }}>
                AI can make mistakes - please validate before use. Ask-netdata is multilingual so use it in your language!
              </div>

            </div>
          </div>
        )}
        {showWelcome ? (
          <div>
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
                {/* header structure: toggle above titles */}
                {!hasSearchPanelActive && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                      {/* Titles row */}
                      <div style={titleRowStyle}>
                        <div style={{ ...welcomeTitleStyle, fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT, color: titleLeftColor, transition: 'opacity 220ms ease, color 220ms ease' }}>{HEADER_TITLES.left}</div>
                        <div style={{ ...welcomeTitleStyle, fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT, color: titleRightColor, transition: 'opacity 220ms ease, color 220ms ease' }}>{HEADER_TITLES.right}</div>
                      </div>
                      {!HIDE_SUBTITLE && <p style={secondTitleStyle}>{titleSubtitle}</p>}
                    </div>
                )}
              </div>

              {renderInputForm({ attachRef: true, showToggle: !hasSearchPanelActive })}
              
              {/* Search results display */}
              {toggleOn && (searchResults.length > 0 || isSearching || (searchQuery && !isSearching)) && (
                <div
                  ref={searchPanelRef}
                  tabIndex={0}
                  style={{
                    maxWidth: '1000px',
                    width: '100%',
                    margin: hasSearchPanelActive ? '0.4rem auto 0' : '2rem auto 0',
                    padding: '1rem',
                    paddingBottom: '24px',
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    borderRadius: '10px',
                    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e5e7eb',
                    transform: hasSearchPanelActive ? 'translateY(0)' : 'translateY(0)',
                    opacity: 1,
                    transition: 'margin 420ms cubic-bezier(0.16,1,0.3,1)',
                    animation: 'fadeIn 220ms ease both, slideUpInSmooth 480ms cubic-bezier(0.16,1,0.3,1) both',
                    maxHeight: hasSearchPanelActive ? 'calc(100vh - (var(--ifm-navbar-height) + 140px))' : (resultsMaxHeightPx ? `${resultsMaxHeightPx}px` : '60vh'),
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'contain',
                    scrollbarWidth: 'thin',
                    pointerEvents: 'auto',
                    color: isDarkMode ? undefined : 'rgba(17,24,39,0.92)'
                  }}
                >
                  {isSearching ? (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, padding:'1.6rem 0 2rem 0' }}>
                      <div style={{ fontSize:'0.95rem', opacity:0.8 }}>Searching documentation...</div>
                      <div style={{ position:'relative', width:300, height:4, overflow:'hidden', borderRadius:2, background:'rgba(156,163,175,0.25)' }}>
                        <div style={{ position:'absolute', top:0, left:0, width:100, height:'100%', background: currentAccent, animation:'scanBackForth 2s ease-in-out infinite', boxShadow:`0 0 10px rgba(${currentAccentRgb},0.6),0 0 20px rgba(${currentAccentRgb},0.35)` }} />
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div style={{
                        marginBottom: '1rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#ffffff' : '#0f172a'
                      }}>
                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {searchResults.map((result, index) => (
                          <div key={index} style={{
                            padding: '1rem',
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                            borderRadius: '6px',
                            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e6eaf0',
                            transition: 'background-color 0.2s ease',
                            boxShadow: isDarkMode ? undefined : '0 1px 4px rgba(2,6,23,0.04)',
                            animation: 'slideUpIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both',
                            animationDelay: `${index * 60}ms`
                          }}>
                            <a
                              href={result.url}
                              style={{
                                color: ASKNET_SECOND,
                                textDecoration: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                display: 'block',
                                marginBottom: '0.5rem',
                                transition: 'color 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.color = '#66bb6a'}
                              onMouseLeave={(e) => e.target.style.color = ASKNET_SECOND}
                            >
                              {result.title}
                            </a>
                            {(() => {
                              const cleanSnippet = (snippet) => {
                                if(!snippet) return '';
                                let s = snippet.replace(/\r/g,'').trimStart();
                                const fmMatch = s.match(/^---[\s\S]*?\n---\s*/);
                                if(fmMatch) s = s.slice(fmMatch[0].length);
                                // Remove metadata header key: value lines
                                let lines = s.split('\n');
                                let removed = false;
                                while(lines.length) {
                                  const L = lines[0].trim();
                                  if(!L) { lines.shift(); removed = true; continue; }
                                  if(/^[A-Za-z0-9_\-]+:/.test(L) && !L.startsWith('#') && L.length < 300) { lines.shift(); removed = true; continue; }
                                  break;
                                }
                                if(removed) s = lines.join('\n');
                                s = s.replace(/^---+\s*/,'');
                                s = s.replace(/```[\s\S]*?```/g,' '); // fenced code
                                s = s.replace(/`([^`]+)`/g,'$1'); // inline code
                                s = s.replace(/\[([^\]]+)\]\([^\)]+\)/g,'$1'); // links
                                s = s.replace(/<[^>]+>/g,' '); // html tags
                                s = s.replace(/^#+\s+/gm,''); // headings
                                s = s.replace(/\*{1,3}([^*_`]+)\*{1,3}/g,'$1').replace(/_{1,3}([^*_`]+)_{1,3}/g,'$1'); // emphasis
                                s = s.replace(/^\s*[-*+]\s+/gm,''); // bullets
                                s = s.replace(/\s+/g,' ').trim();
                                return s;
                              };
                              const body = cleanSnippet(result.snippet);
                              if(!body) return null;
                              const truncated = body.length > 400 ? body.slice(0,400).trim() + '…' : body;
                              return (
                                <p style={{
                                  color: isDarkMode ? 'rgba(255, 255, 255, 0.78)' : 'rgba(2,6,23,0.72)',
                                  fontSize: '0.7rem',
                                  lineHeight: '1.3',
                                  margin: 0
                                }}>{truncated}</p>
                              );
                            })()}
                            {/* Breadcrumb for learn_rel_path */}
                            {result.learn_rel_path && (
                              <div style={{
                                marginTop: '0.5rem',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                letterSpacing: '.5px',
                                opacity: 0.6,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                flexWrap: 'wrap'
                              }}>
                                {result.learn_rel_path.split('/').filter(Boolean).map((part, idx, arr) => (
                                  <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <span style={{
                                      padding: '2px 6px',
                                      borderRadius: 4,
                                      background: isDarkMode ? 'rgba(164, 164, 164, 0.25)' : 'rgba(0,0,0,0.08)',
                                      color: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)',
                                      lineHeight: 1,
                                      userSelect: 'none'
                                    }}>
                                      {part.trim()}
                                    </span>
                                    {idx < arr.length - 1 && (
                                      <span style={{ opacity: 0.4, fontSize: '0.5rem' }}>/</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                            {SHOW_SEARCH_RELEVANCE_SCORE && result.score && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(2,6,23,0.45)',
                                marginTop: '0.5rem'
                              }}>
                                Relevance: {Math.round(result.score * 100)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '1.6rem',
                      color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(2,6,23,0.8)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                        No results for "{searchQuery}"
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        Try different keywords or check your spelling. Press Esc to clear.
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => { setSearchResults([]); setSearchQuery(''); setIsSearching(false); setInput(''); try { (textareaRef.current || inputRef.current)?.focus(); } catch (_) {} }}
                          style={{
                            background: 'transparent',
                            border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e5e7eb',
                            color: isDarkMode ? 'rgba(255,255,255,0.9)' : '#111827',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : '#f9fafb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                  <div style={{ transition: 'opacity 280ms ease, transform 280ms ease', opacity: toggleOn ? 0 : 1, transform: toggleOn ? 'translateY(6px)' : 'translateY(0)', pointerEvents: toggleOn ? 'none' : 'auto' }}>
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
                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = currentAccent; e.currentTarget.style.backgroundColor = isDarkMode ? `rgba(${currentAccentRgb}, 0.08)` : '#f0fff4'; }}
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
            </div>

          </div>
        ) : (
          <div style={computedMessagesContainerStyle}>
            {messages.length > 0 && (
              <div style={{ textAlign: 'right', marginBottom: '20px', position: 'sticky', top: 'calc(var(--ifm-navbar-height) + 12px)', zIndex: 1100 }}>
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
                    transition: 'all 0.28s ease',
                    // Ensure it stays clickable when overlapping content
                    pointerEvents: 'auto'
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
                      background: '#dc2626'
                    } : {})
                  }}>
                    {message.isError ? '⚠' : (message.type === 'user' ? 'U' : 'N')}
                  </div>
                  <div style={{ 
                    flex: 1, 
                    minWidth: 0, // Critical: allows flex item to shrink below content size
                    maxWidth: '100%',
                    overflow: 'visible', // Allow inline overlays (feedback box) to be visible
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
                    {/* Citations removed: hide 'Learn more' footer block per UX request */}
                    {/* Feedback actions: copy, thumbs up, thumbs down (use same SVGs as widget) */}
                    {message.type === 'assistant' && (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* Copy button - simple copy of rendered markdown */}
                          <button
                            className="feedback-btn copy-btn"
                            onMouseEnter={() => setHoveredButton(`${message.id}:copy`)}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={async () => {
                              try {
                                const temp = document.createElement('div');
                                temp.innerHTML = (message.content || '');
                                const plain = temp.textContent || temp.innerText || '';
                                await navigator.clipboard.writeText(plain);
                                // show transient copied state
                                setCopiedState(prev => ({ ...prev, [message.id]: true }));
                                if (copiedTimersRef.current[message.id]) clearTimeout(copiedTimersRef.current[message.id]);
                                copiedTimersRef.current[message.id] = setTimeout(() => {
                                  setCopiedState(prev => ({ ...prev, [message.id]: false }));
                                  delete copiedTimersRef.current[message.id];
                                }, 1000);
                              } catch (e) { console.error(e); }
                            }}
                            style={{
                              border: 'none',
                              background: hoveredButton === `${message.id}:copy` ? 'var(--feedback-hover, #f8fafc)' : 'transparent',
                              padding: 6,
                              borderRadius: 6,
                              cursor: 'pointer',
                              opacity: hoveredButton === `${message.id}:copy` ? 0.9 : 0.7
                            }}
                          >
                            <span style={{ display: 'inline-block', width: 20, height: 20, position: 'relative' }}>
                              {/* Copy icon (fades out when copied) */}
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" style={{ position: 'absolute', left: 0, top: 0, stroke: hoveredButton === `${message.id}:copy` ? 'var(--fg, #1a1a1a)' : 'var(--muted, #6b7280)', fill: 'none', strokeWidth: 1.5, transform: copiedState[message.id] ? 'scale(0.85)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 180ms ease, opacity 180ms ease', opacity: copiedState[message.id] ? 0 : 1, pointerEvents: 'none' }}>
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              {/* Black checkmark icon (fades in when copied) */}
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" style={{ position: 'absolute', left: 0, top: 0, stroke: '#000', fill: 'none', strokeWidth: 2.5, transform: copiedState[message.id] ? 'scale(1.05)' : 'scale(0.85)', transformOrigin: 'center', transition: 'transform 180ms ease, opacity 180ms ease', opacity: copiedState[message.id] ? 1 : 0, pointerEvents: 'none' }}>
                                <path d="M20 6L9 17l-5-5" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          </button>

                          {/* Thumbs up */}
                          <button
                            className={`feedback-btn thumbs-up ${feedbackState[message.id]?.rating === 'positive' ? 'active' : ''}`}
                            onMouseEnter={() => setHoveredButton(`${message.id}:up`)}
                            onMouseLeave={() => setHoveredButton(null)}
                            onClick={async () => {
                              if (feedbackState[message.id] && feedbackState[message.id].sending) return;
                              setFeedbackState(prev => ({ ...prev, [message.id]: { ...(prev[message.id]||{}), sending: true } }));
                              const question = messages.slice().reverse().find(m => m.type === 'user')?.content || '';
                              await postFeedback({ question, answer: message.content, rating: 'positive', citations: message.citations || [] });
                              setFeedbackState(prev => ({ ...prev, [message.id]: { ...(prev[message.id]||{}), sending: false, sent: true, rating: 'positive' } }));
                            }}
                            style={{
                              border: 'none',
                              background: (feedbackState[message.id]?.rating === 'positive') ? 'var(--feedback-active, #e5f9f0)' : (hoveredButton === `${message.id}:up` ? 'var(--feedback-hover, #f8fafc)' : 'transparent'),
                              padding: 6,
                              borderRadius: 6,
                              cursor: 'pointer',
                              opacity: (feedbackState[message.id]?.rating === 'positive' || hoveredButton === `${message.id}:up`) ? 1 : 0.7
                            }}
                          aria-label="Thumbs up"
                          title="Good answer"
                          >
                            <svg role="img" aria-hidden={false} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" style={{ pointerEvents: 'none', stroke: hoveredButton === `${message.id}:up` ? 'var(--fg, #1a1a1a)' : 'var(--muted, #6b7280)', fill: feedbackState[message.id]?.rating === 'positive' ? effectiveSecondary : 'none', strokeWidth: 2, transition: 'all 0.2s ease' }}>
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                          </button>

                          {/* Thumbs down */}
                          <div style={{ position: 'relative' }}>
                            <button
                              className={`feedback-btn thumbs-down ${feedbackState[message.id]?.rating === 'negative' ? 'active' : ''}`}
                              onMouseEnter={() => setHoveredButton(`${message.id}:down`)}
                              onMouseLeave={() => setHoveredButton(null)}
                              onClick={() => {
                                setCommentBoxOpen(prev => ({ ...prev, [message.id]: !prev[message.id] }));
                                setCommentDraft(prev => ({ ...prev, [message.id]: prev[message.id] || '' }));
                              }}
                              style={{
                                border: 'none',
                                background: (feedbackState[message.id]?.rating === 'negative') ? 'var(--feedback-active, #e5f9f0)' : (hoveredButton === `${message.id}:down` ? 'var(--feedback-hover, #f8fafc)' : 'transparent'),
                                padding: 6,
                                borderRadius: 6,
                                cursor: 'pointer',
                                opacity: (feedbackState[message.id]?.rating === 'negative' || hoveredButton === `${message.id}:down`) ? 1 : 0.7
                              }}
                          aria-label="Thumbs down"
                          title="Could be better"
                            >
                              <svg role="img" aria-hidden={false} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" style={{ pointerEvents: 'none', stroke: hoveredButton === `${message.id}:down` ? 'var(--fg, #1a1a1a)' : 'var(--muted, #6b7280)', fill: feedbackState[message.id]?.rating === 'negative' ? '#dc2626' : 'none', strokeWidth: 2, transition: 'all 0.2s ease' }}>
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                              </svg>
                            </button>

                          </div>
                        </div>

                        {/* Compact expandable comment box: small footprint by default, expands when opened */}
                        <div style={{ minHeight: '28px', marginTop: 8 }}>
                          <div style={{
                            maxHeight: commentBoxOpen[message.id] ? '260px' : '0px',
                            overflow: 'hidden',
                            transition: 'max-height 220ms ease, padding 160ms ease, opacity 160ms ease',
                            opacity: commentBoxOpen[message.id] ? 1 : 0,
                            position: 'relative',
                            background: isDarkMode ? 'var(--ifm-background-surface-color)' : 'white',
                            border: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
                            padding: commentBoxOpen[message.id] ? '8px' : '0px 8px',
                            borderRadius: '8px',
                            minWidth: '260px',
                            boxShadow: commentBoxOpen[message.id] ? '0 6px 24px rgba(0,0,0,0.08)' : 'none',
                            zIndex: 999
                          }}>
                            <textarea
                              value={commentDraft[message.id] || ''}
                              onChange={(e) => setCommentDraft(prev => ({ ...prev, [message.id]: e.target.value }))}
                              placeholder="What could be improved? Your feedback helps us enhance our responses."
                              rows={3}
                              style={{ width: '100%', resize: 'vertical', fontSize: '13px', padding: '8px', borderRadius: '6px', border: '1px solid var(--muted)', opacity: commentBoxOpen[message.id] ? 1 : 0, transition: 'opacity 120ms ease' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px', opacity: commentBoxOpen[message.id] ? 1 : 0, transition: 'opacity 120ms ease' }}>
                              <button onClick={() => setCommentBoxOpen(prev => ({ ...prev, [message.id]: false }))} style={{ background: 'transparent', border: '1px solid var(--muted)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                              <button onClick={async () => {
                                if (feedbackState[message.id] && feedbackState[message.id].sending) return;
                                setFeedbackState(prev => ({ ...prev, [message.id]: { ...(prev[message.id]||{}), sending: true } }));
                                const question = messages.slice().reverse().find(m => m.type === 'user')?.content || '';
                                await postFeedback({ question, answer: message.content, rating: 'negative', comment: commentDraft[message.id] || '', citations: message.citations || [] });
                                setFeedbackState(prev => ({ ...prev, [message.id]: { ...(prev[message.id]||{}), sending: false, sent: true, rating: 'negative' } }));
                                setCommentBoxOpen(prev => ({ ...prev, [message.id]: false }));
                                setCommentDraft(prev => ({ ...prev, [message.id]: '' }));
                              }} style={{ background: currentAccent, color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}>Submit</button>
                            </div>
                          </div>
                        </div>
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
                {renderInputForm({ attachRef: false, placeholderOverride: 'Reply / Ask something else', showToggle: false })}
              </div>
            )}

            {/* When docked, show the real input inside the messages area */}
            {!isAnimatingDock && isDocked && (
              <div style={{ marginTop: '12px', padding: '8px 20px', width: '100%', maxWidth: dockSize ? `${dockSize.width}px` : '800px', marginLeft: 'auto', marginRight: 'auto', height: dockSize ? `${dockSize.height}px` : undefined }}>
                {renderInputForm({ attachRef: true, placeholderOverride: 'Reply / Ask something else', showToggle: false })}
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
                    background: currentAccent,
                    animation: 'scanBackForth 2s ease-in-out infinite',
                    boxShadow: `0 0 10px rgba(${currentAccentRgb}, 0.32), 0 0 20px rgba(${currentAccentRgb}, 0.16)`
                  }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            {/* Footer-like notice anchored under conversation on answer page */}
            {!showWelcome && (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '12px', padding: '8px 20px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '12px', color: isDarkMode ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)', maxWidth: '800px', textAlign: 'center', width: '100%' }}>
                  AI can make mistakes - please validate before use. Our model is also multi-lingual so use it in your language!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
