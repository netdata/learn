import React from 'react';
import {TitleFormatterProvider} from '@docusaurus/theme-common/internal';
import {formatSiteTitle} from '@site/src/seo/title';

const formatter = (params) => formatSiteTitle(params);

export default function ThemeProviderTitleFormatter({children}) {
  return (
    <TitleFormatterProvider formatter={formatter}>
      {children}
    </TitleFormatterProvider>
  );
}
