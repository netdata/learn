/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useState, useEffect } from 'react';
import DocPaginator from '@theme/DocPaginator';
import DocVersionSuggestions from '@theme/DocVersionSuggestions';
import Seo from '@theme/Seo';
import LastUpdated from '@theme/LastUpdated';
import TOC from '@theme/TOC';
import EditThisPage from '@theme/EditThisPage';
import clsx from 'clsx';
import styles from './styles.module.css';
import {
  useActivePlugin,
  useVersions,
  useActiveVersion,
} from '@theme/hooks/useDocs';

import Link from '@docusaurus/Link'

import { CgSmile, CgSmileNone, CgSmileSad } from 'react-icons/cg'

function DocItem(props) {
  const {content: DocContent} = props;
  const {metadata, frontMatter} = DocContent;
  const {
    image,
    keywords,
    hide_title: hideTitle,
    hide_table_of_contents: hideTableOfContents,
  } = frontMatter;
  const {
    description,
    title,
    editUrl,
    lastUpdatedAt,
    formattedLastUpdatedAt,
    lastUpdatedBy,
  } = metadata;
  const {pluginId} = useActivePlugin({
    failfast: true,
  });
  const versions = useVersions(pluginId);
  const version = useActiveVersion(pluginId); // If site is not versioned or only one version is included
  // we don't show the version badge
  // See https://github.com/facebook/docusaurus/issues/3362

  const showVersionBadge = versions.length > 1; // For meta title, using frontMatter.title in priority over a potential # title found in markdown
  // See https://github.com/facebook/docusaurus/issues/4665#issuecomment-825831367

  const metaTitle = frontMatter.title || title;

  // console.log(metadata)

  // BEGIN EDITS
  // We're using state to figure out whether a user submitted a form yet.
  const [mood, setMood] = useState(false)
  const [feedback, setFeedback] = useState(false)
  useEffect(() => {
    if ( window.location.search.includes('mood=true') ) {
      setMood(true);
    }
    if ( window.location.search.includes('feedback=true') ) {
      setFeedback(true);
    }
  }, []);
  // END EDITS

  return (
    <>
      <Seo
        {...{
          title: metaTitle,
          description,
          keywords,
          image,
        }}
      />

      <div className="row">
        <div
          className={clsx('col', {
            [styles.docItemCol]: !hideTableOfContents,
          })}>
          <DocVersionSuggestions />
          <div className={styles.docItemContainer}>
            <article>
              {showVersionBadge && (
                <div>
                  <span className="badge badge--secondary">
                    Version: {version.label}
                  </span>
                </div>
              )}
              {!hideTitle && (
                <header>
                  <h1 className={styles.docTitle}>{title}</h1>
                </header>
              )}

              {/* BEGIN EDITS */}
              {frontMatter.author && (
                <aside className="flex items-center mb-12">
                  <img src={frontMatter.author_img} className="w-24 h-24 rounded-full" alt={frontMatter.author} />
                  <div className="ml-4">
                    <span className="block text-lg lg:text-xl font-medium mb-1">{frontMatter.author}</span>
                    <span className="text-sm font-bold uppercase text-gray-400">{frontMatter.author_title}</span>
                  </div>
                </aside>
              )}
              {/* END EDITS */}

              <div className="markdown">
                <DocContent />
              </div>
            </article>

            {/* BEGIN EDITS */}
            <div className="text-center mt-16 pt-12 border-t border-t-200 dark:border-t-500">
              <p className="block text-xl lg:text-2xl font-medium mb-4">Did you find this {metadata.permalink.includes('/guides/') ? 'guide' : 'document'} helpful?</p>
              {feedback && (
                <p className="text-lg lg:text-xl text-green mb-4">Thanks for contributing feedback about our docs!</p>
              )}
              <form 
                name="doc-mood"
                method="POST"
                action={`${metadata.permalink}/?mood=true`}
                data-netlify="true"
              >
                <input type="hidden" name="form-name" value="doc-feedback" />
                <button aria-label="sad" className="group px-2">
                  <CgSmileSad className="w-12 h-12 fill-current text-red-400 transform transition group-hover:scale-125" />
                </button>
                <button aria-label="neutral" className="group px-2">
                  <CgSmileNone className="w-12 h-12 fill-current text-amber-300 transform transition group-hover:scale-125" />
                </button>
                <button aria-label="happy" className="group px-2">
                  <CgSmile className="w-12 h-12 fill-current text-green-lighter transform transition group-hover:scale-125" />
                </button>
              </form>
              <form 
                name="doc-feedback"
                method="POST"
                action={`${metadata.permalink}/?feedback=true`}
                data-netlify="true"
              >
                {mood && (
                  <div className="block mt-4">
                    <textarea 
                      name="feedback" 
                      className="block w-full max-w-2xl mx-auto p-4 border border-gray-200 rounded shadow-lg dark:bg-gray-800 dark:border-gray-500" 
                      placeholder={`Have any feedback on this ${metadata.permalink.includes('/guides/') ? 'guide' : 'document'}?`}>
                    </textarea>
                    <button class="group relative text-text bg-gray-200 mt-4 px-4 py-2 rounded">
                      <span class="z-10 relative text-xl font-semibold group-hover:text-gray-100">Submit</span>
                      <div class="opacity-0 group-hover:opacity-100 transition absolute z-0 inset-0 bg-gradient-to-r from-green to-green-lighter rounded"></div>
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="markdown prose-sm mt-12 mx-auto p-6 border border-gray-200 rounded shadow-lg dark:bg-gray-800 dark:border-gray-500">
              <h2 className="!text-2xl font-bold !mb-4">Reach out</h2>
              <p className="text-sm">
                If you need help after reading this {metadata.permalink.includes('/guides/') ? 'guide' : 'doc'}, feel free to{` `}
                <Link to={`https://github.com/netdata/netdata/issues/new?title=Docs%20feedback%20on:%20${title}&body=**Issue%20with:%20${title}**`}>create an issue</Link>{` `}
                in the <Link to="https://github.com/netdata/netdata"><code>netdata/netdata</code></Link> repo{` `}
                or join our <Link to="https://community.netdata.cloud">community forum</Link> to search for an answer.{` `}
                There's a good chance someone else has already found a solution to the same issue.
              </p>
              <div className="flex flex-wrap">
                <div className="flex-1">
                  <h3 className="!mt-0">Documentation</h3>
                  <ul className="text-sm">
                    {editUrl && <li><Link to={editUrl}>Edit</Link> this {metadata.permalink.includes('/guides/') ? 'guide' : 'doc'} directly</li>}
                    <li><Link to={`https://github.com/netdata/netdata/issues/new?title=Docs%20feedback%20on:%20${title}&body=**Issue%20with:%20${title}**`}>Create an issue</Link> for this {metadata.permalink.includes('/guides/') ? 'guide' : 'doc'} to suggest improvements</li>
                  </ul>
                </div>
                <div className="flex-1">
                  <h3 className="!mt-0">Community</h3>
                  <ul className="text-sm">
                    <li>Join our <Link to="https://community.netdata.cloud">community forum</Link></li>
                    <li>Learn how to <Link to="/contribute/">contribute</Link> to Netdata's open-source</li>
                    <li>Submit a <Link to="https://community.netdata.cloud/c/feature-requests/7/">feature request</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            {/* END EDITS */}

            {(editUrl || lastUpdatedAt || lastUpdatedBy) && (
              <div className="margin-vert--xl">
                <div className="row">
                  <div className="col">
                    {editUrl && <EditThisPage editUrl={editUrl} />}
                  </div>
                  {(lastUpdatedAt || lastUpdatedBy) && (
                    <LastUpdated
                      lastUpdatedAt={lastUpdatedAt}
                      formattedLastUpdatedAt={formattedLastUpdatedAt}
                      lastUpdatedBy={lastUpdatedBy}
                    />
                  )}
                </div>
              </div>
            )}
            <div className="margin-vert--lg">
              <DocPaginator metadata={metadata} />
            </div>
          </div>
        </div>
        {!hideTableOfContents && DocContent.toc && (
          <div className="col col--3">
            <TOC toc={DocContent.toc} />
          </div>
        )}
      </div>
    </>
  );
}

export default DocItem;
