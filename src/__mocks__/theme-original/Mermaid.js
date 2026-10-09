import React, { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function Mermaid({ value }) {
  const { colorMode } = useColorMode();
  // Model renderer-owned output that retains its initial theme until remounted.
  const [renderedColorMode] = useState(colorMode);
  return (
    <svg role="img" aria-label="Mermaid diagram" data-color-mode={renderedColorMode}>
      <desc>{value}</desc>
    </svg>
  );
}
