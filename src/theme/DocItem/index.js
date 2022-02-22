/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
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
import React, { useState, useEffect } from 'react';
import LastUpdated from '@theme/LastUpdated';
import EditThisPage from '@theme/EditThisPage';
import Link from '@docusaurus/Link';
import { GoThumbsup, GoThumbsdown } from 'react-icons/go';

// Custom constants that we will use in the export function:

// BEGIN EDITS
// Netlify Forms: We're using state to figure out whether a user submitted a form yet.
const [feedback, setFeedback] = useState(false);
useEffect(() => {
	if (window.location.search.includes('feedback=true')) {
		setFeedback(true);
	}
}, []);

const encode = (data) => {
	return Object.keys(data)
		.map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
		.join('&');
};
const [formData, setFormData] = useState({
	thumb: null,
	feedback: '',
	url: metadata.permalink,
});

const handleSubmit = (e) => {
	e.preventDefault();
	const { botfield, ...rest } = formData;

	if (botfield) {
		setFeedback(true);
		return;
	}

	fetch('/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: encode({ 'form-name': 'docs-feedback', ...rest }),
	})
		.then(() => setFeedback(true))
		.catch(() => setFeedback(true));
};

// END EDITS

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

							{/* BEGIN EDITS: Feedback/ Edit page/ Community boxes */}
							{/* BEGIN EDITS: Netlify feedback form */}
							<div className="text-center mt-16 pt-12 border-t border-t-200 dark:border-t-500">
								<p className="block text-xl lg:text-2xl font-medium mb-4">
									Did you find this{' '}
									{metadata.permalink.includes('/guides/')
										? 'guide'
										: 'document'}{' '}
									helpful?
								</p>
								{
									feedback ? (
										<p className="text-lg lg:text-l text-green-lighter">
											Thanks for contributing feedback about our docs!
										</p>
									) : (
										<form
											data-netlify="true"
											name="docs-feedback"
											method="post"
											onSubmit={handleSubmit}
										>
											<input
												type="hidden"
												name="url"
												aria-label="current url"
												value={formData.url}
											/>
											<input
												type="hidden"
												name="form-name"
												value="docs-feedback"
											/>
											<input
												type="hidden"
												name="thumb"
												aria-label="How do you like it?"
												value={formData.thumb}
											/>
											<button
												aria-label="Happy"
												className="group px-4"
												name="thumbsup"
												type="button"
												onClick={(e) =>
													setFormData((prevFormData) => ({
														...prevFormData,
														thumb: 'Happy',
													}))
												}
											>
												<GoThumbsup
													className={`w-12 h-12 fill-current text-green-lighter transform transition group-hover:scale-125 group-active:scale-125 ${
														formData.thumb === 'Happy' && 'scale-125'
													}`}
												/>
											</button>
											<button
												aria-label="Unhappy"
												className="group px-4"
												name="thumbsdown"
												type="button"
												onClick={(e) =>
													setFormData((prevFormData) => ({
														...prevFormData,
														thumb: 'Unhappy',
													}))
												}
											>
												<GoThumbsdown
													className={`w-12 h-12 fill-current text-red transform transition group-hover:scale-125 group-active:scale-125 ${
														formData.thumb === 'Unhappy' && 'scale-125'
													}`}
												/>
											</button>

											<div className="mt-4 text-center block">
												<label for="feedback-text">
													Let us know how we can do better:
												</label>
											</div>
											<div className="mt-4 mb-4 block">
												<textarea
													className="prose-sm mx-auto p-6 border border-gray-200 rounded dark:bg-gray-800 dark:border-gray-500 w-full"
													id="feedback-text"
													name="feedback"
													rows="5"
													placeholder="What did you like? What can we improve?"
													onChange={(e) =>
														setFormData((prevFormData) => ({
															...prevFormData,
															[e.target.name]: e.target.value,
														}))
													}
												/>
											</div>

											<button
												type="submit"
												disabled={!formData.thumb && !formData.feedback}
												className="group relative text-text bg-gray-200 px-4 py-2 rounded disabled:bg-gray-100"
											>
												<span className="z-10 relative font-semibold group-hover:text-gray-100 group-disabled:text-text">
													Submit
												</span>
												{(!!formData.thumb || !!formData.feedback) && (
													<div className="opacity-0 group-hover:opacity-100 transition absolute z-0 inset-0 bg-gradient-to-r from-green to-green-lighter rounded" />
												)}
											</button>
											{/* Honeypot to catch spambots */}
											<p class="invisible">
												<label>
													Don't fill this out if you're human:{' '}
													<input
														name="botfield"
														onChange={(e) =>
															setFormData((prevFormData) => ({
																...prevFormData,
																[e.target.name]: e.target.value,
															}))
														}
													/>
												</label>
											</p>
										</form>
									)

									/* END EDITS: Netlify feedback form */
								}

								{/* BEGIN EDITS: Community help */}
								<div className="markdown prose-sm mt-12 mx-auto p-6 border border-gray-200 rounded shadow-lg dark:bg-gray-800 dark:border-gray-500">
									<h2 className="!text-2xl font-bold !mb-4">Reach out</h2>
									<p className="text-sm">
										If you need help after reading this{' '}
										{metadata.permalink.includes('/guides/') ? 'guide' : 'doc'},
										search our{` `}
										<Link to="https://community.netdata.cloud">
											community forum
										</Link>{' '}
										for an answer.{` `}
										There's a good chance someone else has already found a
										solution to the same issue.{` `}
									</p>
									<div className="flex flex-wrap">
										<div className="flex-1">
											<h3 className="!mt-0">Documentation</h3>
											<ul className="text-sm">
												{editUrl && (
													<li>
														<Link to={editUrl}>Edit</Link> this{' '}
														{metadata.permalink.includes('/guides/')
															? 'guide'
															: 'doc'}{' '}
														directly
													</li>
												)}
												<li>
													<Link
														to={`https://community.netdata.cloud/new-topic?category_id=6&tags=documentation&title=Feedback%20or%20suggestion%20on:%20${title.replace(
															/\s+/g,
															'%20'
														)}`}
													>
														Suggest an improvement
													</Link>{' '}
													for this{' '}
													{metadata.permalink.includes('/guides/')
														? 'guide'
														: 'doc'}{' '}
													in our forum
												</li>
											</ul>
										</div>
										<div className="flex-1">
											<h3 className="!mt-0">Community</h3>
											<ul className="text-sm">
												<li>
													Join our{' '}
													<Link to="https://community.netdata.cloud">
														community forum
													</Link>
												</li>
												<li>
													Learn how to <Link to="/contribute/">contribute</Link>{' '}
													to Netdata's open-source
												</li>
												<li>
													Submit a{' '}
													<Link to="https://community.netdata.cloud/c/feature-requests/7/">
														feature request
													</Link>
												</li>
											</ul>
										</div>
									</div>
								</div>

								{/* END EDITS: Community help */}
								{/* END EDITS: Feedback/ Community boxes */}

								<DocItemFooter {...props} />
							</div>
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
ya;
