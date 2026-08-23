import { useEffect, useState } from 'react';
import Head from '@docusaurus/Head';
import { useLocation } from '@docusaurus/router';

import { NEDI_HEAD_TAGS, documentPathname, isNediRoute } from '@site/src/components/Nedi/assets';
import { enhancePrometheusProfileCatalogs } from '@site/src/theme/PrometheusProfileCatalog';

// The Ask Nedi route is the only page that uses the embed, so its stylesheet and
// scripts are declared here rather than in the site-wide head. Rendering them on the
// server keeps a direct load requesting them from <head>, before hydration.
//
// The same tags are declared on the client for a document that was server-rendered for
// this route. react-helmet-async keeps an existing tag only when the one it builds is
// isEqualNode-equal to it, and removes every unmatched tag it owns, so a client that
// declared nothing would drop the stylesheet and re-execute every script at hydration.
// The declared attribute values are what setAttribute produces, and the HTML minifier
// preserves empty attribute values, so the two tags match.
//
// A client-side entry into the route has no server-rendered tags, and none are declared
// here because this document was rendered for a different route. The runtime loader in
// src/components/Nedi/assets.js injects them in that case.
export default function Root({ children }) {
  const { pathname } = useLocation();
  // Root is mounted once per document, so this stays the pathname the document was
  // rendered for even after client-side navigation.
  const [renderedPathname] = useState(() => documentPathname(pathname));

  useEffect(() => {
    enhancePrometheusProfileCatalogs();
  }, [pathname]);

  return (
    <>
      {isNediRoute(renderedPathname) && (
        <Head link={NEDI_HEAD_TAGS.link} script={NEDI_HEAD_TAGS.script} />
      )}
      {children}
    </>
  );
}
