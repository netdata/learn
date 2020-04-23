/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect} from 'react';

const SearchBar = (props) => {

  const swiftTypeSrc = 
    `
      (function(w,d,t,u,n,s,e){w['SwiftypeObject']=n;w[n]=w[n]||function(){
      (w[n].q=w[n].q||[]).push(arguments);};s=d.createElement(t);
      e=d.getElementsByTagName(t)[0];s.async=1;s.src=u;e.parentNode.insertBefore(s,e);
      })(window,document,'script','//s.swiftypecdn.com/install/v2/st.js','_st');
      
      _st('install','VBjGCvSQ38_nBFaozfxk','2.0.0');
    `

  useEffect(() => {
    const script = document.createElement('script');
    script.text = swiftTypeSrc;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return (
    <input type="text" className="st-default-search-input"></input>
  )
}

export default SearchBar;
