/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';

import CookbookItem from '@theme/CookbookItem';
import Layout from '@theme/Layout';
import qs from 'qs';
import classnames from 'classnames';

import styles from './styles.module.scss';

function CookbookListPage(props) {
  const {items} = props;

  const queryObj = props.location ? qs.parse(props.location.search, {ignoreQueryPrefix: true}) : {};

  let itemsFiltered = items.slice(0);
  itemsFiltered.sort((a, b) => (b.content.metadata.featured === true && 1) || -1);

  //
  // State
  //

  const [onlyFeatured, setOnlyFeatured] = useState(queryObj['featured'] == 'true');
  const [searchTerm, setSearchTerm] = useState(null);
  const [searchLimit, setSearchLimit] = useState(20);

  let filteredCap = itemsFiltered.length;
  let increaseSearchLimit = function() {
    if ( searchLimit > filteredCap ) {
      return
    }
    let newLimit = searchLimit + 10;
    setSearchLimit(newLimit);
  };

  //
  // Filtering
  //

  if (searchTerm) {
    itemsFiltered = itemsFiltered.filter(item => {
      let searchTerms = searchTerm.split(" ");
      let content = `${item.content.metadata.title.toLowerCase()} ${item.content.metadata.description.toLowerCase()}`;
      return searchTerms.every(term => {
        return content.includes(term.toLowerCase())
      })
    });
  }

  if (onlyFeatured) {
    itemsFiltered = itemsFiltered.filter(item => item.content.metadata.featured == true);
  }

  filteredCap = itemsFiltered.length;
  itemsFiltered = itemsFiltered.slice(0, searchLimit);

  return (
    <Layout 
    title="Netdata Guides" 
    description="A collection of guides to walk you through the Netdata ecosystem of health monitoring and performance troubleshooting tools."
    >
      <header className={classnames(styles.guidesHeader)}>
        <div className="container">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <h1>Netdata Guides</h1>
              <p>A collection of guides to walk you through the Netdata ecosystem of health monitoring and performance troubleshooting tools.</p>
              <div className="search">
                <input
                  className={styles.guidesSearch}
                  type="text"
                  onChange={(event) => setSearchTerm(event.currentTarget.value)}
                  placeholder="🔍 Search..." />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className={styles.cookbookItemsContainer}>
        <div className="container container--narrow container--bleed margin-vert--lg">
          {itemsFiltered.map(({content: CookbookContent}) => (
            <CookbookItem
              key={CookbookContent.metadata.permalink}
              frontMatter={CookbookContent.frontMatter}
              metadata={CookbookContent.metadata}
              truncated>
              <CookbookContent />
            </CookbookItem>
          ))}
          {itemsFiltered.length > 0 && itemsFiltered.length < items.length && itemsFiltered.length > searchLimit &&
            <div className="col">
              <button className="button button--secondary cookbook-show-more" onClick={() => increaseSearchLimit()}>Show more</button>
            </div>}
          {itemsFiltered.length == 0 &&
            <div className="col">
              <p>Whoops! There is no guide matching matching your search. If you feel we're missing an essential guide, please <a href="">file an issue on GitHub</a> the information you're looking for.</p>
            </div>}
        </div>
      </div>
    </Layout>
  );
}

export default CookbookListPage;
