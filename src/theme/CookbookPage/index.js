import React from 'react';
import clsx from 'clsx';


import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import MDXComponents from '@theme/MDXComponents';
import {MDXProvider} from '@mdx-js/react';
import useTOCHighlight from '@theme/hooks/useTOCHighlight';
import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

const LINK_CLASS_NAME = 'table-of-contents__link';
const ACTIVE_LINK_CLASS_NAME = 'table-of-contents__link--active';
const TOP_OFFSET = 100;

function DocTOC({headings}) {
  useTOCHighlight(LINK_CLASS_NAME, ACTIVE_LINK_CLASS_NAME, TOP_OFFSET);
  return (
    <div className="col col--3">
      <div className={styles.tableOfContents}>
        <Headings headings={headings} />
      </div>
    </div>
  );
}

/* eslint-disable jsx-a11y/control-has-associated-label */
function Headings({headings, isChild}) {
  if (!headings.length) return null;
  return (
    <ul className={isChild ? '' : 'table-of-contents table-of-contents__left-border'}>
      {headings.map(heading => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={LINK_CLASS_NAME}
            dangerouslySetInnerHTML={{__html: heading.value}}
          />
          <Headings isChild headings={heading.children} />
        </li>
      ))}
    </ul>
  );
}

function CookbookPage(props) {
  const {siteConfig = {}} = useDocusaurusContext();
  const {url: siteUrl, title: siteTitle} = siteConfig;
  const {content: CookbookContents} = props;
  const {metadata} = CookbookContents;
  const {
    description,
    title,
    permalink
  } = metadata;
  const {
    frontMatter: {
      image: metaImage,
      keywords,
    },
  } = CookbookContents;

  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const guideImage = useBaseUrl(metaImage, {absolute: true});

  return (
    <>
      <Layout>
        <Head>
          <title>{metaTitle}</title>
          <meta property="og:title" content={metaTitle} />
          {description && <meta name="description" content={description} />}
          {description && (
            <meta property="og:description" content={description} />
          )}
          {keywords && keywords.length && (
            <meta name="keywords" content={keywords.join(',')} />
          )}
          {metaImage && <meta property="og:image" content={guideImage} />}
          {metaImage && <meta property="twitter:image" content={guideImage} />}
          {metaImage && (
            <meta name="twitter:image:alt" content={`Image for ${title}`} />
          )}
          {permalink && <meta property="og:url" content={siteUrl + permalink} />}
          {permalink && <link rel="canonical" href={siteUrl + permalink} />}
          {/* Swiftype */}
          {description && <meta class="swiftype" name="description" data-type="string" content={description} />}
        </Head>
        <div className="container">
          <div className="row">
            <div className={clsx('col', styles.cookbookContainer)}>
              <article>
                <header className={clsx(styles.cookbookHeader)}>
                  <h1 className={styles.cookbookTitle}>{title}</h1>
                </header>
                <section data-swiftype-name="body" data-swiftype-type="text" className="markdown">
                  <MDXProvider components={MDXComponents}><CookbookContents /></MDXProvider>
                  <Link to="/guides" className={clsx('button button--lg', styles.guidesMore)}>Find more guides</Link>
                </section>
              </article>
            </div>
            {CookbookContents.rightToc && (
              <DocTOC headings={CookbookContents.rightToc} />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}

export default CookbookPage;
