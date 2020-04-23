/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useEffect} from 'react';

import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";
import { SearchProvider, Results, SearchBox } from "@elastic/react-search-ui";
import { Layout } from "@elastic/react-search-ui-views";

const SearchBar = (props) => {

  // const swiftTypeSrc = 
  //   `
  //     (function(w,d,t,u,n,s,e){w['SwiftypeObject']=n;w[n]=w[n]||function(){
  //     (w[n].q=w[n].q||[]).push(arguments);};s=d.createElement(t);
  //     e=d.getElementsByTagName(t)[0];s.async=1;s.src=u;e.parentNode.insertBefore(s,e);
  //     })(window,document,'script','//s.swiftypecdn.com/install/v2/st.js','_st');
      
  //     _st('install','VBjGCvSQ38_nBFaozfxk','2.0.0');
  //   `

  // useEffect(() => {
  //   const script = document.createElement('script');
  //   script.text = swiftTypeSrc;
  //   script.async = true;
  //   document.body.appendChild(script);
  //   return () => {
  //     document.body.removeChild(script);
  //   }
  // }, []);

  const connector = new SiteSearchAPIConnector({
    documentType: "all-netdata",
    engineKey: "BZL_aEiLAebVKkcm3eFr"
  });

  return (
    // <input type="text" className="st-default-search-input"></input>
    <SearchProvider
      config={{
        apiConnector: connector
      }}
    >
      <div className="App">
        <Layout
          header={<SearchBox />}
          bodyContent={<Results titleField="title" urlField="nps_link" />}
        />
      </div>
    </SearchProvider>
  )
}

export default SearchBar;
