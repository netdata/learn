/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import useTOCHighlight from '@theme/hooks/useTOCHighlight';
import styles from './styles.module.css';
const LINK_CLASS_NAME = 'table-of-contents__link';
const ACTIVE_LINK_CLASS_NAME = 'table-of-contents__link--active';
const TOP_OFFSET = 100;
/* eslint-disable jsx-a11y/control-has-associated-label */

function Headings({
  toc,
  isChild
}) {
  if (!toc.length) {
    return null;
  }

  return <ul className={isChild ? '' : 'table-of-contents table-of-contents__left-border'}>
      {toc.map(heading => <li key={heading.id}>
          <a href={`#${heading.id}`} className={LINK_CLASS_NAME} // Developer provided the HTML, so assume it's safe.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: heading.value
      }} />
          <Headings isChild toc={heading.children} />
        </li>)}
    </ul>;
}

function TOC({
  toc, 
  editUrl
}) {
  useTOCHighlight(LINK_CLASS_NAME, ACTIVE_LINK_CLASS_NAME, TOP_OFFSET);
  return <div className={clsx(styles.tableOfContents, 'thin-scrollbar')}>
      <p className={styles.tableofContentsHeading}>Contents</p> {/* EDIT */}
      <Headings toc={toc} />
      {/* BEGIN EDIT */}
      {editUrl && (
        <a
          className={clsx('button button--outline button-secondary button--lg toc__edit')}
          href={editUrl}
          target="_blank"
          rel="noreferrer noopener">
          <svg
            fill="currentColor"
            height="1.2em"
            width="1.2em"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 40 40"
            style={{
              marginRight: '0.3em',
              verticalAlign: 'sub',
            }}>
            <g>
              <path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z" />
            </g>
          </svg>
          Edit this page
        </a>
      )}
      {/* END EDIT */}
    </div>;
}

export default TOC;