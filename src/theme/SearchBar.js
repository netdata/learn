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

    // Add event listener on keydown
    document.addEventListener('keydown', (event) => {
      var name = event.key;
      var code = event.code;

      if ((event.ctrlKey && event.keyCode === 75) || (event.metaKey && event.keyCode === 75)) {
        event.preventDefault();
        document.getElementById('gsc-i-id1').focus()
      }
    });
  });

  return (
    <div id="search-container">
      {/* <input name="search" id="search" value={value} onChange={handleChange} /> */}

      <div id="googlesearch"></div>
    </div>
  );
};

export default SearchBar;
