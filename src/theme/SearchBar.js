import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';

import { RiSearchEyeLine } from 'react-icons/ri';

import SiteSearchAPIConnector from '@elastic/search-ui-site-search-connector';
import {
	ErrorBoundary,
	Facet,
	SearchProvider,
	SearchBox,
	Results,
	PagingInfo,
	ResultsPerPage,
	Paging,
	Sorting,
	WithSearch,
} from '@elastic/react-search-ui';
import {
	Layout,
	SingleSelectFacet,
	SingleLinksFacet,
	BooleanFacet,
	getUrlSanitizer,
	isFieldValueWrapper,
} from '@elastic/react-search-ui-views';
import '@elastic/react-search-ui-views/lib/styles/styles.css';

const connector = new SiteSearchAPIConnector({
	documentType: 'page',
	engineKey: 'BZL_aEiLAebVKkcm3eFr',
});

const config = {
	apiConnector: connector,
	searchQuery: {
		result_fields: {
			title: {
				snippet: {
					size: 100,
					fallback: true,
				},
			},
			url: {
				raw: {},
			},
			description: {
				snippet: {
					size: 100,
					fallback: true,
				},
			},
		},
	},
	alwaysSearchOnInitialLoad: false,
};

const SORT_OPTIONS = [
	{
		name: 'Relevance',
		value: '',
		direction: '',
	},
	{
		name: 'Title',
		value: 'title',
		direction: 'asc',
	},
];

const SearchBar = (props) => {
	const [isOpen, setIsOpen] = useState(false);

	const os = useEffect(() => {
		const keyPressHandler = (e) => {
			// Open on typing `Ctrl/Command+k` or `?`.
			if (
				(e.ctrlKey && e.keyCode === 75) ||
				(e.metaKey && e.keyCode === 75) ||
				e.key === '?'
			) {
				e.preventDefault();
				onOpen();
			}

			// Close on `Escape`
			if (e.key === 'Escape') {
				e.preventDefault();
				setIsOpen(false);
				document.body.classList.remove('search-open');
			}
		};

		document.addEventListener('keydown', keyPressHandler);
		return () => {
			document.removeEventListener('keydown', keyPressHandler);
		};
	}, []);

	const onOpen = () => {
		setIsOpen(true);
		document.body.classList.add('search-open');
	};

	const onClose = useCallback(
		(e) => {
			if (e.target === e.currentTarget || e.currentTarget.tagName === 'A') {
				setIsOpen(false);
				document.body.classList.remove('search-open');
			}
		},
		[setIsOpen]
	);

	const ResultView = ({ result, onClickLink }) => {
		const isLearn = result.url.raw.includes('learn.netdata.cloud');

		return (
			<li className="sui-result">
				<div className="sui-result__header">
					{isLearn ? (
						<Link
							className="sui-result__title sui-result__title-link"
							dangerouslySetInnerHTML={{ __html: result.title.raw }}
							to={result.url.raw.split('https://learn.netdata.cloud')[1]}
							onClick={onClickLink}
							target="_self"
						/>
					) : (
						<a
							className="sui-result__title sui-result__title-link"
							dangerouslySetInnerHTML={{ __html: result.title.raw }}
							href={result.url.raw}
							onClick={onClickLink}
							target="_self"
							rel="noopener noreferrer"
						/>
					)}
				</div>
				<div className="sui-result__body">
					{result.description && (
						<p
							dangerouslySetInnerHTML={{ __html: result.description.snippet }}
						/>
					)}
				</div>
			</li>
		);
	};

	return (
		<>
			<button
				className="group relative flex items-center text-sm text-gray-200 dark:text-gray-100 ml-4 p-2 border border-gray-400 rounded"
				onClick={onOpen}
			>
				<RiSearchEyeLine className="inline-block w-6 h-6 stroke-current group-hover:text-blue" />
				<span className="ml-1">Search</span>
				<BrowserOnly
					fallback={
						<span className="text-xs text-gray-300 font-medium ml-2 px-1 py-0.5 bg-gray-800 rounded shadow-sm">
							Ctrl/⌘ + k
						</span>
					}
				>
					{() => {
						return (
							<span className="text-xs text-gray-300 font-medium ml-2 px-1 py-0.5 bg-gray-800 rounded shadow-sm">
								{window.navigator.platform.match(/^Mac/) ? '⌘' : 'Ctrl'} + k
							</span>
						);
					}}
				</BrowserOnly>
			</button>

			{isOpen &&
				createPortal(
					<div
						className="fixed w-full h-full inset-0 bg-gray-800 bg-opacity-50"
						style={{ zIndex: '300' }}
						onMouseDown={onClose}
					>
						<div
							onClick={null}
							className="SearchModal overflow-y-auto max-w-screen-lg mt-24 mb-24 mx-auto "
						>
							<div className="mx-8 bg-gray-50 dark:bg-gray-800 border border-gray-400 rounded">
								<SearchProvider config={config}>
									<WithSearch
										mapContextToProps={({ wasSearched }) => ({ wasSearched })}
									>
										{({ wasSearched }) => {
											return (
												<div>
													<ErrorBoundary>
														<Layout
															header={
																<SearchBox
																	autocompleteMinimumCharacters={3}
																	autocompleteResults={{
																		linkTarget: '_self',
																		sectionTitle: 'Autocomplete results',
																		titleField: 'title',
																		urlField: 'url',
																		shouldTrackClickThrough: true,
																	}}
																	autocompleteSuggestions={true}
																	debounceLength={100}
																	inputProps={{
																		placeholder: 'Search all of Netdata',
																		autoFocus: true,
																	}}
																/>
															}
															sideContent={
																<div>
																	{wasSearched && (
																		<Sorting
																			label={'Sort by'}
																			sortOptions={SORT_OPTIONS}
																		/>
																	)}
																</div>
															}
															bodyContent={
																<Results
																	titleField="title"
																	urlField="url"
																	shouldTrackClickThrough={true}
																	resultView={ResultView}
																/>
															}
															bodyHeader={
																<React.Fragment>
																	{wasSearched && <PagingInfo />}
																	{wasSearched && <ResultsPerPage />}
																</React.Fragment>
															}
															bodyFooter={<Paging />}
														/>
													</ErrorBoundary>
												</div>
											);
										}}
									</WithSearch>
								</SearchProvider>
							</div>
						</div>
					</div>,
					document.body
				)}
		</>
	);
};

export default SearchBar;
