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
// Adaptive corner radius for the input pill when it grows tall due to multi-line input
const PILL_TALL_START = 56;   // px height where we start relaxing the capsule corners
const PILL_MIN_RADIUS = 14;   // px min radius for very tall pills
const PILL_MAX_CAPSULE = 999; // fully rounded capsule for short pills

export default function AskNetdataWidget({ pillHeight = 40, pillMaxWidth = 30, overlayMaxWidth = 1000, panelPct = 25 }) {
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
        try { closeOverlay(); } catch {}
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
  const overlayCloseTimerRef = useRef(null);
  const chatAbortRef = useRef(null); // abort controller for streaming chat

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

  // Remove auto-focus on load (accessibility & user preference) and add keyboard shortcuts
  useEffect(() => {
    const onGlobalKey = (e) => {
      // Toggle mode with Ctrl+/ (existing behavior preserved)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setToggleOn(v => !v);
        // Do NOT auto focus immediately—user can press Ctrl+K next if desired
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
  // panelPct: percent (0-100) of available docs/content width the panel should occupy
  const [panelWidth, setPanelWidth] = useState(() => Math.min(overlayMaxWidth, Math.floor((typeof window !== 'undefined' ? Math.min(window.innerWidth, overlayMaxWidth || 560) : 560) * (panelPct / 100))));
  const [isDragging, setIsDragging] = useState(false);
  const [resizerHover, setResizerHover] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);

  // Drag handlers (mouse + touch) to resize panelWidth
  const clampPanelWidth = (w) => {
    const vw = window.innerWidth;
    // If narrow screen (<720) we treat as full-width drawer
    if (vw < 720) return Math.max(0, Math.min(w, vw));
    const min = 320; // keep some content visible
    const max = Math.min(overlayMaxWidth || 560, Math.max(360, Math.floor(vw * 0.9)));
    return Math.max(min, Math.min(w, max));
  };

  const onDragMove = (clientX) => {
    const dx = dragStartXRef.current - clientX; // dragging left increases width
    const newW = clampPanelWidth(dragStartWidthRef.current + dx);
    setPanelWidth(newW);
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

  const mouseMove = (e) => { e.preventDefault(); onDragMove(e.clientX); };
  const mouseUp = (e) => { e.preventDefault(); stopDragging(); };
  const touchMove = (e) => { if (e.touches && e.touches[0]) { e.preventDefault(); onDragMove(e.touches[0].clientX); } };
  const touchEnd = () => { stopDragging(); };

  const startDragging = (startX) => (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = startX;
    dragStartWidthRef.current = panelWidth;
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
  };
  const startDraggingTouch = (e) => {
    if (!(e.touches && e.touches[0])) return;
    setIsDragging(true);
    dragStartXRef.current = e.touches[0].clientX;
    dragStartWidthRef.current = panelWidth;
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchEnd);
  };
  // Refs for content padding/animation management
  const contentTargetRef = useRef(null);
  const prevPaddingRef = useRef(null);
  const addedAnimateClassRef = useRef(false);
  const closeTimerRef = useRef(null);
  const PANEL_OPEN_ANIM_MS = 320;
  const PANEL_CLOSE_ANIM_MS = 260;
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
        // If narrow screen, use full width for the panel (behave like a drawer)
        if (vw < 720) {
          setPanelWidth(vw);
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
    // store previous padding if not already stored
    if (prevPaddingRef.current === null) prevPaddingRef.current = target.style.paddingRight || '';

    // add animate class if missing
    const hadAnimateClass = target.classList.contains('asknet-content-animate');
    if (!hadAnimateClass) { target.classList.add('asknet-content-animate'); addedAnimateClassRef.current = true; }

    // clear any existing close timer
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }

    if (showOverlay && !isOverlayClosing) {
      target.style.paddingRight = panelWidth + 28 + 'px';
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
        try { target.style.paddingRight = prevPaddingRef.current || ''; } catch {}
        if (addedAnimateClassRef.current) target.classList.remove('asknet-content-animate');
        addedAnimateClassRef.current = false;
        prevPaddingRef.current = null;
      }
    }

    return () => {
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      if (contentTargetRef.current) {
        try { contentTargetRef.current.style.paddingRight = prevPaddingRef.current || ''; } catch {}
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
  useEffect(() => { messagesBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

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
      let response = await fetch(`${API_BASE}/chat/docs/stream`, {
        method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({
          messages:[ ...(() => { const max = MAX_CONVERSATION_PAIRS*2; return messages.slice(-max).map(m => ({ role: m.type==='user'?'user':'assistant', content:m.content })); })(), { role:'user', content:message } ]
        }), signal: chatAbortRef.current.signal
      });
      if (!response.ok) {
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
  const pillInnerStyle = {
    width: '100%',
  maxWidth: pillMaxWidth,
    padding: '0 20px',
    boxSizing: 'border-box'
  };
  const pillStyle = {
    border: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
    background: isDarkMode ? '#0A0A0A' : 'rgba(255,255,255,0.96)',
    backdropFilter: 'blur(18px)',
    boxShadow: isInputFocused ? `0 0 0 3px ${rgba(currentAccent, OPACITY.focusRing)}` : 'none',
    width: '100%',
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
  const placeholderStyle = {
    position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', right: 190,
    display: 'flex', alignItems: 'center', gap: 8,
    opacity: input ? 0 : 1, fontSize: 16, lineHeight: 1.3, color: (isSendHovered && !input.trim()) ? currentAccent : (isDarkMode ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.50)'),
    transition: 'opacity 260ms ease, color 300ms ease', pointerEvents: 'none'
  };
  const textareaStyle = {
  flex: 1, background:'transparent', border:'none', outline:'none', resize:'none', fontSize:16, fontFamily:'inherit', lineHeight:1.45, color: isDarkMode ? 'var(--ifm-font-color-base)' : '#1f2937', padding: 0, maxHeight:200, overflow:'hidden'
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
  const toggleHintStyle = (on) => ({ position:'absolute', top:'50%', left: on? '10px':'auto', right: on? 'auto':'10px', transform:'translateY(-50%)', fontSize:12, fontWeight:600, letterSpacing:'.4px', color:'#fff', userSelect:'none', pointerEvents:'none' });
  const toggleShortcutBadgeStyle = {
    fontSize:11,
    fontWeight:600,
    letterSpacing:'.5px',
  padding:'3px 7px',
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
  top: overlayBaseTop(),
  right: 20,
  height: 'calc(100% - ' + overlayBaseTop() + 'px)',
  zIndex: 1200,
  display: (showOverlay || isOverlayClosing) ? 'block' : 'none',
  pointerEvents: 'none'
  };
  const overlayInnerStyle = {
  width: 'auto',
  maxWidth: overlayMaxWidth,
  height: '100%',
  padding: '0',
  boxSizing:'border-box',
  pointerEvents:'auto',
  display: 'flex',
  flexDirection: 'column'
  };
  const panelStyle = {
    background: isDarkMode ? '#0A0A0A' : 'rgba(255,255,255,0.96)',
    backdropFilter:'blur(18px)',
  // Remove accent outline for widget panel (use subtle neutral stroke instead)
  border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(16,24,40,0.04)',
  // UX: make panel flush with page edges (no rounded corners)
  borderRadius: 0,
  padding: '18px 20px',
  boxShadow: 'none',
  maxHeight: '100%',
  overflowY: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  animation: 'slideUpInSmoothNoFade 520ms cubic-bezier(0.16,1,0.3,1)',
  position: 'relative',
  width: panelWidth,
  height: '100%'
  };

  // Use the docs background so the widget feels native to the page
  const docsBgLight = 'var(--ifm-background-color, #ffffff)';
  const docsBgDark = 'var(--ifm-color-emphasis-0, #0A0A0A)';
  const questionMessageStyle = { background: isDarkMode ? docsBgDark : docsBgLight, border: isDarkMode ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(16,24,40,0.04)', borderRadius: 4, padding: '14px 16px', marginBottom: 18, fontSize: 15, lineHeight:1.5, fontWeight:500 };
  const answerMessageStyle = (m) => ({
    background: m.isError ? (isDarkMode ? 'rgba(220,38,38,0.12)' : '#fef2f2') : (isDarkMode ? docsBgDark : docsBgLight),
    borderRadius: 4,
    padding: '18px 20px 22px 20px',
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 1.6,
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
  .asknet-overlay-panel::-webkit-scrollbar { display: none; }
  /* Smoothly transition content padding when panel opens/closes */
  .asknet-content-animate { transition: padding-right 320ms cubic-bezier(0.16,1,0.3,1); }
  /* Resizer: base + hover/drag states (uses CSS vars set on panel) */
  .asknet-resizer { transition: background 160ms ease, box-shadow 160ms ease, border-left 160ms ease; background: transparent; }
  /* Only highlight the visible resizer on direct hover; use solid accent color (no faded inward) */
  .asknet-resizer:hover, .asknet-resizer.is-dragging { background: var(--asknet-resizer-border); box-shadow: none; border-left: 1px solid var(--asknet-resizer-border); }
      `}</style>
      <div ref={pillRef} style={pillContainerStyle}>
        <div style={pillInnerStyle}>
          <div style={pillStyle}>
            <div style={placeholderStyle}>
              {toggleOn ? 'Search Docs' : 'Ask Netdata'}
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '.5px',
                  padding: '2px 6px',
                  borderRadius: 4,
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
            <div ref={panelRef} style={{...panelStyle, animation: isOverlayClosing ? 'slideOutToRight 260ms ease forwards' : 'slideInFromRight 320ms cubic-bezier(0.16,1,0.3,1) forwards', ['--asknet-resizer-bg']: currentAccent, ['--asknet-resizer-glow']: currentAccent, ['--asknet-resizer-border']: currentAccent }} className="asknet-overlay-panel">
              {/* Resizer: draggable vertical bar (thinner, hoverable) */}
              <div
                role="separator"
                aria-orientation="vertical"
                onMouseDown={(e)=>{ startDragging(e.clientX)(e); }}
                onTouchStart={startDraggingTouch}
                style={{ position:'absolute', left: -6, top:0, bottom:0, width:12, cursor:'ew-resize', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1300 }}
              >
                <div
                  className={`asknet-resizer ${isDragging ? 'is-dragging' : ''}`}
                  onMouseEnter={() => setResizerHover(true)}
                  onMouseLeave={() => setResizerHover(false)}
                  style={{
                    width: 6,
                    height: '100%',
                    display: 'block',
                    borderRadius: 0,
                    background: (isDragging || resizerHover) ? currentAccent : 'transparent',
                    borderLeft: (isDragging || resizerHover) ? `1px solid ${currentAccent}` : '1px solid transparent'
                  }}
                />
              </div>
            {/* Header row with actions */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, fontSize: '1.05rem', fontWeight:700 }}>
                <span style={{ color: currentAccent }}>{toggleOn ? 'Search Docs' : 'Ask Netdata'}</span>
                {/* removed shortcut hint in results header per UX request */}
              </div>
              <div style={{ display:'flex', gap:12 }}>
                {!toggleOn && messages.length > 0 && <button onClick={() => { setMessages([]); closeOverlay(); setSearchResults([]); setSearchQuery(''); }} style={{ background:'transparent', border: isDarkMode?'1px solid rgba(255,255,255,0.2)':'1px solid #d1d5db', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:13 }}>New chat</button>}
                <button onClick={() => closeOverlay()} style={{ background:'transparent', border:'none', fontSize:18, cursor:'pointer', lineHeight:1, padding:'4px 6px' }} aria-label="Close overlay">×</button>
              </div>
            </div>
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
                    <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Found {searchResults.length} result{searchResults.length!==1?'s':''} for "{searchQuery}"</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {searchResults.map((r,i)=>(
                        <div key={i} style={{ padding:'16px 16px 14px 16px', background: isDarkMode?'rgba(255,255,255,0.05)':'#fff', border: isDarkMode?'1px solid rgba(255,255,255,0.1)':'1px solid #e6eaf0', borderRadius:8, animation:'riseInNoFade 360ms cubic-bezier(0.16,1,0.3,1) both', animationDelay:`${i*40}ms` }}>
                          <SmartLink href={r.url} onClick={closeOverlay} style={{ color:ASKNET_SECOND, textDecoration:'none', fontWeight:600, fontSize:16 }}>{r.title}</SmartLink>
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
                              <div style={{ fontSize:11, lineHeight:1.3, marginTop:8, opacity:0.8 }}>
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
                      ))}
                    </div>
                  </>
                ) : (<div style={{ fontSize:14, opacity:0.7 }}>No results for "{searchQuery}"</div>)}
              </div>
            )}
            {/* Messages (hidden in search mode) */}
            {!toggleOn && messages.map(m => (
              <div key={m.id} style={m.type==='user'?questionMessageStyle:answerMessageStyle(m)}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase', opacity:0.50, marginBottom:8 }}>{m.type==='user'?'You':'Netdata'}</div>
                {m.type==='assistant' ? (
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
            {(messages.length>0 || toggleOn) && (
              <div style={{ fontSize:12, opacity:0.6, marginTop:4, textAlign:'center' }}>AI can make mistakes - validate before use.</div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

