import React, { useEffect, useState } from "react";
import "/src/css/search.css";

const SearchBar = () => {
  const [value, setValue] = useState("");

  useEffect(() => {
    (function () {
      const cx = "21ffa45504a5f4a8c";
      const gcse = document.createElement("script");
      gcse.type = "text/javascript";
      gcse.async = true;
      gcse.src = `https://cse.google.com/cse.js?cx=${cx}`;
      const s = document.getElementsByTagName("script")[0];
      s.parentNode.insertBefore(gcse, s);
    })();

    var renderSearchForms = function () {
      if (document.readyState === "complete") {
        window.google.search.cse.element.render({
          div: "googlesearch",
          tag: "search",
          gname: "gsearch",
        });
        document.getElementById('gsc-i-id1').placeholder = 'SEARCH ⌘ + K';
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
  }, []);

  useEffect(() => {
    // Add event listener on keydown once and clean up on unmount.
    const onKeyDown = (event) => {
      // If the google search input is focused, stop Enter from bubbling to parent forms
      try {
        const active = document.activeElement;
        if (active && (event.key === 'Enter' || event.keyCode === 13)) {
          if (active.closest && active.closest('#googlesearch')) {
            // Allow the input to handle Enter (don't preventDefault) but stop propagation
            event.stopPropagation();
            return;
          }
        }
      } catch (err) {
        // ignore DOM errors
      }

      // focus search input on Ctrl/Cmd + K
      if ((event.ctrlKey || event.metaKey) && (event.key === 'k' || event.key === 'K')) {
        event.preventDefault();
        const el = document.getElementById('gsc-i-id1');
        if (el && typeof el.focus === 'function') el.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div id="search-container">
      {/* <input name="search" id="search" value={value} onChange={handleChange} /> */}

      <div id="googlesearch"></div>
    </div>
  );
};

export default SearchBar;