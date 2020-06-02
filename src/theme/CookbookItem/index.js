import React from 'react';

import Link from '@docusaurus/Link';

import classnames from 'classnames';
import readingTime from 'reading-time';

import styles from './styles.module.scss';

function CookbookItem(props) {
  const {
    children,
    frontMatter,
    metadata,
  } = props;
  const {description, permalink} = metadata;
  const {title} = frontMatter;
  const readingStats = readingTime(children.toString());

  console.log(props);

  return (
    <div>
      <Link to={permalink + '/'} className={classnames(styles.cookbookPostItem)}>
        <article>
          <h2>{title}</h2>
          <p>{description}</p>
          <>{readingStats.text}</>
        </article>
      </Link>
    </div>
  );
}

export default CookbookItem;
