import React from 'react';
import Footer from '@theme-original/DocItem/Footer';

export default function FooterWrapper(props) {
  return (
    <>
      <Footer {...props} />
      <i><br/>Do you have any feedback for this page? If so, you can open a new issue on our <a style={{"text-decoration":"underline"}} href="https://github.com/netdata/learn/issues/new/choose" target="_blank">netdata/learn</a> repository.</i>
    </>
  );
}
