import React, { useState, useEffect } from 'react';
import { GoThumbsup, GoThumbsdown } from 'react-icons/go';
import Link from '@docusaurus/Link';

export default function NetlifyForm() {
	// Definition of the variables.
	//We're using state to figure out whether a user submitted a form yet.
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

	// Return the code that will render the HTML form

	return (
		<div className="text-center mt-16 pt-12 border-t border-t-200 dark:border-t-500">
			<p className="block text-xl lg:text-2xl font-medium mb-4">
				Did you find this{' '}
				{metadata.permalink.includes('/guides/') ? 'guide' : 'document'}{' '}
				helpful?
			</p>
		</div>
	);
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
				<input type="hidden" name="form-name" value="docs-feedback" />
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
					<label for="feedback-text">Let us know how we can do better:</label>
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
		);
	}
}
