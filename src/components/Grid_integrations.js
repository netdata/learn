import React from 'react';
import Link from '@docusaurus/Link';

import { RiExternalLinkLine } from 'react-icons/ri';

export const Grid = ({ className, columns, children }) => {
	return (
		// I really don't like hardcoding the `columns`, but I can't figure out how
		// to have PurgeCSS not purse the classes because they're created with
		// string concatenation.
		// https://tailwindcss.com/docs/optimizing-for-production#writing-purgeable-html
		<div
			className={`safe grid grid-cols-4 gap-2`}
		>
			{children}
		</div>
	);
};

export const Box = ({ className, to, title, cta, image, children }) => {
	// If there's a `to` prop, then we make this Box into a `Link`. Otherwise,
	// it's a `div` to avoid nested `a` elements.
	const Element = to ? Link : `div`;

	return (
		<Element
			to={to}
			className={`group relative p-8  border-gray-500 rounded !no-underline ${
				className
			}`}
			style={{borderColor:className, display:"flex", flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', height:"80%", width:"80%", borderWidth: "3px"}}
		>
			<h5
				className={`text-xl xl:text-2xl font-semibold !mt-0 !mb-2 ${
					to && 'group-hover:text-green-light dark:group-hover:text-green-light'
				}`}
			>
				{title}
			</h5>
			<div
				className={`markdown font-normal leading-relaxed ${
					cta ? 'mb-4' : 'mb-0'
				} dark:text-gray-100`}
			>
				{children}
			</div>
			{cta && (
				<button className="relative text-text bg-gray-200 px-4 py-2 rounded">
					<span className="z-10 relative font-semibold group-hover:text-gray-100">
						{cta}
					</span>
					<div className="opacity-0 group-hover:opacity-100 transition absolute z-0 inset-0 bg-gradient-to-r from-green to-green-lighter rounded" />
				</button>
			)}
		</Element>
	);
};
