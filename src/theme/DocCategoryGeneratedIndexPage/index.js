import React from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {
  useCurrentSidebarCategory,
  useSidebarBreadcrumbs,
} from '@docusaurus/plugin-content-docs/client';
import useBaseUrl from '@docusaurus/useBaseUrl';
import DocCardList from '@theme/DocCardList';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import Heading from '@theme/Heading';
import {composeDocTitle} from '@site/src/seo/title';

import styles from './styles.module.css';

function getItemLabel(item) {
  return item?.label || item?.title || '';
}

export function generatedCategoryDescription(category, title) {
  const labels = (category?.items ?? [])
    .map(getItemLabel)
    .filter(Boolean)
    .slice(0, 4);
  const subjects = labels.length ? ` Topics include ${labels.join(', ')}.` : '';
  return `Browse the Netdata documentation for ${title}.${subjects}`;
}

function Metadata({categoryGeneratedIndex, category, breadcrumbs}) {
  const title = composeDocTitle({
    title: categoryGeneratedIndex.title,
    permalink: categoryGeneratedIndex.permalink,
    breadcrumbs,
  });
  const description =
    categoryGeneratedIndex.description ||
    generatedCategoryDescription(category, categoryGeneratedIndex.title);

  return (
    <PageMetadata
      title={title}
      description={description}
      keywords={categoryGeneratedIndex.keywords}
      image={useBaseUrl(categoryGeneratedIndex.image)}
    />
  );
}

export default function DocCategoryGeneratedIndexPage({categoryGeneratedIndex}) {
  const category = useCurrentSidebarCategory();
  const breadcrumbs = useSidebarBreadcrumbs();
  const description =
    categoryGeneratedIndex.description ||
    generatedCategoryDescription(category, categoryGeneratedIndex.title);

  return (
    <>
      <Metadata
        categoryGeneratedIndex={categoryGeneratedIndex}
        category={category}
        breadcrumbs={breadcrumbs}
      />
      <div className={styles.generatedIndexPage}>
        <DocVersionBanner />
        <DocBreadcrumbs />
        <DocVersionBadge />
        <header>
          <Heading as="h1" className={styles.title}>
            {categoryGeneratedIndex.title}
          </Heading>
          <p>{description}</p>
        </header>
        <article className="margin-top--lg">
          <DocCardList items={category.items} className={styles.list} />
        </article>
        <footer className="margin-top--md">
          <DocPaginator
            previous={categoryGeneratedIndex.navigation.previous}
            next={categoryGeneratedIndex.navigation.next}
          />
        </footer>
      </div>
    </>
  );
}
