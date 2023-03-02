import React,{ useState, useEffect } from 'react';
import {MDXProvider} from '@mdx-js/react';
import MDXComponents from '@theme/MDXComponents';

/* custom imports */
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import { GoThumbsup, GoThumbsdown } from 'react-icons/go';

/* custom function
   BEGIN
*/
function FeedbackForm(){
	const location = useLocation();
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
		url: location.pathname,
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
                Submit a{' '}
                <Link to="https://github.com/netdata/netdata/issues/new?assignees=&labels=feature+request%2Cneeds+triage&template=FEAT_REQUEST.yml&title=%5BFeat%5D%3A+">
                  feature request
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

/* custom function
   END
*/

export default function MDXContent({children}) {
  return (
    <>
      <MDXProvider components={MDXComponents}>{children}</MDXProvider>
      <FeedbackForm />
    </>
  );
}
