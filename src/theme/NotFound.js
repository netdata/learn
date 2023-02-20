import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import {PageMetadata} from '@docusaurus/theme-common';

export default function NotFound() {
  useEffect(() => {
    window.posthog.capture('page-not-found');
    var url = window.location.href
    var [first, second, three, ...query] = url.split('/')
  
    var target = query
    var base = url.split(query)[0]
    window.location.replace(base + 'search?q=' + 'dummy');
  }, [])
  
  return null
}