const compatibleConstructors = new WeakSet();

const enableFuzzyLinks = (renderer) => {
  renderer?.linkify?.set?.({ fuzzyLink: true });
  return renderer;
};

export const ensureMarkdownItCompatibility = (browserWindow = window) => {
  const markdownIt = browserWindow.markdownit;
  if (typeof markdownIt !== 'function') return false;
  if (compatibleConstructors.has(markdownIt)) return true;

  const compatibleMarkdownIt = new Proxy(markdownIt, {
    apply: (target, thisArg, args) => enableFuzzyLinks(Reflect.apply(target, thisArg, args)),
    construct: (target, args, newTarget) => enableFuzzyLinks(Reflect.construct(target, args, newTarget)),
  });
  compatibleConstructors.add(compatibleMarkdownIt);
  browserWindow.markdownit = compatibleMarkdownIt;
  return true;
};
