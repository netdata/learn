/* Learn capture and link handoff. Existing cookie roots remain Website-only. */
(function (root) {
  'use strict';
  if (root.ndLearnFirstTouch || root.location.origin !== 'https://learn.netdata.cloud') return;
  var NAME = 'nd_first_touch';
  var TOKEN = 'phc_hnhlqe6D2Q4IcQNrFItaqdXJAxQ8RcHkPAFAp74pubv';
  var LIMIT = 3800;
  var retained;
  var links = new WeakMap();

  function rawCookie() {
    try {
      var found = document.cookie.split(';').map(function (part) { return part.trim(); })
        .filter(function (part) { return part.indexOf(NAME + '=') === 0; });
      return found.length === 0 ? null : found.length === 1 ? found[0].slice(NAME.length + 1) : undefined;
    } catch (error) { return undefined; }
  }

  function optedOut() {
    try {
      var key = '__ph_opt_in_out_' + TOKEN;
      return (root.posthog && root.posthog.__loaded &&
          root.posthog.has_opted_out_capturing && root.posthog.has_opted_out_capturing() === true) ||
        root.localStorage.getItem(key) === '0' ||
        document.cookie.split(';').some(function (part) { return part.trim() === key + '=0'; });
    } catch (error) { return true; }
  }

  function capture() {
    if (optedOut()) return;
    retained = rawCookie();
    if (retained !== null) return;
    try {
      var entry = {
        surface: 'learn', path: root.location.pathname, referrer: document.referrer || '',
        ts: new Date().toISOString()
      };
      var params = new URLSearchParams(root.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
        entry[key] = params.get(key) || '';
      });
      if (!/^\/(?!\/)[^?#\\\u0000-\u0020\u007f]*$/.test(entry.path)) return;
      var value = encodeURIComponent(JSON.stringify({ version: 2, entry: entry }));
      if (value.length > LIMIT) return;
      // Recheck after constructing the record; a cookie offers no atomic cross-tab transaction.
      var existing = rawCookie();
      if (existing !== null) { retained = existing; return; }
      retained = value;
      var expires = new Date(Date.parse(entry.ts) + 90 * 86400000).toUTCString();
      document.cookie = NAME + '=' + value + '; Domain=.netdata.cloud; Path=/; Expires=' + expires + '; SameSite=Lax; Secure';
    } catch (error) { /* Document evidence can still accompany a link when persistence is refused. */ }
  }

  function envelope() {
    if (optedOut() || !root.ndFirstTouchHandoff) return null;
    var raw = rawCookie();
    if (raw === undefined) return null;
    var current = root.ndFirstTouchHandoff.project(raw === null ? retained : raw);
    if (raw === null || retained === null || retained === undefined || raw === retained) return current;
    var original = root.ndFirstTouchHandoff.project(retained);
    // A competing writer must not silently replace earlier document evidence.
    if (!current || !original) return null;
    var currentTime = Date.parse(current.entry.ts);
    var originalTime = Date.parse(original.entry.ts);
    if (originalTime < currentTime) return original;
    if (currentTime < originalTime) return current;
    return JSON.stringify(current.entry) === JSON.stringify(original.entry) ? current : null;
  }

  function decorate(anchor) {
    try {
      if (!anchor || !anchor.matches || !anchor.matches('a[href]')) return;
      var href = anchor.getAttribute('href');
      var previous = links.get(anchor);
      var source = previous && previous.decorated === href ? previous.source : href;
      if (!source) return;
      var url = new URL(source, root.location.href);
      if (url.origin !== 'https://app.netdata.cloud' || url.username || url.password) return;
      var value = envelope();
      var target = source.indexOf('//') === 0 ? 'https:' + source : source;
      var result = value ? root.ndFirstTouchHandoff.decorate(target, value) : source;
      links.set(anchor, { source: source, decorated: result });
      if (result !== href) anchor.setAttribute('href', result);
    } catch (error) { /* Attribution must never interfere with navigation. */ }
  }

  function refresh(node) {
    if (node.matches && node.matches('a[href]')) decorate(node);
    if (node.querySelectorAll) node.querySelectorAll('a[href]').forEach(decorate);
  }

  capture();
  root.ndLearnFirstTouch = { refresh: function () { refresh(document); } };
  refresh(document);
  if (root.MutationObserver) {
    new root.MutationObserver(function (records) {
      records.forEach(function (record) {
        if (record.type === 'attributes') decorate(record.target);
        else record.addedNodes.forEach(refresh);
      });
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });
  }
  ['pointerdown', 'focusin', 'contextmenu', 'click', 'auxclick'].forEach(function (name) {
    document.addEventListener(name, function (event) {
      var anchor = event.target && event.target.closest && event.target.closest('a[href]');
      if (anchor) decorate(anchor);
    }, true);
  });
  root.addEventListener('pageshow', root.ndLearnFirstTouch.refresh);
  root.addEventListener('focus', root.ndLearnFirstTouch.refresh);
  if (root.cookieStore && root.cookieStore.addEventListener) {
    root.cookieStore.addEventListener('change', function (event) {
      if (event.changed.concat(event.deleted).some(function (cookie) { return cookie.name === NAME; })) {
        root.ndLearnFirstTouch.refresh();
      }
    });
  }
})(window);
