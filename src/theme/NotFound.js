import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {PageMetadata} from '@docusaurus/theme-common';

export default function NotFound() {
  useEffect(() => {
    window.posthog.capture('page-not-found');
    var url = location.href
    var [first, second, three, ...query] = url.split('/')
    query = query.toString().replace(",", " ")
    var target = query.replaceAll("\/", " ").replace(".", " ")
    var base = url.split(query)[0]
    window.location.replace("https://learn.netdata.cloud/" + 'search?q=' + target);
  }, [])
  return null
}