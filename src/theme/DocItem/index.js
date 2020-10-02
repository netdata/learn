/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocPaginator from '@theme/DocPaginator';
import useTOCHighlight from '@theme/hooks/useTOCHighlight';
import DocVersionSuggestions from '@theme/DocVersionSuggestions';
import clsx from 'clsx';
import styles from './styles.module.scss';
const LINK_CLASS_NAME = 'table-of-contents__link';
const ACTIVE_LINK_CLASS_NAME = 'table-of-contents__link--active';
const TOP_OFFSET = 100;

function DocTOC({headings, editUrl}) {
  useTOCHighlight(LINK_CLASS_NAME, ACTIVE_LINK_CLASS_NAME, TOP_OFFSET);
  return (
    <div className="col col--3">
      <div className={styles.tableOfContents}>
        {/* Begin customization */}
        <p className={styles.tableofContentsHeading}>Contents</p>
        {/* End customization */}
        <Headings headings={headings} />
        {/* Begin customization */}
        {editUrl && (
          <a
            className={clsx('button button--secondary button--block button--lg toc__edit')}
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
        {/* End customization */}
      </div>
    </div>
  );
}
/* eslint-disable jsx-a11y/control-has-associated-label */

function Headings({headings, isChild}) {
  if (!headings.length) {
    return null;
  }

  return (
    <ul
      className={
        isChild ? '' : 'table-of-contents table-of-contents__left-border'
      }>
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={LINK_CLASS_NAME} // Developer provided the HTML, so assume it's safe.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: heading.value,
            }}
          />
          <Headings isChild headings={heading.children} />
        </li>
      ))}
    </ul>
  );
}

