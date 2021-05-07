import React from 'react'
import { RiLightbulbFlashLine, RiAlarmWarningLine } from 'react-icons/ri';

// This component offers a few default types, which decide on the color and
// emoji/symbol used.
//
// `notice`: Light green color, lightbulb symbol. Should be used when calling
// attention to an important piece of information.

const Callout = ({ type, children }) => {
  const types = {
    notice: {
      icon: RiLightbulbFlashLine,
      color: 'green'
    },
    warning: {
      icon: RiAlarmWarningLine,
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
