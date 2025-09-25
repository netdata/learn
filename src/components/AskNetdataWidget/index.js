import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { useColorMode } from '@docusaurus/theme-common';
// Centralized Ask Netdata color constants
import { ASKNET_PRIMARY, ASKNET_SECOND, rgba, rgbString, OPACITY } from '../AskNetdata/colors';

// Top pill variant replicating main Ask Netdata input (colors/animations) for all docs pages.
// Renders a single pill under navbar. Answers & search results float above docs content.

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

// Ensure widget has the same API base and conversation limit constants as the main component
const API_BASE = getApiBase();
const MAX_CONVERSATION_PAIRS = 3;


const SHORTCUT_LABEL = (() => {
  if (typeof navigator !== 'undefined') {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    return isMac ? '⌘ + /' : 'Ctrl + /';
  }
  return 'Ctrl + /';
})();
// Dynamic focus shortcut (Ctrl/⌘ + K)
const FOCUS_SHORTCUT_LABEL = (() => {
  if (typeof navigator !== 'undefined') {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    return isMac ? '⌘ + K' : 'Ctrl + K';
  }
  return 'Ctrl + K';
})();
// Sizing constants to mirror main page input height & allow easy tuning
const TOGGLE_TRACK_WIDTH = 98; // exported constant for toggle width
const TOGGLE_TRACK_HEIGHT = 45; // exported constant for toggle height
const TOGGLE_KNOB_SIZE = 35; // knob diameter
// Overlay positioning constants
const OVERLAY_GAP_PX = 16; // vertical gap between the pill and the overlay panel
// Panel outline (applies to whole container for both answers and search results)
const PANEL_OUTLINE_WIDTH = 4; // px
const PANEL_OUTLINE_OPACITY = 0.28; // 0..1
// Adaptive corner radius for the overlay panel: reduce roundness as content grows
// Feature flags
const SHOW_SEARCH_RELEVANCE_SCORE = false; // Set to false to hide relevance scores in search results
const PANEL_BASE_RADIUS = 24; // small content
const PANEL_MIN_RADIUS = 12;  // very tall content
// Mobile sizing
const MOBILE_MIN_HEIGHT = 300; // px minimum mobile panel height
// Animation durations
const PANEL_OPEN_ANIM_MS = 320;
const PANEL_CLOSE_ANIM_MS = 260;
// Adaptive corner radius for the input pill when it grows tall due to multi-line input
const PILL_TALL_START = 56;   // px height where we start relaxing the capsule corners
const PILL_MIN_RADIUS = 14;   // px min radius for very tall pills
const PILL_MAX_CAPSULE = 999; // fully rounded capsule for short pills

// Add a constant for mobile font size
const MOBILE_FONT_SIZE = 11; // px
const MOBILE_CHATBOX_WIDTH = 90; // Mobile chatbox width as a percentage

