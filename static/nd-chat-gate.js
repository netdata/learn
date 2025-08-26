(function () {
  function allowIfNotHome() {
    var onHome = location.pathname === '/' || location.pathname === '/index.html';
    document.documentElement.classList.toggle('nd-chat-allow', !onHome);
  }

  // Run at load (prevents flash on F5)
  if (document.readyState === 'complete') {
    allowIfNotHome();
  } else {
    window.addEventListener('load', allowIfNotHome);
  }

  // Also handle SPA route changes in Docusaurus
  function onRouteChange() { allowIfNotHome(); }

  // popstate for back/forward
  window.addEventListener('popstate', onRouteChange);

  // patch pushState to catch internal navigations
  (function (history) {
    var _push = history.pushState;
    history.pushState = function () {
      var ret = _push.apply(this, arguments);
      onRouteChange();
      return ret;
    };
  })(window.history);
})();
