import React, { useEffect, useState } from "react";
import { useLocation } from '@docusaurus/router';
import "/src/css/search.css";

const SearchBar = () => {
  const [value, setValue] = useState("");
  // call hook unconditionally (top-level) and compute hide-path flag
  const location = useLocation();
  // this flag is true when we are on the path where the legacy search should be hidden
  const isDocsPath = !!(location && location.pathname && location.pathname === '/docs/ask-netdata');
  const injectedScriptRef = React.useRef(null);

  useEffect(() => {
    // Skip legacy Google CSE injection on the configured hide path
    if (isDocsPath) return;

    // Avoid double-injecting the script on repeated navigations
    try {
      const cx = "21ffa45504a5f4a8c";
      const existing = document.querySelector(`script[src*="cse.google.com/cse.js?cx=${cx}"]`);
      if (!existing) {
        const gcse = document.createElement("script");
        gcse.type = "text/javascript";
        gcse.async = true;
        gcse.src = `https://cse.google.com/cse.js?cx=${cx}`;
        const s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(gcse, s);
        injectedScriptRef.current = gcse;
      } else {
        injectedScriptRef.current = existing;
      }
    } catch (err) {
      // defensive: don't block rendering if DOM not available
      injectedScriptRef.current = null;
    }

    var renderSearchForms = function () {
      if (document.readyState === "complete") {
        window.google.search.cse.element.render({
          div: "googlesearch",
          tag: "search",
          gname: "gsearch",
        });
        document.getElementById('gsc-i-id1').placeholder = 'SEARCH ⌘ + L';
      } else {
        window.google.setOnLoadCallback(function () {
          window.google.search.cse.element.render({
            div: "googlesearch",
            tag: "search",
            gname: "gsearch",
          });
          document.getElementById('gsc-i-id1').placeholder = 'SEARCH ⌘ + K';
        }, true);
      }
    };

    window.__gcse = {
      parsetags: "explicit",
      callback: renderSearchForms,
    };

    // cleanup when leaving pages where CSE should be active
    return () => {
      try {
        // remove the injected script if we added it
        if (injectedScriptRef.current && injectedScriptRef.current.parentNode) {
          injectedScriptRef.current.parentNode.removeChild(injectedScriptRef.current);
        }

        // remove global callback/state
        if (window.__gcse) delete window.__gcse;

        // try to remove google.cse if present
        if (window.google && window.google.search && window.google.search.cse) {
          try { delete window.google.search.cse; } catch (e) { /* ignore */ }
        }

        // clear the rendered DOM under our container
        const container = document.getElementById('googlesearch');
        if (container) container.innerHTML = '';

        // remove common GSC elements that may have been added elsewhere
        const gscNodes = document.querySelectorAll('.gsc-control-wrapper, .gsc-searchbox, .gsc-resultsbox-visible, #gsc-i-id1');
        gscNodes.forEach(n => n.parentNode && n.parentNode.removeChild(n));
      } catch (e) {
        // swallow cleanup errors
      }
    };
  }, [isDocsPath]);

  useEffect(() => {
    if (isDocsPath) return;

    // Add event listener on keydown
    const onKeyDown = (event) => {
      if ((event.ctrlKey && event.keyCode === 76) || (event.metaKey && event.keyCode === 76)) {
        event.preventDefault();
        const el = document.getElementById('gsc-i-id1');
        if (el) el.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isDocsPath]);

  return (
    <div id="search-container">
      {/* <input name="search" id="search" value={value} onChange={handleChange} /> */}

      <div id="googlesearch"></div>
    </div>
  );
};

export default SearchBar;