export default function AskNetdataWidget({ pillHeight = 40, pillMaxWidth = 50, overlayMaxWidth = 1000, panelPct = 25, onOverlayVisibilityChange }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const history = useHistory();

  // Smart internal/external link handling (same behavior as main AskNetdata)
  const SmartLink = ({ href, children, ...props }) => {
    const isInternal = href && (
      href.startsWith('https://learn.netdata.cloud/docs/') ||
      href.startsWith('http://learn.netdata.cloud/docs/') ||
      href.startsWith('/docs/')
    );
    if (isInternal) {
      let internalPath = href;
      if (href.includes('learn.netdata.cloud/docs/')) {
        internalPath = href.substring(href.indexOf('/docs/'));
      }
      const onClick = (e) => {
        e.preventDefault();
  // Do not close the overlay when navigating internal docs — keep the panel open
  history.push(internalPath);
      };
      return (
        <Link to={internalPath} onClick={onClick} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  };

  // Core state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [toggleOn, setToggleOn] = useState(false); // search mode
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSendHovered, setIsSendHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false); // answers/search results overlay visibility
  const [isOverlayClosing, setIsOverlayClosing] = useState(false); // play closing animation
  const [feedbackState, setFeedbackState] = useState({});
  const [commentBoxOpen, setCommentBoxOpen] = useState({});
  const [commentDraft, setCommentDraft] = useState({});
  const copiedTimersRef = useRef({});
  const [copiedState, setCopiedState] = useState({});
  const chatAbortRef = useRef(null); // abort controller for streaming chat
  const overlayCloseTimerRef = useRef(null);

  const textareaRef = useRef(null);
  const pillRef = useRef(null);
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const sendHoverRef = useRef(false);
  const messagesBottomRef = useRef(null);
  const currentAccent = toggleOn ? ASKNET_SECOND : ASKNET_PRIMARY;
  const currentAccentRgb = rgbString(currentAccent);
  // Derived sizing based on configurable pillHeight (baseline 44)
  const sizeRatio = pillHeight / 44;
  const effectiveTrackHeight = Math.round(TOGGLE_TRACK_HEIGHT * sizeRatio);
  const effectiveKnobSize = Math.round(TOGGLE_KNOB_SIZE * sizeRatio);

  // Notify parent when overlay visibility changes
  useEffect(() => {
    const effectiveVisible = showOverlay && !isOverlayClosing;
    if (onOverlayVisibilityChange) {
      onOverlayVisibilityChange(effectiveVisible);
    }
  }, [showOverlay, isOverlayClosing, onOverlayVisibilityChange]);

  // Remove auto-focus on load (accessibility & user preference) and add keyboard shortcuts
  useEffect(() => {
    const onGlobalKey = (e) => {
      // Toggle mode with Ctrl+/ (existing behavior preserved)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setToggleOn(v => !v);
        setTimeout(() => textareaRef.current?.focus(), 0);
        return;
      }
      // Focus caret with Ctrl+K (robust across browsers: also prevent default to block browser search)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        // Open overlay only if there is existing content or we are in search mode; otherwise just focus pill
        if (!showOverlay && !isOverlayClosing) {
          // Do not implicitly submit anything, just reveal overlay framework for continuity if messages exist
          if (messages.length > 0 || searchResults.length > 0) setShowOverlay(true);
        }
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [showOverlay, isOverlayClosing, messages.length, searchResults.length]);

  // Compute horizontal shift so the overlay aligns under the navbar pill even at different zooms
  const [overlayShiftX, setOverlayShiftX] = useState(0);
  // (overlay is flush to viewport right edge)
  // panelPct: percent (0-100) of available docs/content width the panel should occupy
  const [panelWidth, setPanelWidth] = useState(() => Math.min(overlayMaxWidth, Math.floor((typeof window !== 'undefined' ? Math.min(window.innerWidth, overlayMaxWidth || 560) : 560) * (panelPct / 100))));
  const [panelHeight, setPanelHeight] = useState(() => {
    try {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  // Increase mobile default so at least one result card is visible on open
  return Math.max(MOBILE_MIN_HEIGHT, Math.floor(vh * (panelPct / 100)));
    } catch { return 320; }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [resizerHover, setResizerHover] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 720 : false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const dragStartYRef = useRef(0);
  const dragStartHeightRef = useRef(0);
  const isMobileRef = useRef(isMobile);

  // Drag handlers (mouse + touch) to resize panelWidth
  const clampPanelWidth = (w) => {
    const vw = window.innerWidth;
    // If narrow screen (<720) we treat as full-width drawer
    if (vw < 720) return Math.max(0, Math.min(w, vw));
    const min = 320; // keep some content visible
    const max = Math.min(overlayMaxWidth || 560, Math.max(360, Math.floor(vw * 0.9)));
    return Math.max(min, Math.min(w, max));
  };

  const clampPanelHeight = (h) => {
    const vh = window.innerHeight;
  const min = 240; // raise minimum so a result is visible
  const max = Math.max(320, Math.floor(vh * 0.9));
    return Math.max(min, Math.min(h, max));
  };

  const onDragMove = (clientX) => {
    const dx = dragStartXRef.current - clientX; // dragging left increases width
    const newW = clampPanelWidth(dragStartWidthRef.current + dx);
    setPanelWidth(newW);
  };

  const onDragMoveVertical = (clientY) => {
    const dy = dragStartYRef.current - clientY; // dragging up increases height
    const newH = clampPanelHeight(dragStartHeightRef.current + dy);
    setPanelHeight(newH);
  };

  const stopDragging = () => {
    setIsDragging(false);
    try {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
      window.removeEventListener('touchmove', touchMove, { passive: false });
      window.removeEventListener('touchend', touchEnd);
    } catch {}
  };

  const mouseMove = (e) => { e.preventDefault(); if (isMobileRef.current) onDragMoveVertical(e.clientY); else onDragMove(e.clientX); };
  const mouseUp = (e) => { e.preventDefault(); stopDragging(); };
  const touchMove = (e) => { if (e.touches && e.touches[0]) { e.preventDefault(); if (isMobileRef.current) onDragMoveVertical(e.touches[0].clientY); else onDragMove(e.touches[0].clientX); } };
  const touchEnd = () => { stopDragging(); };

  const startDragging = (startX) => (e) => {
    e.preventDefault();
    setIsDragging(true);
    isMobileRef.current = isMobile;
    dragStartXRef.current = startX;
    dragStartWidthRef.current = panelWidth;
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  };
  const startDraggingTouch = (e) => {
    if (!(e.touches && e.touches[0])) return;
    setIsDragging(true);
    isMobileRef.current = isMobile;
    if (isMobile) {
      dragStartYRef.current = e.touches[0].clientY;
      dragStartHeightRef.current = panelHeight;
    } else {
      dragStartXRef.current = e.touches[0].clientX;
      dragStartWidthRef.current = panelWidth;
    }
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd);
  };
  // vertical mouse start
  const startDraggingVertical = (startY) => (e) => {
    e.preventDefault();
    setIsDragging(true);
    isMobileRef.current = true;
    dragStartYRef.current = startY;
    dragStartHeightRef.current = panelHeight;
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  };
  // Refs for content padding/animation management
  const contentTargetRef = useRef(null);
  const prevPaddingRef = useRef(null);
  const addedAnimateClassRef = useRef(false);
  const closeTimerRef = useRef(null);
  useEffect(() => {
    // For right-docked panel we only need to ensure it stays within viewport when resizing.
    const computeShift = () => {
      try {
        // no-op for now but keep hook to respond to resize/scroll if needed in future
        setOverlayShiftX(0);
      } catch {}
    };
    const computeWidth = () => {
      try {
        const vw = window.innerWidth;
        setIsMobile(vw < 720);
        // If narrow screen, use full width for the panel (behave like a drawer)
        if (vw < 720) {
          // treat as bottom drawer: set panel to full width and compute panelHeight
          setPanelWidth(vw);
          const vh = window.innerHeight;
          const targetH = Math.max(MOBILE_MIN_HEIGHT, Math.floor(vh * (panelPct / 100)));
          setPanelHeight(clampPanelHeight(targetH));
          return;
        }
        // Try to measure the docs container width to compute percentage-based panel width
        const selectors = ['.theme-docs-wrapper', '.theme-docs', '.main-wrapper', '.container', '#__docusaurus'];
        let contentEl = null;
        for (const s of selectors) {
          const el = document.querySelector(s);
          if (el) { contentEl = el; break; }
        }
        const contentWidth = contentEl ? Math.max(360, Math.floor(contentEl.getBoundingClientRect().width)) : Math.floor(vw * 0.7);
  // No overlay right-gap computation; keep overlay flush to viewport edge.
        const target = Math.max(320, Math.min(overlayMaxWidth || 560, Math.floor(contentWidth * (panelPct / 100))));
        setPanelWidth(clampPanelWidth(target));
      } catch { }
    };
    computeShift();
    computeWidth();
    window.addEventListener('resize', computeShift);
    window.addEventListener('scroll', computeShift, true);
    window.addEventListener('resize', computeWidth);
    window.addEventListener('orientationchange', computeWidth);
    return () => {
      window.removeEventListener('resize', computeShift);
      window.removeEventListener('scroll', computeShift, true);
      window.removeEventListener('resize', computeWidth);
      window.removeEventListener('orientationchange', computeWidth);
    };
  }, [showOverlay, pillHeight, toggleOn]);

  // Push page content when overlay open by adding padding-right to the main content container
  useEffect(() => {
    // Common container selectors in Docusaurus / Learn layout
    const selectors = [
      '.theme-docs-wrapper',
      '.theme-docs',
      '.main-wrapper',
      '.container',
      '#__docusaurus'
    ];
    let target = null;
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el) { target = el; break; }
    }
    if (!target) target = document.body;

  // store refs for cleanup
  contentTargetRef.current = target;
  // store previous padding if not already stored (use bottom for mobile)
  if (prevPaddingRef.current === null) prevPaddingRef.current = isMobile ? (target.style.paddingBottom || '') : (target.style.paddingRight || '');

    // add animate class if missing
    const hadAnimateClass = target.classList.contains('asknet-content-animate');
    if (!hadAnimateClass) { target.classList.add('asknet-content-animate'); addedAnimateClassRef.current = true; }

    // clear any existing close timer
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }

    if (showOverlay && !isOverlayClosing) {
      if (isMobile) {
        target.style.paddingBottom = panelHeight + 'px';
      } else {
        target.style.paddingRight = panelWidth + 'px';
      }
    } else {
      if (isOverlayClosing) {
        // keep padding for closing animation, then restore
        closeTimerRef.current = setTimeout(() => {
          try { target.style.paddingRight = prevPaddingRef.current || ''; } catch {}
          if (addedAnimateClassRef.current) target.classList.remove('asknet-content-animate');
          addedAnimateClassRef.current = false;
          prevPaddingRef.current = null;
          closeTimerRef.current = null;
        }, PANEL_CLOSE_ANIM_MS);
      } else {
        try {
          if (isMobile) target.style.paddingBottom = prevPaddingRef.current || ''; else target.style.paddingRight = prevPaddingRef.current || '';
        } catch {}
        if (addedAnimateClassRef.current) target.classList.remove('asknet-content-animate');
        addedAnimateClassRef.current = false;
        prevPaddingRef.current = null;
      }
    }

    return () => {
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      if (contentTargetRef.current) {
  try { if (isMobile) contentTargetRef.current.style.paddingBottom = prevPaddingRef.current || ''; else contentTargetRef.current.style.paddingRight = prevPaddingRef.current || ''; } catch {}
        if (addedAnimateClassRef.current) contentTargetRef.current.classList.remove('asknet-content-animate');
      }
      prevPaddingRef.current = null;
      addedAnimateClassRef.current = false;
      contentTargetRef.current = null;
    };
  }, [showOverlay, isOverlayClosing, panelWidth]);

  // Auto-resize textarea height like main page
  const adjustTextareaHeight = () => {
    const ta = textareaRef.current; if (!ta) return;
    ta.style.height = 'auto';
    const maxH = 200; // match main behaviour
    const newH = Math.min(ta.scrollHeight, maxH);
    ta.style.height = newH + 'px';
  };
  useEffect(() => { adjustTextareaHeight(); }, [input]);

  // Adapt panel corner radius to content height (less rounded when tall for readability)
  const [panelRadius, setPanelRadius] = useState(PANEL_BASE_RADIUS);
  useEffect(() => {
    const computeRadius = () => {
      try {
        const r = panelRef.current?.getBoundingClientRect();
        if (!r) { setPanelRadius(PANEL_BASE_RADIUS); return; }
        // Reduce radius gradually as height increases beyond a comfortable reading height
        const excess = Math.max(0, r.height - 320); // start relaxing after ~320px height
        const reduction = Math.min(PANEL_BASE_RADIUS - PANEL_MIN_RADIUS, Math.floor(excess / 120) * 4); // -4px per +120px
        setPanelRadius(PANEL_BASE_RADIUS - reduction);
      } catch { setPanelRadius(PANEL_BASE_RADIUS); }
    };
    // Run after layout settles
    const raf = requestAnimationFrame(computeRadius);
    window.addEventListener('resize', computeRadius);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', computeRadius); };
  }, [messages, searchResults, isSearching, toggleOn, showOverlay]);

  // Adapt pill corner radius when the input grows to multiple lines
  const [pillRadius, setPillRadius] = useState(PILL_MAX_CAPSULE);
  useEffect(() => {
    const computePillRadius = () => {
      try {
        const r = pillRef.current?.getBoundingClientRect();
        if (!r) { setPillRadius(PILL_MAX_CAPSULE); return; }
        if (r.height <= PILL_TALL_START) { setPillRadius(PILL_MAX_CAPSULE); return; }
        // As the pill height grows beyond the threshold, ease the radius down to improve readability
        const excess = r.height - PILL_TALL_START;
        const steps = Math.floor(excess / 80); // relax 1 step per +80px
        const radius = Math.max(PILL_MIN_RADIUS, 24 - steps * 4);
        setPillRadius(radius);
      } catch { setPillRadius(PILL_MAX_CAPSULE); }
    };
    const raf = requestAnimationFrame(computePillRadius);
    window.addEventListener('resize', computePillRadius);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', computePillRadius); };
  }, [input, pillHeight]);

  // Overlay open helper (cancels any pending close)
  const openOverlay = () => {
    if (overlayCloseTimerRef.current) { clearTimeout(overlayCloseTimerRef.current); overlayCloseTimerRef.current = null; }
    setIsOverlayClosing(false);
    setShowOverlay(true);
  };

  // Overlay close with animation; safe to call repeatedly
  const closeOverlay = () => {
    if (!showOverlay || isOverlayClosing) return; // already closed or closing
    setIsOverlayClosing(true);
    if (overlayCloseTimerRef.current) clearTimeout(overlayCloseTimerRef.current);
    overlayCloseTimerRef.current = setTimeout(() => {
      setShowOverlay(false);
      setIsOverlayClosing(false);
      overlayCloseTimerRef.current = null;
    }, 260); // must match fadeOutDown duration
  };

  const CLOSE_ANIMATION_MS = 260; // keep in sync with fadeOutDown duration

  // Reset all chat/search state (new chat)
  const resetConversationState = (opts = {}) => {
    const { preserveMode = false } = opts;
    setMessages([]);
    setSearchResults([]);
    setSearchQuery('');
    setFeedbackState({});
    setCommentBoxOpen({});
    setCommentDraft({});
    setCopiedState({});
    setInput('');
    if (!preserveMode) setToggleOn(false); // default back to chat unless preserving
  };

  // Keyboard: Escape closes & resets (no auto focus after closing unless overlay remained hidden)
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') {
        try { chatAbortRef.current?.abort(); } catch {}
        const wasVisible = showOverlay && !isOverlayClosing;
        if (wasVisible) closeOverlay(); else setShowOverlay(false);
        if (wasVisible) {
          setTimeout(() => { resetConversationState({ preserveMode: toggleOn }); }, CLOSE_ANIMATION_MS);
        } else {
          resetConversationState({ preserveMode: toggleOn });
        }
        // Remove focus from the input (and hide virtual keyboard on mobile) when user presses Escape
        if (textareaRef.current) {
          textareaRef.current.blur();
          setIsInputFocused(false);
        }
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showOverlay, isOverlayClosing]);

  // Outside click: collapse & reset like Escape
  useEffect(() => {
    if (!(showOverlay || isOverlayClosing)) return;
    const handleDown = (e) => {
      const target = e.target;
      if (panelRef.current && panelRef.current.contains(target)) return; // inside panel
      if (pillRef.current && pillRef.current.contains(target)) return; // clicking the pill shouldn't auto-reset
      // If the click is inside the main docs/content container that we push, do not close the overlay
      try {
        if (contentTargetRef.current && contentTargetRef.current.contains(target)) return;
      } catch {}
      try { chatAbortRef.current?.abort(); } catch {}
      const wasVisible = showOverlay && !isOverlayClosing;
      if (wasVisible) closeOverlay(); else setShowOverlay(false);
      if (wasVisible) {
        setTimeout(() => { resetConversationState({ preserveMode: toggleOn }); textareaRef.current?.focus(); }, CLOSE_ANIMATION_MS);
      } else {
        resetConversationState({ preserveMode: toggleOn });
        textareaRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', handleDown, true);
    return () => document.removeEventListener('mousedown', handleDown, true);
  }, [showOverlay, isOverlayClosing]);

  // Scroll overlay to bottom on new messages
  // Removed auto-scroll to bottom for LLM answers

  // Feedback copy timers cleanup
  useEffect(() => () => { Object.values(copiedTimersRef.current).forEach(t => clearTimeout(t)); }, []);

  const postFeedback = async ({ question, answer, rating, comment = '', citations = [] }) => {
    try {
      await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, answer, rating, comment, citations }) });
    } catch (e) { /* ignore */ }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) { setSearchResults([]); setSearchQuery(''); return; }
    // Preserve input text when searching; do not clear textarea
    setIsSearching(true); setSearchQuery(query.trim()); setSearchResults([]); openOverlay();
    // Fallback static sample results (parity with main page when endpoint 404 / offline)
    const staticFallbackResults = [
      { title: 'Install Netdata on Linux', url: 'https://learn.netdata.cloud/docs/netdata-agent/installation/linux', snippet: 'Quick install on Linux with kickstart.sh script, optional parameters for customizing your setup...', score: 0.42, section: 'Documentation' },
      { title: 'Install Netdata on macOS', url: 'https://learn.netdata.cloud/docs/netdata-agent/installation/macos', snippet: 'Install Netdata on macOS using Homebrew or binary packages. Includes update & uninstall steps...', score: 0.36, section: 'Documentation' },
      { title: 'Install Netdata on FreeBSD', url: 'https://learn.netdata.cloud/docs/netdata-agent/installation/freebsd', snippet: 'Community-maintained FreeBSD install guide. Notes on packages and service management...', score: 0.31, section: 'Documentation' },
      { title: 'Install Netdata on Windows', url: 'https://learn.netdata.cloud/docs/netdata-agent/installation/windows', snippet: 'Windows installer for Netdata with subscription requirements and feature notes...', score: 0.3, section: 'Documentation' }
    ];
    try {
      console.debug('[AskNetdataWidget] search ->', `${API_BASE}/chat/docs/search`, { query: query.trim() });
      const resp = await fetch(`${API_BASE}/chat/docs/search`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ query: query.trim() }) });
  if (resp.status === 404) { setSearchResults(staticFallbackResults.sort((a,b)=>(b.score||0)-(a.score||0))); setIsSearching(false); return; }
      if (!resp.ok) throw new Error();
      const data = await resp.json();
  const sorted = (data.results || []).slice().sort((a,b)=> (b.score||0) - (a.score||0));
  setSearchResults(sorted);
    } catch (e) { setSearchResults([]); }
    finally { setIsSearching(false); }
  };

  const handleSubmit = async (e, override = null) => {
    e?.preventDefault();
    const message = (override || input).trim();
    if (!message || isLoading) return;
  if (toggleOn) { await handleSearch(message); return; }
  openOverlay();
    const userMessageId = Date.now();
    const userMessage = { id:userMessageId, type:'user', content:message, timestamp:new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      // Prepare abort controller for this streaming request
      chatAbortRef.current = new AbortController();
  console.debug('[AskNetdataWidget] send ->', `${API_BASE}/chat/docs/stream`, { message, messagesCount: messages.length });
      let response = await fetch(`${API_BASE}/chat/docs/stream`, {
        method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({
          messages:[ ...(() => { const max = MAX_CONVERSATION_PAIRS*2; return messages.slice(-max).map(m => ({ role: m.type==='user'?'user':'assistant', content:m.content })); })(), { role:'user', content:message } ]
        }), signal: chatAbortRef.current.signal
      });
      if (!response.ok) {
  console.warn('[AskNetdataWidget] initial stream response not ok, retrying...', response.status);
        try {
          response = await fetch(`${API_BASE}/chat/docs/stream`, {
            method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({
              messages:[ ...(() => { const max = MAX_CONVERSATION_PAIRS*2; return messages.slice(-max).map(m => ({ role: m.type==='user'?'user':'assistant', content:m.content })); })(), { role:'user', content:message } ]
            }), signal: chatAbortRef.current.signal
          });
        } catch (e) {}
      }
      if (!response.ok) throw new Error();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = userMessageId + 1;
      let assistant = { id:assistantId, type:'assistant', content:'', citations:[], timestamp:new Date() };
      setMessages(prev => [...prev, assistant]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        chunk.split('\n').forEach(line => {
          if (!line.startsWith('data: ')) return;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              assistant.content += data.content;
              setMessages(prev => prev.map(m => m.id===assistantId ? { ...m, content: assistant.content } : m));
            } else if (data.type === 'citations') {
              assistant.citations = data.citations;
              setMessages(prev => prev.map(m => m.id===assistantId ? { ...m, citations: assistant.citations } : m));
            } else if (data.type === 'error') {
              assistant.content = data.error || 'Error'; assistant.isError = true;
              setMessages(prev => prev.map(m => m.id===assistantId ? { ...m, content: assistant.content, isError:true } : m));
            }
          } catch {}
        });
      }
      if (!assistant.content.trim()) setMessages(prev => prev.map(m => m.id===assistantId ? { ...m, content:'Empty response. Try again.', isError:true } : m));
    } catch (e) {
      if (e.name === 'AbortError') {
        // aborted: do not append error message, just exit
        return;
      }
  console.error('[AskNetdataWidget] send error', e);
      setMessages(prev => [...prev, { id: Date.now()+2, type:'assistant', content:'Sorry, I encountered an error.', isError:true }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) {
        if (toggleOn) return; // do not send placeholder in search mode
        handleSubmit(null, 'Ask Netdata');
      } else {
        handleSubmit();
      }
  // After submitting via Enter, remove focus from the chatbox to dismiss virtual keyboards
  try { textareaRef.current?.blur(); setIsInputFocused(false); } catch {}
    }
  };

  const copyAnswer = async (message) => {
    try { const temp = document.createElement('div'); temp.innerHTML = message.content || ''; const plain = temp.textContent || temp.innerText || ''; await navigator.clipboard.writeText(plain); setCopiedState(p=>({ ...p, [message.id]:true })); if (copiedTimersRef.current[message.id]) clearTimeout(copiedTimersRef.current[message.id]); copiedTimersRef.current[message.id]=setTimeout(()=>{ setCopiedState(p=>({ ...p, [message.id]:false })); },1000); } catch {}
  };

  // Styles (borrow semantics from main component)
  const pillContainerStyle = {
    position: 'sticky',
    top: 'calc(var(--ifm-navbar-height) + 8px)',
    zIndex: 1000,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none'
  };
  // Update pillInnerStyle to align chatbox to the right on mobile
  const pillInnerStyle = {
    width: isMobile ? '85vw' : '100%', // Use 100vw for mobile to span the entire screen width
  maxWidth: isMobile ? '85vw' : 800, // Ensure maxWidth matches width for mobile
    padding: '0 20px',
    boxSizing: 'border-box',
    textAlign: isMobile ? 'right' : 'center' // Align to the right on mobile
  };
  const pillStyle = {
    border: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
    background: isDarkMode ? '#0A0A0A' : 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(18px)',
    boxShadow: isInputFocused ? `0 0 0 3px ${rgba(currentAccent, OPACITY.focusRing)}` : 'none',
    width: '400px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    pointerEvents: 'auto',
    transition: 'box-shadow 220ms ease, background 220ms ease',
    minHeight: pillHeight,
  borderRadius: pillRadius,
    padding: '6px 8px 6px 20px',
    overflow: 'hidden'
  };
  // Update placeholderStyle to use MOBILE_FONT_SIZE for mobile
  const placeholderStyle = {
    position: 'absolute',
    left: 26,
    top: '50%',
    transform: 'translateY(-50%)',
    right: 190,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    opacity: input ? 0 : 1,
    fontSize: isMobile ? MOBILE_FONT_SIZE : 16, // Use MOBILE_FONT_SIZE for mobile
    lineHeight: 1.3,
    color: (isSendHovered && !input.trim()) ? currentAccent : (isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)'),
    transition: 'opacity 260ms ease, color 300ms ease',
    pointerEvents: 'none'
  };
  const textareaStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  resize: 'none',
  fontSize: isMobile ? MOBILE_FONT_SIZE : 16, // Use MOBILE_FONT_SIZE for mobile
  fontFamily: 'inherit',
  lineHeight: 1.45,
  color: isDarkMode ? 'var(--ifm-font-color-base)' : '#1f2937',
  padding: 0,
  maxHeight: 200,
  overflow: 'hidden'
  };
  // Dim background (different opacity for dark vs light) when no input, match main page semantics
  const dimmedBg = isDarkMode
    ? rgba(currentAccent, OPACITY.dimDark)
    : rgba(currentAccent, OPACITY.dimLight);
  const sendButtonStyle = {
    background: input.trim() ? currentAccent : (isSendHovered ? currentAccent : dimmedBg),
    color:'#fff', border:'none', borderRadius:'50%', width:pillHeight, height:pillHeight,
    cursor: isLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow: 'none',
    transition:'background 200ms ease, box-shadow 200ms ease'
  };
  // Removed glow/outline from toggle per request
  const toggleTrackStyle = (on) => ({ width:TOGGLE_TRACK_WIDTH, height:effectiveTrackHeight, padding:'4px', boxSizing:'border-box', borderRadius:999, background: on ? ASKNET_SECOND : ASKNET_PRIMARY, position:'relative', cursor:'pointer', transition:'background 200ms ease', flexShrink:0, display:'flex', alignItems:'center' });
  const toggleKnobStyle = (on) => ({ width:effectiveKnobSize, height:effectiveKnobSize, borderRadius:'50%', background: isDarkMode ? '#0b1220' : '#fff', position:'absolute', top:'50%', left: on ? `calc(100% - ${effectiveKnobSize + 4}px)` : '4px', transform:'translateY(-50%)', transition:'left 200ms cubic-bezier(.2,.9,.2,1)' });
  const toggleHintStyle = (on) => ({
    position: 'absolute',
    top: '50%',
    left: on ? '10px' : 'auto',
    right: on ? 'auto' : '10px',
    transform: 'translateY(-50%)',
    fontSize: isMobile ? MOBILE_FONT_SIZE : 12, // Use MOBILE_FONT_SIZE for mobile
    fontWeight: 600,
    letterSpacing: '.4px',
    color: '#fff',
    userSelect: 'none',
    pointerEvents: 'none'
  });
  const toggleShortcutBadgeStyle = {
  fontSize: isMobile ? MOBILE_FONT_SIZE : 11,
    fontWeight:600,
    letterSpacing:'.5px',
  padding:isMobile ? '3px 8px' : '3px 7px',
    borderRadius:6,
    background:'rgba(255,255,255,0.25)',
    color:'#fff',
    lineHeight:1,
    userSelect:'none',
    display:'inline-block'
  };

  const overlayBaseTop = () => {
    try { if (pillRef.current) { const r = pillRef.current.getBoundingClientRect(); return r.bottom + OVERLAY_GAP_PX; } } catch {}
    return 140;
  };
  const overlayStyle = {
  position: 'fixed',
  top: isMobile ? 'auto' : overlayBaseTop(),
  bottom: isMobile ? 0 : 'auto',
  right: 0,
  left: isMobile ? 0 : 'auto',
  height: isMobile ? panelHeight + 'px' : 'calc(100% - ' + overlayBaseTop() + 'px)',
  zIndex: 1200,
  display: (showOverlay || isOverlayClosing) ? 'block' : 'none',
  pointerEvents: 'none'
  };
  const overlayInnerStyle = {
  width: isMobile ? '100%' : 'auto',
  maxWidth: isMobile ? '100%' : overlayMaxWidth,
  height: '100%',
  padding: '0',
  boxSizing:'border-box',
  pointerEvents:'auto',
  display: 'flex',
  flexDirection: 'column'
  ,
  // center panel on mobile, align to right on desktop
  alignItems: isMobile ? 'center' : 'flex-end'
  };
  // Update panelStyle to use 100vw for mobile width
  const panelStyle = {
    background: isDarkMode ? 'var(--ifm-background-color)' : 'rgba(255,255,255,0.96)',
    backdropFilter:'blur(18px)',
  // Remove accent outline for widget panel (use subtle neutral stroke instead)
  border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(16,24,40,0.04)',
  // UX: make panel flush with page edges (no rounded corners)
  borderRadius: 0,
  padding: '10px 10px',
  boxShadow: 'none',
  maxHeight: '100%',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  animation: isMobile ? undefined : 'slideUpInSmoothNoFade 520ms cubic-bezier(0.16,1,0.3,1)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: isMobile ? '100vw' : panelWidth, // Use 100vw for mobile to span the entire screen width
  height: '100%',
  transition: isDragging ? 'none' : (isMobile ? 'height 260ms ease' : 'none')
  };

  // Use the docs background so the widget feels native to the page
  const docsBgLight = 'var(--ifm-background-color, #ffffff)';
  const docsBgDark = 'var(--ifm-color-emphasis-0, #0A0A0A)';
  // Answer font sizing constants so we can clamp to N lines reliably
  const ANSWER_FONT_SIZE = 15; // px
  const ANSWER_LINE_HEIGHT = 1.6; // unitless
  const ANSWER_CLAMP_LINES = 2; // number of visible lines
  const ANSWER_CLAMP_HEIGHT_PX = Math.round(ANSWER_FONT_SIZE * ANSWER_LINE_HEIGHT * ANSWER_CLAMP_LINES);

  // Search snippet clamp constants (two wrapped lines)
  const SEARCH_SNIPPET_FONT_SIZE = 11; // px
  const SEARCH_SNIPPET_LINE_HEIGHT = 1.3; // unitless
  const SEARCH_SNIPPET_CLAMP_LINES = 2;
  const SEARCH_SNIPPET_CLAMP_HEIGHT_PX = Math.round(SEARCH_SNIPPET_FONT_SIZE * SEARCH_SNIPPET_LINE_HEIGHT * SEARCH_SNIPPET_CLAMP_LINES);

  const questionMessageStyle = { background: isDarkMode ? docsBgDark : docsBgLight, border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(16,24,40,0.04)', borderRadius: 4, padding: '14px 16px', marginBottom: 18, fontSize: ANSWER_FONT_SIZE, lineHeight:1.5, fontWeight:500 };
  const answerMessageStyle = (m) => ({
    background: m.isError ? (isDarkMode ? 'rgba(220,38,38,0.12)' : '#fef2f2') : (isDarkMode ? docsBgDark : docsBgLight),
    borderRadius: 4,
    padding: '18px 20px 22px 20px',
    marginBottom: 20,
    fontSize: ANSWER_FONT_SIZE,
    lineHeight: ANSWER_LINE_HEIGHT,
    boxShadow: 'none'
  });

  return (
    <>
      <style>{`
        /* Opacity removed from entrance animations to avoid fade */
  @keyframes slideUpInSmoothNoFade { 0% { transform: translateY(40px) scale(.96); filter:blur(1px);} 60% { transform: translateY(-2px) scale(1.01); filter:blur(0);} 100% { transform: translateY(0) scale(1); filter:blur(0);} }
        @keyframes riseInNoFade { 0% { transform: translateY(12px); } 100% { transform: translateY(0); } }
        @keyframes scanBackForth { 0% { transform: translateX(-100px);} 50% { transform: translateX(300px);} 100% { transform: translateX(-100px);} }
        @keyframes fadeOutDown { 0% { opacity:1; transform: translateY(0) scale(1);} 100% { opacity:0; transform: translateY(16px) scale(.97);} }
  /* Slide panel in from right and out to right */
  @keyframes slideInFromRight { 0% { transform: translateX(16px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
  @keyframes slideOutToRight { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(16px); opacity: 0; } }
  /* Slide panel up from bottom and down to bottom for mobile */
  @keyframes slideUpFromBottom { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
  @keyframes slideDownToBottom { 0% { transform: translateY(0); } 100% { transform: translateY(100%); } }
  .asknet-overlay-panel::-webkit-scrollbar { display: none; }
  /* Smoothly transition content padding when panel opens/closes */
  .asknet-content-animate { transition: padding-right 320ms cubic-bezier(0.16,1,0.3,1), padding-bottom 320ms cubic-bezier(0.16,1,0.3,1); }
  /* Resizer: base + hover/drag states (uses CSS vars set on panel) */
  .asknet-resizer { transition: background 160ms ease, box-shadow 160ms ease, border-left 160ms ease; background: transparent; }
  /* Only highlight the visible resizer on direct hover; use solid accent color (no faded inward) */
  /* On hover/drag, the visible handle will be filled with the focus-ring color; disable extra outline to avoid double-color */
  .asknet-resizer:hover, .asknet-resizer.is-dragging { box-shadow: none; border-left: 1px solid transparent; }
  /* Search result card hover: subtle lift + accent border */
  .asknet-search-result { transition: box-shadow 180ms ease, transform 160ms ease, border-color 160ms ease; }
  .asknet-search-result:hover { transform: none; box-shadow: 0 0 0 2px var(--asknet-focus-ring); border-color: var(--asknet-resizer-border); }
      `}</style>
      <div ref={pillRef} style={pillContainerStyle}>
        <div style={pillInnerStyle}>
          <div style={pillStyle}>
            <div style={placeholderStyle}>
              {toggleOn ? 'Search Docs' : 'Ask Netdata'}
              <span
                style={{
                  marginLeft: 10,
                  fontSize: isMobile ? MOBILE_FONT_SIZE : 12,
                  fontWeight: 600,
                  letterSpacing: '.5px',
                  padding: isMobile ? '2px 8px' : '2px 6px',
                  borderRadius: 4,
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  minWidth: isMobile ? 56 : 44,
                  textAlign: 'center',
                  background: isDarkMode ? 'rgba(164, 164, 164, 0.42)' : 'rgba(0,0,0,0.06)',
                  color: isDarkMode ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.60)',
                  lineHeight: 1,
                  userSelect: 'none'
                }}
                title="Focus input"
              >{FOCUS_SHORTCUT_LABEL}</span>
            </div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
                onFocus={()=> setIsInputFocused(true)}
              onBlur={()=> setIsInputFocused(false)}
              style={textareaStyle}
              rows={1}
              placeholder=""
            />
            {/* Toggle pill */}
            <div
              role="switch"
              aria-checked={toggleOn}
              tabIndex={0}
              onClick={() => { setToggleOn(v => !v); setTimeout(()=>textareaRef.current?.focus(), 0); }}
              onKeyDown={(e) => { if (e.key==='Enter' || e.key===' ') { e.preventDefault(); setToggleOn(v => !v); } }}
              style={toggleTrackStyle(toggleOn)}
              title="Toggle search / chat"
            >
              <div style={toggleHintStyle(toggleOn)}>
                <span style={toggleShortcutBadgeStyle}>{SHORTCUT_LABEL}</span>
              </div>
              <div style={toggleKnobStyle(toggleOn)}></div>
            </div>
            <button
              type="button"
              style={sendButtonStyle}
              disabled={isLoading}
              onClick={(e)=>{ e.preventDefault(); const trimmed = input.trim(); if (!trimmed) { if (toggleOn) return; handleSubmit(null, 'Ask Netdata'); } else handleSubmit(); }}
              onMouseEnter={()=>{ if(!isLoading) { setIsSendHovered(true); sendHoverRef.current=true; } }}
              onMouseLeave={()=>{ setIsSendHovered(false); sendHoverRef.current=false; }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating overlay */}
      <div ref={overlayRef} style={overlayStyle}>
        <div style={{ display: 'flex', height: '100%', alignItems: 'flex-start' }}>
          <div style={overlayInnerStyle}>
            <div ref={panelRef} style={{...panelStyle,
              animation: isOverlayClosing ? (isMobile ? 'slideDownToBottom 260ms ease forwards' : 'slideOutToRight 260ms ease forwards') : (isMobile ? 'slideUpFromBottom 320ms cubic-bezier(0.16,1,0.3,1) forwards' : 'slideInFromRight 320ms cubic-bezier(0.16,1,0.3,1) forwards'),
              ['--asknet-resizer-bg']: currentAccent, ['--asknet-resizer-glow']: currentAccent, ['--asknet-resizer-border']: currentAccent,
              ['--asknet-glow-strong']: `${rgba(currentAccent, OPACITY.glowStrong)}`, ['--asknet-glow-soft']: `${rgba(currentAccent, OPACITY.glowSoft)}`, ['--asknet-focus-ring']: `${rgba(currentAccent, OPACITY.focusRing)}`,
              width: isMobile ? '100vw' : panelWidth, // Use 100vw for mobile to span the entire screen width
              height: isMobile ? panelHeight : '100%',
              boxShadow: panelStyle.boxShadow
            }} className="asknet-overlay-panel">
              {isMobile && (
                <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 60, height: 6, background: currentAccent, borderRadius: 3, zIndex: 1405, cursor: 'ns-resize', pointerEvents: 'auto' }} onMouseDown={(e) => startDraggingVertical(e.clientY)(e)} onTouchStart={startDraggingTouch} />
              )}
              {/* Resizer: draggable vertical bar (thinner, hoverable) */}
              {/* Resizer: draggable - vertical on desktop (left), horizontal on mobile (top of panel) */}
              {!isMobile && (
                <div
                  role="separator"
                  aria-orientation="vertical"
                  onMouseDown={(e)=>{ startDragging(e.clientX)(e); }}
                  onTouchStart={startDraggingTouch}
                  style={{ position:'absolute', left: -10, top:0, bottom:0, width:20, cursor:'ew-resize', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1300 }}
                >
                  <div
                    className={`asknet-resizer ${isDragging ? 'is-dragging' : ''}`}
                    onMouseEnter={() => setResizerHover(true)}
                    onMouseLeave={() => setResizerHover(false)}
                    style={{
                      width: (isDragging || resizerHover) ? 14 : 8,
                      height: '100%',
                      display: 'block',
                      boxSizing: 'border-box',
                      borderRadius: 0,
                      background: (isDragging || resizerHover) ? 'var(--asknet-focus-ring)' : 'transparent',
                      borderLeft: '1px solid transparent',
                      transition: 'width 120ms ease, background 120ms ease'
                    }}
                  />
                </div>
              )}
            {/* Header row with actions */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div style={{ fontSize:15, fontWeight:600 }}>
                {toggleOn && searchResults.length > 0 && `Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}
              </div>
              <div style={{ display:'flex', gap:12 }}>
                {!toggleOn && messages.length > 0 && <button onClick={() => { setMessages([]); closeOverlay(); setSearchResults([]); setSearchQuery(''); }} style={{ background:'transparent', border: isDarkMode?'1px solid rgba(255,255,255,0.2)':'1px solid #d1d5db', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13 }}>New chat</button>}
                <button onClick={() => closeOverlay()} style={{ background:'transparent', border:'none', fontSize:18, cursor:'pointer', lineHeight:1, padding:'4px 6px' }} aria-label="Close overlay">×</button>
              </div>
            </div>
            {/* Scrollable content area (results / messages / loading) */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6, paddingTop: 8 }}>
            {/* Search results (exclusive view) */}
            {toggleOn && (searchResults.length>0 || isSearching || (searchQuery && !isSearching)) && (
              <div style={{ marginBottom:24 }}>
                {isSearching ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ fontSize:14, opacity:0.75 }}>Searching documentation...</div>
                    <div style={{ display:'flex', justifyContent:'center', padding:'0 0 8px 0' }}>
                      <div style={{ position:'relative', width:300, height:4, overflow:'hidden', borderRadius:2, background:'rgba(156,163,175,0.2)' }}>
                        <div style={{ position:'absolute', top:0, left:0, width:100, height:'100%', background: currentAccent, animation:'scanBackForth 2s ease-in-out infinite', boxShadow:`0 0 10px ${rgba(currentAccent, OPACITY.glowStrong)},0 0 20px ${rgba(currentAccent, OPACITY.glowSoft)}` }} />
                      </div>
                    </div>
                  </div>
                ) : searchResults.length>0 ? (
                  <>
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {searchResults.map((r,i)=>(
                        <SmartLink key={i} href={r.url} style={{ textDecoration:'none', color:'inherit', display:'block', maxWidth: '90%', margin: '0 auto' }}>
                          <div className="asknet-search-result" style={{ padding:'16px 16px 14px 16px', background: isDarkMode?'rgba(255,255,255,0.05)':'#fff', border: isDarkMode?'1px solid rgba(255,255,255,0.1)':'1px solid #e6eaf0', borderRadius:8 }}>
                            <div style={{ color: ASKNET_SECOND, textDecoration:'none', fontWeight:600, fontSize:16 }}>{r.title}</div>
                          {(() => {
                            if(!r.snippet) return null;
                            const cleanSnippet = (snippet) => {
                              if(!snippet) return '';
                              let s = snippet.replace(/\r/g,'').trimStart();
                              // Strip YAML frontmatter block
                              const fmMatch = s.match(/^---[\s\S]*?\n---\s*/);
                              if(fmMatch) {
                                s = s.slice(fmMatch[0].length);
                              }
                              // If metadata lines still at top (key: value)
                              let lines = s.split('\n');
                              let removedSomething = false;
                              while(lines.length) {
                                const L = lines[0].trim();
                                if(!L) { lines.shift(); removedSomething = true; continue; }
                                if(/^[A-Za-z0-9_\-]+:/.test(L) && !L.startsWith('#') && L.length < 300) {
                                  lines.shift(); removedSomething = true; continue;
                                }
                                break;
                              }
                              if(removedSomething) s = lines.join('\n');
                              // Remove lingering starting --- line(s)
                              s = s.replace(/^---+\s*/,'');
                              // Remove code fences entirely
                              s = s.replace(/```[\s\S]*?```/g,' ');
                              // Remove inline code markers
                              s = s.replace(/`([^`]+)`/g,'$1');
                              // Convert links [text](url) to text
                              s = s.replace(/\[([^\]]+)\]\([^\)]+\)/g,'$1');
                              // Strip HTML tags
                              s = s.replace(/<[^>]+>/g,' ');
                              // Remove headings markers
                              s = s.replace(/^#+\s+/gm,'');
                              // Emphasis markers
                              s = s.replace(/\*{1,3}([^*_`]+)\*{1,3}/g,'$1').replace(/_{1,3}([^*_`]+)_{1,3}/g,'$1');
                              // Bullet markers at line starts
                              s = s.replace(/^\s*[-*+]\s+/gm,'');
                              // Collapse whitespace & newlines
                              s = s.replace(/\s+/g,' ').trim();
                              return s;
                            };
                            const body = cleanSnippet(r.snippet);
                            if(!body) return null;
                            const truncated = body.length > 400 ? body.slice(0,400).trim() + '…' : body;
                            return (
                              <div style={{
                                fontSize: SEARCH_SNIPPET_FONT_SIZE,
                                lineHeight: SEARCH_SNIPPET_LINE_HEIGHT,
                                marginTop: 8,
                                opacity: 0.8,
                                display: '-webkit-box',
                                WebkitLineClamp: SEARCH_SNIPPET_CLAMP_LINES,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                maxHeight: SEARCH_SNIPPET_CLAMP_HEIGHT_PX + 'px'
                              }}>
                                {truncated}
                              </div>
                            );
                          })()}
                          {/* Breadcrumb for learn_rel_path */}
                          {r.learn_rel_path && (
                            <div style={{
                              marginTop: 6,
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: '.5px',
                              opacity: 0.6,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              flexWrap: 'wrap'
                            }}>
                              {r.learn_rel_path.split('/').filter(Boolean).map((part, idx, arr) => (
                                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
                                    <span style={{ opacity: 0.4, fontSize: 8 }}>/</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Relevance Score */}
                          {SHOW_SEARCH_RELEVANCE_SCORE && r.score && (
                            <div style={{
                              marginTop: 6,
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: '.5px',
                              opacity: 0.5,
                              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'
                            }}>
                              Relevance: {Math.round(r.score * 100)}%
                            </div>
                          )}
                          </div>
                        </SmartLink>
                      ))}
                    </div>
                  </>
                ) : (<div style={{ fontSize:14, opacity:0.7 }}>No results for "{searchQuery}"</div>) }
              </div>
            )}
            {/* Messages (hidden in search mode) */}
            {!toggleOn && messages.map(m => (
              <div key={m.id} style={m.type==='user'?questionMessageStyle:answerMessageStyle(m)}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase', opacity:0.50, marginBottom:8 }}>{m.type==='user'?'You':'Netdata'}</div>
                {m.type==='assistant' ? (
                  // Remove the clamp for messages inside the scrollable area - let them expand fully
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({inline, className, children, ...props}) => <code style={{ background: isDarkMode?'rgba(255,255,255,0.08)':'#f1f5f9', padding:'2px 6px', borderRadius:4, fontSize:13 }} {...props}>{children}</code>,
                      a: ({href, children, ...props}) => (
                        <SmartLink href={href} style={{ color: currentAccent, textDecoration:'none', borderBottom:`1px solid ${currentAccent}` }} {...props}>
                          {children}
                        </SmartLink>
                      ),
                      p: (p)=> <p style={{ margin:'0 0 12px 0' }}>{p.children}</p>,
                      ul: (p)=> <ul style={{ margin:'0 0 14px 20px' }}>{p.children}</ul>,
                      ol: (p)=> <ol style={{ margin:'0 0 14px 22px' }}>{p.children}</ol>,
                      li: (p)=> <li style={{ marginBottom:6 }}>{p.children}</li>,
                      h1:'h3', h2:'h4', h3:'h5'
                    }}
                  >{m.content}</ReactMarkdown>
                ) : (
                  <div style={{ whiteSpace:'pre-wrap' }}>{m.content}</div>
                )}
                {/* Citations removed: hide 'Learn more' footer block in widget per UX request */}
                {m.type==='assistant' && (
                  <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                    <button type="button" onClick={()=>copyAnswer(m)} style={{ fontSize:11, padding:'4px 8px', borderRadius:6, border:'1px solid rgba(0,0,0,0.15)', background:'transparent', cursor:'pointer' }}>{copiedState[m.id]?'Copied!':'Copy'}</button>
                    <button type="button" onClick={async ()=>{ if (feedbackState[m.id]?.sending) return; setFeedbackState(p=>({...p,[m.id]:{...(p[m.id]||{}),sending:true,rating:'positive'}})); const q=[...messages].reverse().find(x=>x.type==='user')?.content||''; await postFeedback({ question:q, answer:m.content, rating:'positive', citations:m.citations||[] }); setFeedbackState(p=>({...p,[m.id]:{...(p[m.id]||{}),sending:false,rating:'positive'}})); }} style={{ fontSize:11, padding:'4px 8px', borderRadius:6, border:'1px solid rgba(0,0,0,0.15)', background: feedbackState[m.id]?.rating==='positive'?ASKNET_SECOND:'transparent', color: feedbackState[m.id]?.rating==='positive'?'#fff':'inherit', cursor:'pointer' }}>👍</button>
                    <button type="button" onClick={()=> setCommentBoxOpen(p=>({...p,[m.id]:!p[m.id]}))} style={{ fontSize:11, padding:'4px 8px', borderRadius:6, border:'1px solid rgba(0,0,0,0.15)', background: feedbackState[m.id]?.rating==='negative'?'#dc2626':'transparent', color: feedbackState[m.id]?.rating==='negative'?'#fff':'inherit', cursor:'pointer' }}>👎</button>
                    {commentBoxOpen[m.id] && (
                      <div style={{ width:'100%' }}>
                        <textarea rows={3} value={commentDraft[m.id]||''} onChange={(e)=> setCommentDraft(p=>({...p,[m.id]:e.target.value}))} placeholder="What could be improved?" style={{ width:'100%', marginTop:6, borderRadius:6, border: isDarkMode?'1px solid rgba(255,255,255,0.15)':'1px solid #e2e8f0', padding:6, background: isDarkMode?'rgba(255,255,255,0.05)':'#fff', color:'inherit', fontSize:12 }} />
                        <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginTop:4 }}>
                          <button type="button" onClick={()=> setCommentBoxOpen(p=>({...p,[m.id]:false}))} style={{ fontSize:11, padding:'4px 8px', border:'none', background:'transparent', cursor:'pointer', opacity:.7 }}>Cancel</button>
                          <button type="button" onClick={async ()=>{ if (feedbackState[m.id]?.sending) return; setFeedbackState(p=>({...p,[m.id]:{...(p[m.id]||{}),sending:true}})); const q=[...messages].reverse().find(x=>x.type==='user')?.content||''; await postFeedback({ question:q, answer:m.content, rating:'negative', comment: commentDraft[m.id]||'', citations:m.citations||[] }); setFeedbackState(p=>({...p,[m.id]:{...(p[m.id]||{}),sending:false,rating:'negative'}})); setCommentBoxOpen(p=>({...p,[m.id]:false})); setCommentDraft(p=>({...p,[m.id]:''})); }} style={{ fontSize:11, padding:'4px 10px', borderRadius:6, border:'none', background:ASKNET_PRIMARY, color:'#fff', cursor:'pointer' }}>Submit</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ display:'flex', justifyContent:'center', padding:'8px 0 24px 0' }}>
                <div style={{ position:'relative', width:300, height:4, overflow:'hidden', borderRadius:2, background:'rgba(156,163,175,0.2)' }}>
                  <div style={{ position:'absolute', top:0, left:0, width:100, height:'100%', background: currentAccent, animation:'scanBackForth 2s ease-in-out infinite', boxShadow:`0 0 10px ${rgba(currentAccent, OPACITY.glowStrong)},0 0 20px ${rgba(currentAccent, OPACITY.glowSoft)}` }} />
                </div>
              </div>
            )}
            <div ref={messagesBottomRef} />
            {messages.length > 0 && !toggleOn && (
              <div style={{ fontSize:12, opacity:0.6, marginTop:4, textAlign:'center' }}>AI can make mistakes - validate before use.</div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

