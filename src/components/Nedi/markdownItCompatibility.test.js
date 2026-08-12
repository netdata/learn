import { ensureMarkdownItCompatibility } from './markdownItCompatibility';

const createMarkdownIt = () => {
  const calls = [];
  const markdownIt = () => ({
    linkify: { set: (options) => calls.push(options) },
  });
  markdownIt.utils = { escapeHtml: () => {} };
  return { calls, markdownIt };
};

describe('Nedi markdown-it compatibility', () => {
  test('enables fuzzy links on every renderer instance', () => {
    const { calls, markdownIt } = createMarkdownIt();
    const browserWindow = { markdownit: markdownIt };

    expect(ensureMarkdownItCompatibility(browserWindow)).toBe(true);
    browserWindow.markdownit({ linkify: true });
    browserWindow.markdownit({ linkify: true });

    expect(calls).toEqual([{ fuzzyLink: true }, { fuzzyLink: true }]);
  });

  test('is idempotent and preserves constructor properties', () => {
    const { markdownIt } = createMarkdownIt();
    const browserWindow = { markdownit: markdownIt };

    ensureMarkdownItCompatibility(browserWindow);
    const wrapped = browserWindow.markdownit;
    ensureMarkdownItCompatibility(browserWindow);

    expect(browserWindow.markdownit).toBe(wrapped);
    expect(browserWindow.markdownit.utils).toBe(markdownIt.utils);
  });

  test('waits until markdown-it is available', () => {
    expect(ensureMarkdownItCompatibility({})).toBe(false);
  });
});
