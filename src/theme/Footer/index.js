/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import clsx from 'clsx';

import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.scss';

function FooterLink({to, href, label, prependBaseUrlToHref, ...props}) {
  const toUrl = useBaseUrl(to);
  const normalizedHref = useBaseUrl(href, {forcePrependBaseUrl: true});

  return (
    <Link
      className="footer__link-item"
      {...(href
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            to: toUrl,
          })}
      {...props}>
      {label}
    </Link>
  );
}

const FooterLogo = ({url, alt}) => (
  <img className="footer__logo" alt={alt} src={url} />
);

function Footer() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  const {themeConfig = {}} = siteConfig;
  const {footer} = themeConfig;

  const {copyright, links = [], logo = {}} = footer || {};
  const logoUrl = useBaseUrl(logo.src);

  if (!footer) {
    return null;
  }

  return (
    <footer
      className={clsx('footer', {
        'footer--dark': footer.style === 'dark',
      })}>
      <div className="container">
        {links && links.length > 0 && (
          <div className="row footer__links">

            <div className="col footer__col">
              <img src="/img/logo_green.png" alt="Netdata logo" />
            </div>

            {links.map((linkItem, i) => (
              <div key={i} className="col footer__col">
                {linkItem.title != null ? (
                  <h4 className="footer__title">{linkItem.title}</h4>
                ) : null}
                {linkItem.items != null &&
                Array.isArray(linkItem.items) &&
                linkItem.items.length > 0 ? (
                  <ul className="footer__items">
                    {linkItem.items.map((item, key) =>
                      item.html ? (
                        <li
                          key={key}
                          className="footer__item"
                          dangerouslySetInnerHTML={{
                            __html: item.html,
                          }}
                        />
                      ) : (
                        <li key={item.href || item.to} className="footer__item">
                          <FooterLink {...item} />
                        </li>
                      ),
                    )}
                  </ul>
                ) : null}
              </div>
            ))}

            <div className="col footer__col">
              <p className="footer__item--copy">&copy; 2020 Netdata</p>
              <ul className="footer__items">
                <li className="footer__item">
                  <Link
                    className="footer__link-item"
                    href="https://www.netdata.cloud/privacy/"
                    target="_blank"
                    rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                </li>
                <li className="footer__item">
                  <Link
                    className="footer__link-item"
                    href="https://www.netdata.cloud/terms/"
                    target='_blank'
                    rel='noopener noreferrer'>
                    Terms of Use
                  </Link>
                </li>
                <li className="footer__item footer__item--status">
                  <Link
                    className="footer__link-item"
                    href="https://status.netdata.cloud/"
                    target='_blank'
                    rel='noopener noreferrer'>
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col footer__col">
              <p>Social logos</p>
            </div>

          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
