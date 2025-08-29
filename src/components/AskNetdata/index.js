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
      <Link to={internalPath} {...props}>
        {children}
      </Link>
    );
  }
  
  // External links still open in new tab
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
};

const MessageContent = ({ content }) => {
  // Custom component for code blocks that uses Docusaurus's CodeBlock
  const CodeBlockWrapper = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const content = String(children);
    
    // Determine if this is inline code:
    // 1. If inline prop is explicitly true
    // 2. If there are no newlines in the content (single line)
    // 3. If there's no language specified and content is short
    const isInline = inline === true || 
                     (inline !== false && !content.includes('\n') && !match);
    
    if (!isInline && match) {
      const language = match[1];
      
      // Check if this is a mermaid diagram
      if (language === 'mermaid') {
        return (
          <div style={{ marginTop: '16px', marginBottom: '16px' }}>
            <Mermaid value={content.replace(/\n$/, '')} />
          </div>
        );
      }
      
      // Multi-line code block with language
      return (
        <CodeBlock language={language}>
          {content.replace(/\n$/, '')}
        </CodeBlock>
      );
    } else if (!isInline) {
      // Multi-line code block without language
      return (
        <CodeBlock>
          {content.replace(/\n$/, '')}
        </CodeBlock>
      );
    } else {
      // Inline code
      return <MDXCode {...props}>{children}</MDXCode>;
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

  return (
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
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
        }
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(20px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(20px) rotate(-360deg);
          }
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(0, 212, 255, 0.5), 0 0 10px rgba(0, 212, 255, 0.3), 0 0 15px rgba(0, 171, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 212, 255, 0.6), 0 0 30px rgba(0, 171, 68, 0.4);
          }
        }
        @keyframes wave {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
        }
        @keyframes scanBackForth {
          0% {
            transform: translateX(-100px);
          }
          50% {
            transform: translateX(300px);
          }
          100% {
            transform: translateX(-100px);
          }
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
};

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
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

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

  // All About Netdata questions
  const aboutNetdataQuestions = [
    'What is Netdata and what makes it different?',
    'What is a Netdata Agent, a Parent, and Netdata Cloud?',
    'What is distributed monitoring and why it matters for me?',
    'Why and how is Netdata more cost efficient?',
    'How does Netdata handle data privacy and security?',
    'How do I install Netdata on Ubuntu?'
  ];

  // All deployment questions - we'll randomly select them
  const deploymentQuestions = [
    'Can I run Netdata in hybrid or multi-cloud setups?',
    'How does Netdata scale in large environments?',
    'Will running Netdata slow down my production servers?',
    'Can Netdata monitor bare-metal servers and GPUs?',
    'Can you visually explain how to setup parents for high availability?',
    'How to monitor Docker containers with Netdata?'
  ];

  // Configuration: Number of questions to show per category
  const QUESTIONS_PER_CATEGORY = 3;

  // Function to randomly select n items from an array
  const getRandomSelection = (arr, n) => {
    if (arr.length <= n) return arr;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  // Get random About Netdata questions
  const selectedAboutNetdataQuestions = useMemo(() => 
    getRandomSelection(aboutNetdataQuestions, QUESTIONS_PER_CATEGORY), 
    []
  );

  // Get random deployment questions
  const selectedDeploymentQuestions = useMemo(() => 
    getRandomSelection(deploymentQuestions, QUESTIONS_PER_CATEGORY), 
    []
  );

  // All operations questions
  const operationsQuestions = [
    'Do I need to learn a query language to use Netdata?',
    'How Netdata will help me optimize my SRE team?',
    'Where are my data stored with Netdata?',
    'Which of my data are stored at Netdata Cloud?',
    'How do I visualize cost/resource usage per environment?',
    'How do I configure email notifications?',
    'Why is my agent not connecting to Netdata Cloud?'
  ];

  // Get random operations questions
  const selectedOperationsQuestions = useMemo(() => 
    getRandomSelection(operationsQuestions, QUESTIONS_PER_CATEGORY), 
    []
  );

  // All AI & Machine Learning questions
  const aiMlQuestions = [
    'How does anomaly detection work in Netdata?',
    'Can I chat with Netdata with Claude Code or Gemini?',
    'What is AI Insights and how it can help me?',
    'Can Netdata identify the root cause of an issue for me?'
  ];

  // Get random AI & ML questions
  const selectedAiMlQuestions = useMemo(() => 
    getRandomSelection(aiMlQuestions, QUESTIONS_PER_CATEGORY), 
    []
  );

  // All dashboard questions
  const dashboardQuestions = [
    'How can I slice and dice any dataset with Netdata?',
    'How can I correlate a spike or a dive across my infrastructure?',
    'How can I create and edit custom dashboards, do I need to learn a query language?',
    'Can I use Netdata to search systemd journals or windows event logs?',
    'Does Netdata provide any fallback to access dashboards without internet access?',
    'What is the relationship between Spaces, Rooms, and dashboards?',
    'How do I share a dashboard view with a teammate?'
  ];

  // Get random dashboard questions
  const selectedDashboardQuestions = useMemo(() => 
    getRandomSelection(dashboardQuestions, QUESTIONS_PER_CATEGORY), 
    []
  );

  // All alerts questions
  const alertsQuestions = [
    'How do I configure alerts in Netdata?',
    'What are the best practices for setting alert thresholds?',
    'How can I integrate Netdata alerts with PagerDuty or Slack?',
    'How do I reduce alert noise and prevent alert fatigue?',
    'What alerts should I configure for MySQL monitoring?'
  ];

  // Get random alerts questions
  const selectedAlertsQuestions = useMemo(() => 
    getRandomSelection(alertsQuestions, QUESTIONS_PER_CATEGORY), 
    []
  );

  // Combine all questions for placeholder rotation
  const allQuestions = useMemo(() => {
    return [
      ...selectedAboutNetdataQuestions,
      ...selectedDeploymentQuestions,
      ...selectedOperationsQuestions,
      ...selectedAiMlQuestions,
      ...selectedDashboardQuestions,
      ...selectedAlertsQuestions
    ];
  }, [selectedAboutNetdataQuestions, selectedDeploymentQuestions, selectedOperationsQuestions, selectedAiMlQuestions, selectedDashboardQuestions, selectedAlertsQuestions]);

  // Placeholder rotation effect
  useEffect(() => {
    if (allQuestions.length === 0) return;
    
    // Set initial placeholder
    setCurrentPlaceholder(allQuestions[0]);
    
    const interval = setInterval(() => {
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
      handleSubmit();
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
  top: '40%',
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
    marginBottom: '10px'
  };

  const suggestionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  };

  const suggestionButtonStyle = {
    textAlign: 'left',
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
    color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    fontFamily: 'inherit',
    pointerEvents: 'none',
    transition: 'all 0.4s ease',
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
      <div ref={chatAreaRef} style={chatAreaStyle}>
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
              
              <div style={inputContainerStyle}>
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
                      style={chatInputStyle}
                      rows={1}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    style={sendButtonStyle}
                    disabled={!input.trim() || isLoading}
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>

            {/* Title and Categorized Questions together */}
            <div style={suggestionContainerStyle}>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '0.375rem',
                marginBottom: '0.5rem'
              }}>
              {/*
              <div style={{
                padding: '0.375rem',
                borderRadius: '12px'
              }}>
                <button
                  onClick={() => setExpandedCategory(expandedCategory === 'about' ? null : 'about')}
                  style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: 600, 
                    color: expandedCategory === 'about' ? 'white' : '#00AB44',
                    marginBottom: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: expandedCategory === 'about' ? '#00AB44' : 'transparent',
                    border: `2px solid #00AB44`,
                    cursor: 'pointer',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '50px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (expandedCategory !== 'about') {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 171, 68, 0.1)';
                    }
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (expandedCategory !== 'about') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    } else {
                      e.currentTarget.style.backgroundColor = '#00AB44';
                    }
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>✨</span> About Netdata
                </button>
                {expandedCategory === 'about' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    {selectedAboutNetdataQuestions.map((question, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: isDarkMode ? 'var(--ifm-font-color-base)' : '#495057',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00AB44';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 171, 68, 0.1)' : '#f0fff4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--ifm-background-color)' : 'white';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" style={{ flexShrink: 0 }}>
                          <use href="#corner-arrow-icon" />
                        </svg>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                  </div>
                )}
              </div>

              <div style={{
                padding: '0.375rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🚀</span> Deployment
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedDeploymentQuestions.map((question, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: isDarkMode ? 'var(--ifm-font-color-base)' : '#495057',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00AB44';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 171, 68, 0.1)' : '#f0fff4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--ifm-background-color)' : 'white';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" style={{ flexShrink: 0 }}>
                          <use href="#corner-arrow-icon" />
                        </svg>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '0.375rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚙️</span> Operations
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedOperationsQuestions.map((question, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: isDarkMode ? 'var(--ifm-font-color-base)' : '#495057',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00AB44';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 171, 68, 0.1)' : '#f0fff4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--ifm-background-color)' : 'white';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" style={{ flexShrink: 0 }}>
                          <use href="#corner-arrow-icon" />
                        </svg>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '0.375rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🤖</span> AI & Machine Learning
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedAiMlQuestions.map((question, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: isDarkMode ? 'var(--ifm-font-color-base)' : '#495057',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00AB44';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 171, 68, 0.1)' : '#f0fff4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--ifm-background-color)' : 'white';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" style={{ flexShrink: 0 }}>
                          <use href="#corner-arrow-icon" />
                        </svg>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '0.375rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📊</span> Dashboards
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedDashboardQuestions.map((question, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: isDarkMode ? 'var(--ifm-font-color-base)' : '#495057',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00AB44';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 171, 68, 0.1)' : '#f0fff4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--ifm-background-color)' : 'white';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" style={{ flexShrink: 0 }}>
                          <use href="#corner-arrow-icon" />
                        </svg>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                padding: '0.375rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔔</span> Alerts
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedAlertsQuestions.map((question, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSuggestionClick(question)}
                      style={{
                        textAlign: 'left',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid transparent',
                        backgroundColor: isDarkMode ? 'var(--ifm-background-color)' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: isDarkMode ? 'var(--ifm-font-color-base)' : '#495057',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#00AB44';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(0, 171, 68, 0.1)' : '#f0fff4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'var(--ifm-background-color)' : 'white';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg width="14" height="14" style={{ flexShrink: 0 }}>
                          <use href="#corner-arrow-icon" />
                        </svg>
                        <span>{question}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div> 
              */}
            </div>
            </div>
          </>
        ) : (
          <div style={messagesContainerStyle}>
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
            {messages.map((message) => (
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
                  } : {})
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
            ))}
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
                    background: 'linear-gradient(90deg, transparent, #00d4ff, #00ab44, transparent)',
                    animation: 'scanBackForth 2s ease-in-out infinite',
                    boxShadow: '0 0 10px rgba(0, 212, 255, 0.8), 0 0 20px rgba(0, 171, 68, 0.6)'
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