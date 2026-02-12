import React from 'react';

// Mock CodeBlock component
const CodeBlock = ({ children, className, language, title, ...props }) => {
  const lang = language || (className ? className.replace('language-', '') : 'text');
  return React.createElement(
    'pre',
    {
      'data-testid': 'code-block',
      'data-language': lang,
      className: `language-${lang}`,
      ...props
    },
    React.createElement('code', null, children)
  );
};

export default CodeBlock;
