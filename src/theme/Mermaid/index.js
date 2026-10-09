import React from 'react';
import Mermaid from '@theme-original/Mermaid';
import { useColorMode } from '@docusaurus/theme-common';

export default function MermaidWrapper(props) {
  const { colorMode } = useColorMode();
  // A fresh render identity prevents theme hydration from removing a prior SVG.
  return <Mermaid key={colorMode} {...props} />;
}
