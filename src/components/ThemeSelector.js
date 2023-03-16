// Select a theme using the `theme` front matter

import React from 'react';
import DocItem from "@theme/DocItem";
import ApiItem from "@theme/ApiItem"

export default function ThemeSelector(props) {
    const { content: DocContent } = props;
    const { frontMatter: { theme } } = DocContent;
    console.log(props.location.pathname)

    if (props.location.pathname.startsWith("/docs/api")) {
        return <ApiItem {...props} />
    } else {
        return <DocItem {...props} />
    }

}