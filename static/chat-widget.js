(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    // Get configuration
    const config = window.NETDATA_WIDGET_CONFIG || {
      widgetUrl: 'https://fcd3e57ca366.ngrok-free.app/widget.html',
      position: 'bottom-right',
      buttonSize: '60px',
      expandedWidth: '400px',
      expandedHeight: '600px',
    };

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'netdata-chat-widget';
    widgetContainer.className = 'netdata-chat-widget';
    
    // Create floating button
    const floatingButton = document.createElement('button');
    floatingButton.id = 'netdata-chat-button';
    floatingButton.className = 'netdata-chat-button';
    floatingButton.innerHTML = `
      <div class="button-content">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="chat-icon">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor"/>
          <path d="M7 9H17V11H7V9ZM7 6H17V8H7V6ZM7 12H14V14H7V12Z" fill="currentColor"/>
        </svg>
        <span class="button-text">Ask Netdata</span>
      </div>
      <span class="notification-badge" style="display: none;">1</span>
    `;
    
    // Create chat window container
    const chatWindow = document.createElement('div');
    chatWindow.id = 'netdata-chat-window';
    chatWindow.className = 'netdata-chat-window';
    chatWindow.style.display = 'none';
    
    // Create header for chat window
    const chatHeader = document.createElement('div');
    chatHeader.className = 'netdata-chat-header';
    chatHeader.innerHTML = `
      <div class="chat-header-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 8px;">
          <path d="M12 2L2 7V12C2 16.55 4.84 20.74 9 22C13.16 20.74 22 16.55 22 12V7L12 2Z" fill="#00AB44"/>
        </svg>
        Ask Netdata AI
      </div>
      <div class="chat-header-actions">
        <button class="chat-minimize-btn" title="Minimize">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
          </svg>
        </button>
        <button class="chat-close-btn" title="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    `;
    
    // Create iframe for chat content
    const chatIframe = document.createElement('iframe');
    chatIframe.id = 'netdata-chat-iframe';
    chatIframe.src = config.widgetUrl;
    chatIframe.frameBorder = '0';
    chatIframe.style.width = '100%';
    chatIframe.style.height = 'calc(100% - 50px)'; // Subtract header height
    chatIframe.style.border = 'none';
    chatIframe.style.borderRadius = '0 0 12px 12px';
    
    // Assemble the widget
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatIframe);
    widgetContainer.appendChild(floatingButton);
    widgetContainer.appendChild(chatWindow);
    document.body.appendChild(widgetContainer);
    
    // State management
    let isOpen = false;
    let isMinimized = false;
    
    // Load saved state from localStorage
    const savedState = localStorage.getItem('netdata-chat-widget-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.isOpen) {
        openChat();
      }
    }
    
    // Event handlers
    floatingButton.addEventListener('click', toggleChat);
    
    chatHeader.querySelector('.chat-minimize-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      minimizeChat();
    });
    
    chatHeader.querySelector('.chat-close-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      closeChat();
    });
    
    // Functions
    function toggleChat() {
      if (isOpen) {
        minimizeChat();
      } else {
        openChat();
      }
    }
    
    function openChat() {
      isOpen = true;
      isMinimized = false;
      chatWindow.style.display = 'flex';
      floatingButton.classList.add('active');
      chatWindow.classList.add('open');
      chatWindow.classList.remove('minimized');
      saveState();
      
      // Hide notification badge when opening
      const badge = floatingButton.querySelector('.notification-badge');
      if (badge) {
        badge.style.display = 'none';
      }
    }
    
    function minimizeChat() {
      isMinimized = true;
      chatWindow.classList.add('minimized');
      chatWindow.classList.remove('open');
      floatingButton.classList.remove('active');
      setTimeout(() => {
        chatWindow.style.display = 'none';
      }, 300);
      saveState();
    }
    
    function closeChat() {
      isOpen = false;
      isMinimized = false;
      chatWindow.classList.remove('open');
      chatWindow.classList.remove('minimized');
      floatingButton.classList.remove('active');
      setTimeout(() => {
        chatWindow.style.display = 'none';
      }, 300);
      saveState();
    }
    
    function saveState() {
      localStorage.setItem('netdata-chat-widget-state', JSON.stringify({
        isOpen: isOpen && !isMinimized
      }));
    }
    
    // Listen for messages from iframe (optional - for notifications)
    window.addEventListener('message', function(e) {
      // You can implement notification logic here
      // For example, show a badge when a new message arrives while minimized
      if (isMinimized && e.origin === new URL(config.widgetUrl).origin) {
        const badge = floatingButton.querySelector('.notification-badge');
        if (badge && e.data.type === 'new-message') {
          badge.style.display = 'flex';
        }
      }
    });
  }
})();