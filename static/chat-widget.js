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
        <button class="chat-fullscreen-btn" title="Fullscreen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="fullscreen-icon">
            <path d="M7 14H5V19H10V17H7V14ZM5 10H7V7H10V5H5V10ZM17 17H14V19H19V14H17V17ZM14 5V7H17V10H19V5H14Z" fill="currentColor"/>
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="exit-fullscreen-icon" style="display: none;">
            <path d="M5 16H8V19H10V14H5V16ZM8 8H5V10H10V5H8V8ZM14 19H16V16H19V14H14V19ZM16 8V5H14V10H19V8H16Z" fill="currentColor"/>
          </svg>
        </button>
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
    
    // Create resize handles
    const resizeHandles = {
      n: document.createElement('div'),
      ne: document.createElement('div'),
      e: document.createElement('div'),
      se: document.createElement('div'),
      s: document.createElement('div'),
      sw: document.createElement('div'),
      w: document.createElement('div'),
      nw: document.createElement('div')
    };
    
    Object.keys(resizeHandles).forEach(direction => {
      resizeHandles[direction].className = `resize-handle resize-${direction}`;
      chatWindow.appendChild(resizeHandles[direction]);
    });
    
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
    let isFullscreen = false;
    let currentWidth = parseInt(config.expandedWidth) || 400;
    let currentHeight = parseInt(config.expandedHeight) || 600;
    let previousPosition = { bottom: '90px', right: '20px' };
    let previousSize = { width: currentWidth, height: currentHeight };
    
    // Load saved state from localStorage
    const savedState = localStorage.getItem('netdata-chat-widget-state');
    if (savedState) {
      const state = JSON.parse(savedState);
      if (state.width) currentWidth = state.width;
      if (state.height) currentHeight = state.height;
      if (state.isOpen) {
        chatWindow.style.width = currentWidth + 'px';
        chatWindow.style.height = currentHeight + 'px';
        openChat();
      }
      if (state.isFullscreen) {
        toggleFullscreen();
      }
    }
    
    // Event handlers
    floatingButton.addEventListener('click', toggleChat);
    
    chatHeader.querySelector('.chat-fullscreen-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      toggleFullscreen();
    });
    
    chatHeader.querySelector('.chat-minimize-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      minimizeChat();
    });
    
    chatHeader.querySelector('.chat-close-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      closeChat();
    });
    
    // Initialize resize functionality
    initResize();
    
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
        isOpen: isOpen && !isMinimized,
        isFullscreen: isFullscreen,
        width: currentWidth,
        height: currentHeight
      }));
    }
    
    function toggleFullscreen() {
      const fullscreenBtn = chatHeader.querySelector('.chat-fullscreen-btn');
      const fullscreenIcon = fullscreenBtn.querySelector('.fullscreen-icon');
      const exitFullscreenIcon = fullscreenBtn.querySelector('.exit-fullscreen-icon');
      
      if (!isFullscreen) {
        // Enter fullscreen
        isFullscreen = true;
        previousPosition = {
          bottom: chatWindow.style.bottom || '90px',
          right: chatWindow.style.right || '20px'
        };
        previousSize = {
          width: chatWindow.offsetWidth,
          height: chatWindow.offsetHeight
        };
        
        chatWindow.classList.add('fullscreen');
        fullscreenIcon.style.display = 'none';
        exitFullscreenIcon.style.display = 'block';
        
        // Disable resize handles in fullscreen
        Object.keys(resizeHandles).forEach(direction => {
          resizeHandles[direction].style.display = 'none';
        });
      } else {
        // Exit fullscreen
        isFullscreen = false;
        chatWindow.classList.remove('fullscreen');
        fullscreenIcon.style.display = 'block';
        exitFullscreenIcon.style.display = 'none';
        
        // Restore previous size
        chatWindow.style.width = previousSize.width + 'px';
        chatWindow.style.height = previousSize.height + 'px';
        chatWindow.style.bottom = previousPosition.bottom;
        chatWindow.style.right = previousPosition.right;
        
        // Re-enable resize handles
        Object.keys(resizeHandles).forEach(direction => {
          resizeHandles[direction].style.display = '';
        });
      }
      
      saveState();
    }
    
    function initResize() {
      let isResizing = false;
      let currentHandle = null;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let startBottom = 0;
      let startRight = 0;
      
      // Add mousedown listeners to all resize handles
      Object.keys(resizeHandles).forEach(direction => {
        resizeHandles[direction].addEventListener('mousedown', (e) => {
          if (isFullscreen) return;
          
          isResizing = true;
          currentHandle = direction;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = chatWindow.offsetWidth;
          startHeight = chatWindow.offsetHeight;
          
          const rect = chatWindow.getBoundingClientRect();
          startBottom = window.innerHeight - rect.bottom;
          startRight = window.innerWidth - rect.right;
          
          chatWindow.classList.add('resizing');
          document.body.style.userSelect = 'none';
          e.preventDefault();
        });
      });
      
      // Global mouse move handler
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        let newBottom = startBottom;
        let newRight = startRight;
        
        // Handle resize based on direction
        if (currentHandle.includes('e')) {
          newWidth = Math.max(300, Math.min(startWidth + deltaX, window.innerWidth - 40));
        }
        if (currentHandle.includes('w')) {
          newWidth = Math.max(300, Math.min(startWidth - deltaX, window.innerWidth - 40));
          newRight = startRight + deltaX;
        }
        if (currentHandle.includes('s')) {
          newHeight = Math.max(400, Math.min(startHeight + deltaY, window.innerHeight - 120));
        }
        if (currentHandle.includes('n')) {
          newHeight = Math.max(400, Math.min(startHeight - deltaY, window.innerHeight - 120));
          newBottom = startBottom + deltaY;
        }
        
        // Apply new dimensions
        chatWindow.style.width = newWidth + 'px';
        chatWindow.style.height = newHeight + 'px';
        
        // Apply new position for west/north handles
        if (currentHandle.includes('w')) {
          chatWindow.style.right = Math.max(20, newRight) + 'px';
        }
        if (currentHandle.includes('n')) {
          chatWindow.style.bottom = Math.max(90, newBottom) + 'px';
        }
        
        currentWidth = newWidth;
        currentHeight = newHeight;
      });
      
      // Global mouse up handler
      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          currentHandle = null;
          chatWindow.classList.remove('resizing');
          document.body.style.userSelect = '';
          saveState();
        }
      });
      
      // Make header draggable
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let windowStartX = 0;
      let windowStartY = 0;
      
      chatHeader.addEventListener('mousedown', (e) => {
        if (isFullscreen) return;
        if (e.target.closest('.chat-header-actions')) return;
        
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        const rect = chatWindow.getBoundingClientRect();
        windowStartX = rect.left;
        windowStartY = rect.top;
        
        chatWindow.classList.add('dragging');
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        const newLeft = windowStartX + deltaX;
        const newTop = windowStartY + deltaY;
        
        // Convert to right/bottom positioning
        const newRight = window.innerWidth - newLeft - chatWindow.offsetWidth;
        const newBottom = window.innerHeight - newTop - chatWindow.offsetHeight;
        
        // Apply boundaries
        chatWindow.style.right = Math.max(0, Math.min(newRight, window.innerWidth - chatWindow.offsetWidth)) + 'px';
        chatWindow.style.bottom = Math.max(0, Math.min(newBottom, window.innerHeight - chatWindow.offsetHeight)) + 'px';
      });
      
      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          chatWindow.classList.remove('dragging');
          document.body.style.userSelect = '';
        }
      });
    }
    
    // Expose global function for homepage to open widget in fullscreen
    window.openAskNetdata = function(openInFullscreen = false) {
      if (!isOpen) {
        openChat();
      }
      
      if (openInFullscreen && !isFullscreen) {
        setTimeout(() => {
          toggleFullscreen();
        }, 100); // Small delay to ensure widget is open first
      }
    };
    
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