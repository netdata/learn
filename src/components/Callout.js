import React from 'react'
const PhLightbulb = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className}><path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16,16,0,0,0-6.23-12.66A87.59,87.59,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Zm-16,0a72,72,0,0,0-73.74-72c-39,.92-70.47,33.39-70.26,72.39a71.65,71.65,0,0,0,27.64,56.3A32,32,0,0,1,96,186v6h64v-6a32.15,32.15,0,0,1,12.47-25.35A71.65,71.65,0,0,0,200,104Zm-16.11-9.34a57.6,57.6,0,0,0-46.56-46.55,8,8,0,0,0-2.66,15.78c16.57,2.79,30.63,16.85,33.44,33.45A8,8,0,0,0,176,104a9,9,0,0,0,1.35-.11A8,8,0,0,0,183.89,94.66Z"/></svg>
);
const PhWarning = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" className={className}><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"/></svg>
);

// Basic usage:
// <Callout type="notice">
// 
// text goes here
// 
// </Callout>

// This component offers a few options for `type`, which changes on the color
// and emoji/symbol used.
//
// `notice`: Light green color, lightbulb symbol. Should be used when calling
// attention to an important piece of information.
//
// `warning`: Light red color, warning symbol. Should be used to caution users
// about a certain task.

const Callout = ({ type, children }) => {
  const types = {
    notice: {
      icon: PhLightbulb,
      color: 'green'
    },
    warning: {
      icon: PhWarning,
      color: 'red'
    }
  }

  const TypeIcon = types[type][`icon`]
  const TypeColor = types[type][`color`]

  return (
    <div className={`flex items-center w-full bg-${TypeColor} bg-opacity-10 p-4 pr-6 border border-gray-200 rounded shadow-sm dark:bg-${TypeColor} dark:border-gray-500`}>
      <TypeIcon className="block w-32 h-32 mr-6" />
      <div className="max-w-none prose dark:prose-dark">
        {children}
      </div>
    </div>
  )
}

export default Callout
