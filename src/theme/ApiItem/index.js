import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import DocPaginator from '@theme/DocPaginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from "@theme/ApiItem/Footer";
import TOC from '@theme/TOC';
import TOCCollapsible from '@theme/TOCCollapsible';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import {
	PageMetadata,
	HtmlClassNameProvider,
	ThemeClassNames,
	useWindowSize,
} from '@docusaurus/theme-common';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import MDXContent from '@theme/MDXContent';
import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment";
import DocItemLayout from "@theme/ApiItem/Layout";
/*import DocItemMetadata from "@theme/ApiItem/Metadata";*/



// Imports that we need for custom code:

import Link from '@docusaurus/Link';
import { GoThumbsup, GoThumbsdown } from 'react-icons/go';




// This function is the source code that renders the metadata for each documentation page
function DocItemMetadata(props) {
	const { content: DocContent } = props;
	const { metadata, frontMatter, assets } = DocContent;
	const { keywords } = frontMatter;
	const { description, title } = metadata;
	const image = assets.image ?? frontMatter.image;
	return (
		<PageMetadata
			{...{
				title,
				description,
				keywords,
				image,
			}}
		/>
	);
}

const { DocProvider } = require("@docusaurus/theme-common/internal");

let ApiDemoPanel = (_) => (
	<div
		style={{
			marginTop: "3.5em",
		}}
	/>
);

if (ExecutionEnvironment.canUseDOM) {
	ApiDemoPanel = require("@theme/ApiDemoPanel").default;
}


// This function is the source code that renders each documentation page
function DocItemContent(props) {
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
	// Variables for the Netlify Feedback forms

	const [feedback, setFeedback] = useState(false);
	useEffect(() => {
		if (window.location.search.includes('feedback=true')) {
			setFeedback(true);
		}
	}, []);

	const encode = (data) => {
		return Object.keys(data)
			.map(
				(key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
			)
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
	//Checks if feedback has been submitted. If not, the form will be rendered:
	const feedbackForm = (feedback) => {
		return feedback ? (
			<p className="text-lg lg:text-l text-green-lighter">
				Thanks for contributing feedback about our docs!
			</p>
		) : (
			<form
				data-netlify="true"
				name="docs-feedback"
				method="post"
				netlify-honeypot="bot-field"
				onSubmit={handleSubmit}
			>
				<input
					type="hidden"
					name="url"
					aria-label="current url"
					value={formData.url}
				/>
				<input type="hidden" name="form-name" value="docs-feedback" />
				<input
					type="hidden"
					name="thumb"
					aria-label="How do you like it?"
					value={formData.thumb}
				/>

				<div className="flex mt-6">
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
							className={`w-6 h-6 flex-1 justify-items-auto fill-current text-green-lighter transform transition group-hover:scale-125 group-active:scale-125 ${formData.thumb === 'Happy' && 'scale-125'
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
							className={`w-6 h-6 flex-1 justify-items-auto fill-current text-red transform transition group-hover:scale-125 group-active:scale-125 ${formData.thumb === 'Unhappy' && 'scale-125'
								}`}
						/>
					</button>
				</div>

				<div className="text-sm mt-4 mb-4 ">
					<label for="feedback-text" className="inline-block w-9/12">
						Let us know how we can do better:
					</label>
					<textarea
						className="prose-sm p-2 border border-gray-200 rounded w-9/12"
						id="feedback-text"
						name="feedback"
						rows="2"
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
		);
	};
	return (
		<>
			<div className="row">
				<div className={clsx('col', !hideTableOfContents && styles.docItemCol)}>
					<DocVersionBanner />
					<div className={styles.docItemContainer}>
						<article>
							<DocBreadcrumbs />
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
               Title can be declared inside md content or declared through
               front matter and added manually. To make both cases consistent,
               the added title is added under the same div.markdown block
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

								<MDXContent>
									<DocContent />
								</MDXContent>
							</div>
							{/* BEGIN EDITS: Feedback/ Community boxes */}

							<div className="markdown prose-sm mt-12 divider gray-200">
								{/* Forms column*/}
								<div className="flex flex-wrap">
									<div className="flex-1 pr-2 pt-2">
										<h4 className="!mt-0">Was this page helpful?</h4>
										{feedbackForm(feedback)}
									</div>

									{/* Contribute column*/}
									<div className="flex-1 pl-2 pt-2">
										<h4 className="!mt-0">Contribute</h4>
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


export default function DocItem(props) {
	const docHtmlClassName = `docs-doc-id-${props.content.metadata.unversionedId}`;

	const DocContent = () => {
		const MDXComponent = props.content;
		const { frontMatter } = MDXComponent;
		const { info_path: infoPath } = frontMatter;
		const { api } = frontMatter;
		return (
			<div className="row">
				<div className={clsx("col", api ? "col--7" : "col--12")}>
					<MDXComponent />
				</div>
				{api && (
					<div className="col col--5">
						<ApiDemoPanel item={api} infoPath={infoPath} />
					</div>
				)}
			</div>
		);
	};

	return (
		<DocProvider content={props.content}>
			<HtmlClassNameProvider className={docHtmlClassName}>
				<DocItemMetadata {...props} />
				<DocItemContent {...props} />
			</HtmlClassNameProvider>
		</DocProvider>
	);
}
