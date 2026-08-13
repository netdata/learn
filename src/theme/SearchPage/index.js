import React from 'react';
import Head from '@docusaurus/Head';
import SearchPage from '@theme-original/SearchPage';

export default function SearchPageWithoutNoindex(props) {
  return (
    <>
      <SearchPage {...props} />
      <Head>
        <meta property="robots" content="index, follow" />
      </Head>
    </>
  );
}
