import React from 'react';
import clsx from 'clsx';
import { ThemeClassNames } from '@docusaurus/theme-common';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import EditThisPage from '@theme/EditThisPage';
/**
 Title can be declared inside md content or declared through
 front matter and added manually. To make both cases consistent,
 the added title is added under the same div.markdown block
 See https://github.com/facebook/docusaurus/pull/4882#issuecomment-853021120

 We render a "synthetic title" if:
 - user doesn't ask to hide it with front matter
 - the markdown content does not already contain a top-level h1 heading
*/
function useSyntheticTitle() {
  const { metadata, frontMatter, contentTitle } = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

function EditMetaRow({
  editUrl,
  lastUpdatedAt,
  lastUpdatedBy,
  formattedLastUpdatedAt,
}) {
  return (
    <div className={clsx(ThemeClassNames.docs.docFooterEditMetaRow, 'row')} style={{ 'float': 'right' }}>
      {/* <div className="col">{editUrl && }</div> */}

      {/* <div className={clsx('col', styles.lastUpdated)}> */}
      <EditThisPage editUrl={editUrl} />
      {/* {(lastUpdatedAt || lastUpdatedBy) && (
        
        <LastUpdated
          lastUpdatedAt={lastUpdatedAt}
          formattedLastUpdatedAt={formattedLastUpdatedAt}
          lastUpdatedBy={lastUpdatedBy}
        />
      )} */}
    </div>
    // </div>
  );
}

export default function DocItemContent({ children }) {
  const { metadata, frontMatter } = useDoc();
  const { editUrl, lastUpdatedAt, formattedLastUpdatedAt, lastUpdatedBy, tags } =
    metadata;
  const syntheticTitle = useSyntheticTitle();
  const isAskNetdata = frontMatter.id === 'ask-netdata';
  
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
        </header>
      )}
      {!isAskNetdata && (
        <EditMetaRow
          editUrl={metadata.editUrl}
          lastUpdatedAt={metadata.lastUpdatedAt}
          lastUpdatedBy={metadata.lastUpdatedBy}
          formattedLastUpdatedAt={metadata.formattedLastUpdatedAt}
        />
      )}
      <br />
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
