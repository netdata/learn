/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import clsx from 'clsx';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import Seo from '@theme/Seo';
import DocItemFooter from '@theme/DocItemFooter';
import TOC from '@theme/TOC';
import TOCCollapsible from '@theme/TOCCollapsible';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { ThemeClassNames, useWindowSize } from '@docusaurus/theme-common';

// Imports that we need for the custom code:

import LastUpdated from '@theme/LastUpdated';
import EditThisPage from '@theme/EditThisPage';
import Link from '@docusaurus/Link';
import NetlifyForm from './forms.js';

// This function is the source code that renders each documentation page
export default function DocItem(props) {
	const { content: DocContent } = props;
	const { metadata, frontMatter } = DocContent;
	const {
		image,
		keywords,
		hide_title: hideTitle,
		hide_table_of_contents: hideTableOfContents,
		toc_min_heading_level: tocMinHeadingLevel,
		toc_max_heading_level: tocMaxHeadingLevel,
	} = frontMatter;
	const { description, title } = metadata; // We only add a title if:
	// - user asks to hide it with front matter
	// - the markdown content does not already contain a top-level h1 heading

	const shouldAddTitle =
		!hideTitle && typeof DocContent.contentTitle === 'undefined';
	const windowSize = useWindowSize();
	const canRenderTOC =
		!hideTableOfContents && DocContent.toc && DocContent.toc.length > 0;
	const renderTocDesktop =
		canRenderTOC && (windowSize === 'desktop' || windowSize === 'ssr');

	return (
		<>
			<Seo
				{...{
					title,
					description,
					keywords,
					image,
				}}
			/>

			<div className="row">
				<div
					className={clsx('col', {
						[styles.docItemCol]: !hideTableOfContents,
					})}
				>
					<DocVersionBanner />
					<div className={styles.docItemContainer}>
						<article>
							<DocVersionBadge />

							{canRenderTOC && (
								<TOCCollapsible
									toc={DocContent.toc}
									minHeadingLevel={tocMinHeadingLevel}
									maxHeadingLevel={tocMaxHeadingLevel}
									className={clsx(
										ThemeClassNames.docs.docTocMobile,
										styles.tocMobile
									)}
								/>
							)}

							<div
								className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}
							>
								{/*
                Title can be declared inside md content or declared through front matter and added manually
                To make both cases consistent, the added title is added under the same div.markdown block
                See https://github.com/facebook/docusaurus/pull/4882#issuecomment-853021120
                */}
								{shouldAddTitle && (
									<header>
										<Heading as="h1">{title}</Heading>
									</header>
								)}

								{/* BEGIN EDIT: Add author documentation if the metadata is supplied */}
								{frontMatter.author && (
									<aside className="flex items-center mb-12">
										<img
											src={frontMatter.author_img}
											className="w-24 h-24 rounded-full"
											alt={frontMatter.author}
										/>
										<div className="ml-4">
											<span className="block text-lg lg:text-xl font-medium mb-1">
												{frontMatter.author}
											</span>
											<span className="text-sm font-bold uppercase text-gray-400">
												{frontMatter.author_title}
											</span>
										</div>
									</aside>
								)}
								{/* END EDIT */}

								<DocContent />
							</div>

							{/* BEGIN EDITS: Feedback/ Community boxes */}

							<div className="markdown prose-sm mt-12 mx-auto p-6 border border-gray-200 rounded shadow-lg dark:bg-gray-800 dark:border-gray-500">
								<h2 className="!text-2xl font-bold !mb-4"> Reach out </h2>

								{/* Forms column*/}
								<div className="flex flex-wrap">
									<div className="flex-1">
										<h3 className="!mt-0">Need help?</h3>
										<NetlifyForm />
									</div>

									{/* Community column*/}
									<div className="flex-1">
										<h3 className="!mt-0">Need help?</h3>
										<p className="text-sm">
											If you need help after reading this{' '}
											{metadata.permalink.includes('/guides/')
												? 'guide'
												: 'doc'}
											, search our{` `}
											<Link to="https://community.netdata.cloud">
												community forum
											</Link>{' '}
											for an answer.{` `}
											There's a good chance someone else has already found a
											solution to the same issue.{` `}
										</p>
									</div>

									{/* Contribute column*/}
									<div className="flex-1">
										<h3 className="!mt-0">Contribute</h3>
										<ul className="text-sm">
											<li>
												Join our{' '}
												<Link to="https://community.netdata.cloud">
													community forum
												</Link>
											</li>
											<li>
												Learn how to <Link to="/contribute/">contribute</Link>{' '}
												to Netdata's open-source project
											</li>
											<li>
												Submit a{' '}
												<Link to="https://github.com/netdata/netdata/issues/new?assignees=&labels=feature+request%2Cneeds+triage&template=FEAT_REQUEST.yml&title=%5BFeat%5D%3A+">
													feature request
												</Link>
											</li>
										</ul>
									</div>
								</div>
							</div>

							{/* END EDITS: Feedback/ Community boxes */}

							<DocItemFooter {...props} />
						</article>

						<DocPaginator previous={metadata.previous} next={metadata.next} />
					</div>
				</div>
				{renderTocDesktop && (
					<div className="col col--3">
						<TOC
							toc={DocContent.toc}
							minHeadingLevel={tocMinHeadingLevel}
							maxHeadingLevel={tocMaxHeadingLevel}
							className={ThemeClassNames.docs.docTocDesktop}
						/>
					</div>
				)}
			</div>
		</>
	);
}
