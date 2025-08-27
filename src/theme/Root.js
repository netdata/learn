import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

export default function Root({ children }) {
  const location = useLocation();

  useEffect(() => {
    const isHome = location.pathname === '/';
    document.body.classList.toggle('is-home', isHome);
  }, [location.pathname]);

  return <>{children}</>;
}
