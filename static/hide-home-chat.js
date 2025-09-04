(function () {
  // SPA-aware toggling of the hide CSS so it doesn't persist after navigation
  function normalizePath(p) {
    return (p || '').replace(/\/+$/, '') || '/';
  }

  // Only hide the widget on the Ask Netdata docs page(s)
  const shouldHide = (path) => {
    const np = normalizePath(path || location.pathname || '');
    return np === '/docs/ask-netdata' || np.startsWith('/docs/ask-netdata');
  };

  function ensureHideStyle(on) {
    try {
      var existing = document.getElementById('nd-hide-bubble');
      if (on) {
        if (!existing) {
          var s = document.createElement('style');
          s.id = 'nd-hide-bubble';
          s.textContent = '#netdata-chat-widget,.netdata-chat-widget,.netdata-chat-button,.netdata-chat-window{display:none!important}';
          document.head.appendChild(s);
        }

        // If the widget was already added to the DOM, remove it immediately.
        var widget = document.getElementById('netdata-chat-widget');
        if (widget && widget.parentNode) widget.parentNode.removeChild(widget);

        // Observe future DOM insertions and remove the widget if it appears later
        if (!window.__nd_hide_widget_observer) {
          try {
            window.__nd_hide_widget_observer = new MutationObserver(function (mutations) {
              for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (!m.addedNodes) continue;
                for (var j = 0; j < m.addedNodes.length; j++) {
                  var node = m.addedNodes[j];
                  if (!node) continue;
                  if (node.id === 'netdata-chat-widget' || (node.classList && node.classList.contains('netdata-chat-widget'))) {
                    try { node.parentNode && node.parentNode.removeChild(node); } catch (e) {}
                  }
                  if (node.querySelector) {
                    var found = node.querySelector('#netdata-chat-widget, .netdata-chat-widget');
                    if (found) {
                      try { found.parentNode && found.parentNode.removeChild(found); } catch (e) {}
                    }
                  }
                }
              }
            });
            window.__nd_hide_widget_observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
          } catch (e) {
            // ignore
          }
        }
      } else {
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
        // disconnect observer if present
        try {
          if (window.__nd_hide_widget_observer) {
            window.__nd_hide_widget_observer.disconnect();
            window.__nd_hide_widget_observer = null;
          }
        } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
  }

  // Initial apply
  ensureHideStyle(shouldHide());

  // Watch SPA navigations (wrap history methods) and popstate
  const patch = (name) => {
    const orig = history[name];
    history[name] = function () {
      const rv = orig.apply(this, arguments);
      try { ensureHideStyle(shouldHide()); } catch (e) {}
      return rv;
    };
  };
  patch('pushState');
  patch('replaceState');
  window.addEventListener('popstate', function () { ensureHideStyle(shouldHide()); });
})();