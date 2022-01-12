import React, { useState, useEffect } from 'react';
import { GoThumbsup, GoThumbsdown } from 'react-icons/go';


	// Netlify Forms: We're using state to figure out whether a user submitted a form yet.
const [feedback, setFeedback] = useState(false);
  const [form, setForm] = () => {
    return
        <input type="hidden" form-name="thumbs-voting" name="thumbs" />
		<button aria-label="Happy" className="group px-4" name="thumbsup">
		<GoThumbsup className="w-12 h-12 fill-current text-green-lighter transform transition group-hover:scale-125" />
		</button>
		<button aria-label="Unhappy" className="group px-4" name="thumbsdown">
        <GoThumbsdown className="w-12 h-12 fill-current text-red transform transition group-hover:scale-125" />
		</button>
		{/*Add CSS for feedback text.*/}
		<div className="text-center container">
		    <label for="feedback-text">
			Let us know how we can do better:
			</label>

			<textarea id="feedback-text" form="doc-feedback" name="feedback"rows="5" cols="50" placeholder="What did you like? What can we improve?" className="markdown"></textarea>
			<button type="submit">Submit</button>
		</div>
  }
    
    
	
  useEffect(() => {
		if (window.location.search.includes('feedback=true')) setFeedback(true);
	}, []);
	
<div className="text-center mt-16 pt-12 border-t border-t-200 dark:border-t-500">
<p className="block text-xl lg:text-2xl font-medium mb-4">
Did you find this{' '}{metadata.permalink.includes('/guides/') ? 'guide' : 'document'}{' '} helpful?
							</p>
							{feedback && (
								<p className="text-lg lg:text-xl text-green-lighter">
									Thanks for contributing feedback about our docs!
								</p>
							)}
							<form
								name="thumbs-voting"
								method="POST"
								action={`${metadata.permalink}/?success=true`}
								data-netlify="true"
								// onsubmit=""
							>
								{/* Enter the form function */}
							</form>
  </div>
                        
