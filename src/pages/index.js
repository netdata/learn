import React, { useEffect } from 'react';
import { Redirect } from '@docusaurus/router';

export default function Home() {
  return <Redirect to="/docs/ask-netdata" />;
}