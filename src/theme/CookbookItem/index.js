import React from 'react';
import classnames from 'classnames';

import Link from '@docusaurus/Link';

import styles from './styles.module.scss';

function CookbookItem(props) {
  const {
    children,
    frontMatter,
    metadata,
  } = props;
  const {description, permalink} = metadata;
  const {title} = frontMatter;

  return (
    <div>
      <Link to={permalink + '/'} className={classnames(styles.cookbookPostItem)}>
        <article>
          <h2>{title}</h2>
          <p>{description}</p>
        </article>
      </Link>
    </div>
  );
}

export default CookbookItem;
