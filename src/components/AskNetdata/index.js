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
    
    // Reset height to calculate scroll height correctly
    textarea.style.height = '56px';
    
    // Calculate new height
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = typeof window !== 'undefined' ? Math.max(200, window.innerHeight / 3) : 200;
    
    // If user manually resized beyond max, respect their choice
    const currentHeight = parseInt(textarea.style.height);
    if (currentHeight > maxHeight && scrollHeight <= currentHeight) {
      return; // Keep user's manual resize
    }
    
    // Set new height
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const suggestions = [
    {
      icon: '🚀',
      category: 'Getting Started',
      question: 'How do I install Netdata on Ubuntu?'
    },
    {
      icon: '🏗️',
      category: 'Deployment',
      question: 'Can you visually explain how to setup parents for high availability?'
    },
    {
      icon: '🐳',
      category: 'Container Monitoring',
      question: 'How to monitor Docker containers with Netdata?'
    },
    {
      icon: '⚠️',
      category: 'Alerting',
      question: 'What alerts should I configure for MySQL monitoring?'
    },
    {
      icon: '📊',
      category: 'Dashboards',
      question: 'How to create custom dashboards in Netdata Cloud?'
    },
    {
      icon: '🔧',
      category: 'Configuration',
      question: 'How do I configure email notifications?'
    },
    {
      icon: '🔍',
      category: 'Troubleshooting',
      question: 'Why is my agent not connecting to Netdata Cloud?'
    }
  ];

  // All deployment questions - we'll randomly select 4
  const deploymentQuestions = [
    'Can I run Netdata in hybrid or multi-cloud setups?',
    'How does Netdata scale in large environments?',
    'Will running Netdata slow down my production servers?',
    'Can Netdata monitor bare-metal servers and GPUs?',
    'Can you visually explain how to setup parents for high availability?'
  ];

  // Function to randomly select n items from an array
  const getRandomSelection = (arr, n) => {
    if (arr.length <= n) return arr;
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
  };

  // Get 4 random deployment questions
  const selectedDeploymentQuestions = useMemo(() => 
    getRandomSelection(deploymentQuestions, 4), 
    []
  );

  // All dashboard questions - we'll randomly select 4
  const dashboardQuestions = [
    'How can I slice and dice any dataset with Netdata?',
    'How can I correlate a spike or a dive across my infrastructure?',
    'How can I create and edit custom dashboards, do I need to learn a query language?',
    'Can I use Netdata to search systemd journals or windows event logs?',
    'Does Netdata provide any fallback to access dashboards without internet access?',
    'What is the relationship between Spaces, Rooms, and dashboards?',
    'How do I share a dashboard view with a teammate?'
  ];

  // Get 4 random dashboard questions
  const selectedDashboardQuestions = useMemo(() => 
    getRandomSelection(dashboardQuestions, 4), 
    []
  );

  // All operations questions - we'll randomly select 4
  const operationsQuestions = [
    'Do I need to learn a query language to use Netdata?',
    'How Netdata will help me optimize my SRE team?',
    'Where are my data stored with Netdata?',
    'Which of my data are stored at Netdata Cloud?',
    'How do I visualize cost/resource usage per environment?'
  ];

  // Get 4 random operations questions
  const selectedOperationsQuestions = useMemo(() => 
    getRandomSelection(operationsQuestions, 4), 
    []
  );

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
    minHeight: 'calc(100vh - var(--ifm-navbar-height))',
    background: 'transparent',
    position: 'relative'
  };

  const chatAreaStyle = {
    flex: 1,
    paddingBottom: '20px'
    // Removed overflowY: 'auto' - page expands vertically
  };

  const welcomeStyle = {
    width: '100%',
    margin: '60px auto',
    padding: '20px',
    textAlign: 'center'
  };

  const welcomeTitleStyle = {
    fontSize: '48px',
    fontWeight: '700',
    color: '#00AB44',
    marginBottom: '16px'
  };

  const suggestionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '40px'
  };

  const suggestionCardStyle = {
    background: isDarkMode ? 'var(--ifm-background-surface-color)' : 'white',
    border: isDarkMode ? '2px solid var(--ifm-color-emphasis-300)' : '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  };

  const messagesContainerStyle = {
    width: '100%',
    margin: '0 auto',
    padding: '40px 20px'
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
    position: 'sticky',
    bottom: 0,
    background: isDarkMode ? 'var(--ifm-background-surface-color)' : 'white',
    borderTop: isDarkMode ? '1px solid var(--ifm-color-emphasis-300)' : '1px solid #e5e7eb',
    padding: '16px 20px',
    marginTop: 'auto'
  };

  const inputFormStyle = {
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end'
  };

  const chatInputStyle = {
    flex: 1,
    padding: '14px 20px',
    border: isInputFocused ? '2px solid #00AB44' : (isDarkMode ? '2px solid var(--ifm-color-emphasis-300)' : '2px solid #e5e7eb'),
    borderRadius: '12px',
    fontSize: '16px',
    resize: 'vertical',
    minHeight: '56px',
    maxHeight: typeof window !== 'undefined' ? `${Math.max(200, window.innerHeight / 3)}px` : '200px',
    background: isDarkMode ? 'var(--ifm-background-color)' : 'white',
    color: isDarkMode ? 'var(--ifm-font-color-base)' : '#1f2937',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    outline: 'none'
  };

  const sendButtonStyle = {
    background: '#00AB44',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isLoading ? 0.5 : 1,
    transition: 'background 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div ref={chatAreaRef} style={chatAreaStyle}>
        {showWelcome ? (
          <div style={welcomeStyle}>
            <h1 style={welcomeTitleStyle}>
              Ask Netdata Docs
            </h1>
            <p style={{ fontSize: '20px', color: isDarkMode ? 'var(--ifm-color-secondary)' : '#6b7280', marginBottom: '48px' }}>
              Get instant answers about monitoring, troubleshooting, and optimizing your infrastructure
            </p>

            {/* Corner Arrow Icon */}
            <svg style={{ display: 'none' }}>
              <defs>
                <symbol id="corner-arrow-icon" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M2.75 2a.75.75 0 0 1 .75.75v6.5h7.94l-.97-.97a.75.75 0 0 1 1.06-1.06l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H2.75A.75.75 0 0 1 2 10V2.75A.75.75 0 0 1 2.75 2Z" clipRule="evenodd"></path>
                </symbol>
              </defs>
            </svg>

            {/* Categorized Questions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1rem',
              marginTop: '20px'
            }}>
              {/* About Netdata */}
              <div style={{
                padding: '0.5rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>✨</span> About Netdata
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button 
                    onClick={() => handleSuggestionClick('What is Netdata and what makes it different?')}
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
                      <span>What is Netdata and what makes it different?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('What is a Netdata Agent, a Parent, and Netdata Cloud?')}
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
                      <span>What is a Netdata Agent, a Parent, and Netdata Cloud?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('What is distributed monitoring and why it matters for me?')}
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
                      <span>What is distributed monitoring and why it matters for me?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('Why and how is Netdata more cost efficient?')}
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
                      <span>Why and how is Netdata more cost efficient?</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Deployment */}
              <div style={{
                padding: '0.5rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.5rem',
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

              {/* Operations */}
              <div style={{
                padding: '0.5rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.5rem',
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

              {/* AI & Machine Learning */}
              <div style={{
                padding: '0.5rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🤖</span> AI & Machine Learning
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button 
                    onClick={() => handleSuggestionClick('How does anomaly detection work in Netdata?')}
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
                      <span>How does anomaly detection work in Netdata?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('Can I chat with Netdata with Claude Code or Gemini?')}
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
                      <span>Can I chat with Netdata with Claude Code or Gemini?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('What is AI Insights and how it can help me?')}
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
                      <span>What is AI Insights and how it can help me?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('Can Netdata identify the root cause of an issue for me?')}
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
                      <span>Can Netdata identify the root cause of an issue for me?</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dashboards */}
              <div style={{
                padding: '0.5rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.5rem',
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

              {/* Alerts */}
              <div style={{
                padding: '0.5rem',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: '#00AB44',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔔</span> Alerts
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button 
                    onClick={() => handleSuggestionClick('How do I configure alerts in Netdata?')}
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
                      <span>How do I configure alerts in Netdata?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('What are the best practices for setting alert thresholds?')}
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
                      <span>What are the best practices for setting alert thresholds?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('How can I integrate Netdata alerts with PagerDuty or Slack?')}
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
                      <span>How can I integrate Netdata alerts with PagerDuty or Slack?</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleSuggestionClick('How do I reduce alert noise and prevent alert fatigue?')}
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
                      <span>How do I reduce alert noise and prevent alert fatigue?</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
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

      <div style={inputContainerStyle}>
        <form onSubmit={handleSubmit} style={inputFormStyle}>
          <textarea
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
            placeholder="Ask anything about Netdata, in any language... (Shift+Enter for new line)"
            style={chatInputStyle}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            style={sendButtonStyle}
            disabled={!input.trim() || isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}