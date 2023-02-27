import React, { useEffect } from 'react';


export default function NotFound() {
  useEffect(() => {
    // window.posthog.capture('page-not-found');
    var url = location.href

    var [first, second, three, ...query] = url.split('/')

    query = query.toString().replaceAll(",", " ")
    var target = query.replaceAll("\/", " ").replaceAll("#", " ").replaceAll("-", " ")
    var base = window.location.origin
    var redirectLocation = base + '#gsc.tab=0&gsc.q=' + target

    // Page location and redirectLocation should not be the same
    if (location.href !== redirectLocation) {
      // Redirect logic
      window.location.href = redirectLocation;
    }

  }, [])
  return null
} 