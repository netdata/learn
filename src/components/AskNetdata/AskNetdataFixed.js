import React, { useState, useEffect, useRef } from 'react';
import Mermaid from '@theme/Mermaid';

// API configuration
const apiUrl = 'https://agent-events.netdata.cloud/ask-netdata/api';

export default function AskNetdataFixed() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('AskNetdata component is mounting!');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setShowWelcome(false);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '',
        citations: [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                assistantMessage.content += data.text;
                setMessages(prev => 
                  prev.map(m => m.id === assistantMessage.id 
                    ? { ...m, content: assistantMessage.content }
                    : m
                  )
                );
              } else if (data.type === 'citations') {
                assistantMessage.citations = data.citations;
                setMessages(prev => 
                  prev.map(m => m.id === assistantMessage.id 
                    ? { ...m, citations: data.citations }
                    : m
                  )
                );
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
    handleSubmit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatMessage = (content) => {
    // Convert markdown links
    let formatted = content.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: underline;">$1</a>'
    );

    // Format code blocks
    formatted = formatted.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto;"><code>$2</code></pre>'
    );

    // Format inline code
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 2px;">$1</code>'
    );

    formatted = formatted.split('\n').join('<br/>');
    return { __html: formatted };
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - var(--ifm-navbar-height))',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)'
  };

  const chatAreaStyle = {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '100px'
  };

  const welcomeStyle = {
    maxWidth: '900px',
    margin: '60px auto',
    padding: '20px',
    textAlign: 'center'
  };

  const welcomeTitleStyle = {
    fontSize: '48px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px'
  };

  const suggestionGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '40px'
  };

  const suggestionCardStyle = {
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  };

  const messagesContainerStyle = {
    maxWidth: '900px',
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
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    borderTop: '1px solid #e5e7eb',
    padding: '16px 20px',
    zIndex: 100,
    backdropFilter: 'blur(10px)'
  };

  const inputFormStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end'
  };

  const chatInputStyle = {
    flex: 1,
    padding: '14px 20px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '16px',
    resize: 'vertical',
    minHeight: '56px',
    maxHeight: '200px',
    background: 'white',
    fontFamily: 'inherit'
  };

  const sendButtonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 24px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    fontSize: '16px',
    opacity: isLoading ? 0.5 : 1
  };

  return (
    <div style={containerStyle}>
      <div style={chatAreaStyle}>
        {showWelcome ? (
          <div style={welcomeStyle}>
            <h1 style={welcomeTitleStyle}>Ask Netdata AI</h1>
            <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '48px' }}>
              Get instant answers about monitoring, troubleshooting, and optimizing your infrastructure
            </p>

            <div style={suggestionGridStyle}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={suggestionCardStyle}
                  onClick={() => handleSuggestionClick(suggestion.question)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{suggestion.icon}</div>
                  <div style={{ fontWeight: '600', color: '#667eea', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {suggestion.category}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                    "{suggestion.question}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={messagesContainerStyle}>
            {messages.map((message) => (
              <div key={message.id} style={messageStyle}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={avatarStyle(message.type)}>
                    {message.type === 'user' ? 'U' : 'N'}
                  </div>
                  <div style={{ flex: 1, lineHeight: '1.7', color: '#1f2937', fontSize: '16px' }}>
                    <div dangerouslySetInnerHTML={formatMessage(message.content)} />
                    {message.citations && message.citations.length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                          Learn more:
                        </div>
                        {message.citations.map((citation, idx) => (
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
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={messageStyle}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={avatarStyle('assistant')}>N</div>
                  <div style={{ display: 'flex', gap: '4px', padding: '8px 0' }}>
                    <span style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                  </div>
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
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Netdata... (Shift+Enter for new line)"
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
            Send
          </button>
        </form>
      </div>
    </div>
  );
}