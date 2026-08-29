import React from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {
  useDoc,
  useSidebarBreadcrumbs,
} from '@docusaurus/plugin-content-docs/client';
import {resolveDocDescription} from '@site/src/seo/description';
import {composeDocTitle} from '@site/src/seo/title';

export default function DocItemMetadata() {
  const {metadata, frontMatter, assets} = useDoc();
  const breadcrumbs = useSidebarBreadcrumbs();
  const title = composeDocTitle({
    seoTitle: frontMatter.seo_title,
    title: metadata.title,
    sidebarLabel: frontMatter.sidebar_label,
    permalink: metadata.permalink,
    breadcrumbs,
  });
  const description = resolveDocDescription({
    description: metadata.description,
    permalink: metadata.permalink,
  });
  return (
    <PageMetadata
      title={title}
      description={description}
      keywords={frontMatter.keywords}
      image={assets.image ?? frontMatter.image}
    />
  );
}
