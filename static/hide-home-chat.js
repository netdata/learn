(function(){
  if (location.pathname === '/') {
    var s = document.createElement('style');
    s.id = 'nd-hide-bubble';
    s.textContent = '#netdata-chat-widget,.netdata-chat-widget,.netdata-chat-button,.netdata-chat-window{display:none!important}';
    document.head.appendChild(s);
  }
})();