function DocItem(props) {
  const {siteConfig = {}} = useDocusaurusContext();
  const {url: siteUrl, title: siteTitle} = siteConfig;
  const {content: DocContent} = props;
  const {metadata} = DocContent;
  const {
    description,
    title,
    permalink,
    editUrl,
    lastUpdatedAt,
    lastUpdatedBy,
    version,
  } = metadata;
  const {
    frontMatter: {
      image: metaImage,
      keywords,
      hide_title: hideTitle,
      hide_table_of_contents: hideTableOfContents,
    },
  } = DocContent;
  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaImageUrl = useBaseUrl(metaImage, {
    absolute: true,
  });

  const isGuide = permalink.includes('/guides/');

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta property="og:title" content={metaTitle} />
        {description && <meta name="description" class="swiftype" data-type="string" content={description} />}
        {description && (
          <meta property="og:description" content={description} />
        )}
        {keywords && keywords.length && (
          <meta name="keywords" content={keywords.join(',')} />
        )}
        {metaImage && <meta property="og:image" content={metaImageUrl} />}
        {metaImage && <meta property="twitter:image" content={metaImageUrl} />}
        {metaImage && (
          <meta name="twitter:image:alt" content={`Image for ${title}`} />
        )}
        {permalink && <meta property="og:url" content={siteUrl + permalink} />}
        {permalink && <link rel="canonical" href={siteUrl + permalink} />}
      </Head>
      <div
        className={clsx('container padding-vert--lg', styles.docItemWrapper, isGuide && styles.guideItemWrapper)}>
        <div className="row">
          <div
            className={clsx('col', {
              [styles.docItemCol]: !hideTableOfContents,
            })}>
            <DocVersionSuggestions />
            <div className={styles.docItemContainer}>
              <article>
                {version && (
                  <div>
                    <span className="badge badge--secondary">
                      Version: {version}
                    </span>
                  </div>
                )}
                {!hideTitle && (
                  <header>
                    <h1 className={styles.docTitle}>{title}</h1>
                    {/* Begin customization */}
                    {isGuide && 
                      <svg className={styles.svg} viewBox="0 0 134 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.1" d="M0 1.75L4 3L6 5L10 8L14 9L17 10L18 12L21 14H25L28 11H30L33 13H36L39 11L42 10L44 8H48L50 5H53L56 7L60 9L63 7H67L68 10C68 10 70 12 71 11C72 10 74 12 74 12L79 14L81 11L85 10L89 7L92 6H95L99 8H103L106 6L108 4L112 5L115 6L119 7H123L126 6L129 5L132 6L134 7.26V21H0V1.75Z" fill="#EB5341"/>
                        <path opacity="0.7" d="M132.43 5.09002L129 3.95001L122.84 6.00001H119.13L115.32 5.05001L112.25 4.03001L107.7 2.89002L105.37 5.22001L102.7 7.00001H99.24L95.24 5.00001H91.84L88.53 6.10001L84.56 9.08001L80.38 10.12L78.62 12.77L74.55 11.14C74.09 10.71 72.89 9.72002 71.69 9.72002C71.15 9.72002 70.66 9.92001 70.3 10.28C69.98 10.28 69.34 9.87001 68.87 9.45001L67.72 6.00001H62.7L59.93 7.85001L56.5 6.13001L53.3 4.00001H49.46L47.46 7.00001H43.58L41.45 9.13001L38.55 10.1L35.7 12H33.3L30.3 10H27.58L24.58 13H21.3L18.77 11.32L17.7 9.19002L14.23 8.04002L10.43 7.09002L6.65 4.25001L4.53 2.13001L0 0.700012V1.75001L4 3.00001L6 5.00001L10 8.00001L14 9.00001L17 10L18 12L21 14H25L28 11H30L33 13H36L39 11L42 10L44 8.00001H48L50 5.00001H53L56 7.00001L60 9.00001L63 7.00001H67L68 10C68 10 70 12 71 11C72 10 74 12 74 12L79 14L81 11L85 10L89 7.00001L92 6.00001H95L99 8.00001H103L106 6.00001L108 4.00001L112 5.00001L115 6.00001L119 7.00001H123L129 5.00001L132 6.00001L134 7.26001V6.08001L132.43 5.09002Z" fill="#EB5341"/>
                        <path opacity="0.2" d="M0 6.08002L3 7.00002L5 9.00002L7 11H9L12 13L14 15H18L20.16 12.24L23 10H25L27 8.00002L31 7.00002L35 8.00002L38 11L42 12L45 14H48L51 12L53 9.00002L58 11H61L63 13H68L70 12L73.32 10.23L77 9.00002L79 10L82 12L85 13H90L93 11H96L100 12L104 14L108 12L110 11H114L117 9.00002L122 11L125 9.00002H130L133 12L134 15.61V21H0V6.08002Z" fill="#0091FF"/>
                        <path opacity="0.6" d="M133.89 11.48L130.41 8.00001H124.7L121.88 9.88L116.88 7.88L113.7 10H109.76L104 12.88L100.35 11.06L96.12 10H92.7L89.7 12H85.16L82.44 11.09L79.5 9.13L77.08 7.92001L72.92 9.31L69.55 11.11L67.76 12H63.41L61.41 10H58.19L52.62 7.77001L50.28 11.28L47.7 13H45.3L42.41 11.07L38.51 10.1L35.51 7.10001L31 5.97001L26.49 7.10001L24.59 9.00001H22.65L19.45 11.53L17.51 14H14.41L12.64 12.22L9.3 10H7.41L3.53 6.12001L0 5.04001V6.08L3 7.00001L7 11H9L12 13L14 15H18L20.16 12.24L23 10H25L27 8.00001L31 7.00001L35 8.00001L38 11L42 12L45 14H48L51 12L53 9.00001L58 11H61L63 13H68L70 12L73.32 10.23L77 9.00001L79 10L82 12L85 13H90L93 11H96L100 12L104 14L110 11H114L117 9.00001L122 11L125 9.00001H130L133 12L134 15.61V11.86L133.89 11.48Z" fill="#0091FF"/>
                        <path opacity="0.1" d="M0 11.44L3 12L5 15L8 17L11 18H17L21 16L25 15L28 13L31 12L33 14H37L38 15L41 16L45 17H50L53 15H55L58 16L60 14L64 15L67 16H70L72 14L76 15L80 16H83L85 15H89L91 16L94 17L97 16L99 14L103 15L108 13L113 14L115 15L118 17L121 18H125L127 17L130 16L134 12.52V21H0V11.44Z" fill="#00FF66"/>
                        <path opacity="0.4" d="M129.49 15.11L126.62 16.07L124.76 17H121.16L118.44 16.09L115.5 14.13L113.33 13.05L107.9 11.96L102.93 13.95L98.69 12.89L96.46 15.13L94 15.95L91.38 15.07L89.24 14H84.76L82.76 15H80.12L71.69 12.89L69.59 15H67.16L64.24 14.03L59.69 12.89L57.73 14.86L55.16 14H52.7L49.7 16H45.12L41.32 15.05L38.54 14.13L37.41 13H33.41L31.27 10.86L27.56 12.09L24.59 14.07L20.65 15.06L16.76 17H11.16L8.44 16.09L5.72 14.28L3.6 11.09L0 10.42V11.44L3 12L5 15L8 17L11 18H17L21 16L25 15L28 13L31 12L33 14H37L38 15L41 16L45 17H50L53 15H55L58 16L60 14L64 15L67 16H70L72 14L80 16H83L85 15H89L91 16L94 17L97 16L99 14L103 15L108 13L113 14L115 15L118 17L121 18H125L127 17L130 16L134 12.52V11.2L129.49 15.11Z" fill="#00FF66"/>
                      </svg>
                    }
                    {/* End customization */}
                  </header>
                )}
                <div className="markdown">
                  <DocContent />
                </div>
              </article>
              {(editUrl || lastUpdatedAt || lastUpdatedBy) && (
                <div className="margin-vert--xl">
                  <div className="row">
                    <div className="col">
                      {editUrl && (
                        <a
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
                    </div>
                    {(lastUpdatedAt || lastUpdatedBy) && (
                      <div className="col text--right">
                        <em>
                          <small>
                            Last updated{' '}
                            {lastUpdatedAt && (
                              <>
                                on{' '}
                                <time
                                  dateTime={new Date(
                                    lastUpdatedAt * 1000,
                                  ).toISOString()}
                                  className={styles.docLastUpdatedAt}>
                                  {new Date(
                                    lastUpdatedAt * 1000,
                                  ).toLocaleDateString()}
                                </time>
                                {lastUpdatedBy && ' '}
                              </>
                            )}
                            {lastUpdatedBy && (
                              <>
                                by <strong>{lastUpdatedBy}</strong>
                              </>
                            )}
                            {process.env.NODE_ENV === 'development' && (
                              <div>
                                <small>
                                  {' '}
                                  (Simulated during dev for better perf)
                                </small>
                              </div>
                            )}
                          </small>
                        </em>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="margin-vert--lg">
                <DocPaginator metadata={metadata} />
              </div>
            </div>
          </div>
          {!hideTableOfContents && DocContent.rightToc && (
            // Begin customiation
            <DocTOC isGuide={isGuide} headings={DocContent.rightToc} editUrl={editUrl} />
            // End customization
          )}
        </div>
      </div>
    </>
  );
}

export default DocItem;
