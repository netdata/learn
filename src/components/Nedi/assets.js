import { ensureMarkdownItCompatibility } from './markdownItCompatibility';

export const NEDI_ENDPOINT = 'https://nedi.netdata.cloud';

// The embed and its dependencies are only useful on the Ask Nedi route, so they are
// injected from this component instead of being declared in the site-wide head.
//
// jsDelivr paths are version-pinned and immutable, so they carry Subresource Integrity
// hashes. The endpoint's own bundles are redeployed in place behind a short cache, so a
// pinned hash there would reject the asset after the next endpoint release.
export const NEDI_ASSETS = [
  { type: 'css', src: `${NEDI_ENDPOINT}/ai-agent-ui.css?v=19` },
  {
    type: 'js',
    src: 'https://cdn.jsdelivr.net/npm/markdown-it@15.0.0/dist/browser/markdown-it.umd.min.js',
    integrity: 'sha384-RFgiWKVXntFwXKC7cM/vTNo+YCPWtoe5WjzaQWX8NMxIt3CnW1Sjhgt6YPVyrGT5',
  },
  {
    type: 'js',
    src: 'https://cdn.jsdelivr.net/npm/mermaid@11.16.1/dist/mermaid.min.js',
    integrity: 'sha384-aBQXj4hK6Jm05i7aQAsUV3bLdSUrHX1BGYfMB0166TtWt/RRaw+h0Eelme9OCOvy',
  },
  {
    type: 'js',
    src: 'https://cdn.jsdelivr.net/npm/@viz-js/viz@3.29.0/dist/viz-global.js',
    integrity: 'sha384-39ZxW8vr+xPchaaptsOWpdQjpckcdy40zkLeHLA4Yv3x0el06s2iBnWQ/s/ppFXQ',
  },
  {
    type: 'js',
    src: 'https://cdn.jsdelivr.net/npm/turndown@7.2.4/dist/turndown.js',
    integrity: 'sha384-VRHmZZ8b5mH5yknWcg48OJS6RmXZmlgvsqhOXJqY0rwvwirs1M12xd+49c3NpW6a',
  },
  {
    type: 'js',
    src: 'https://cdn.jsdelivr.net/npm/@guyplusplus/turndown-plugin-gfm@1.0.7/dist/turndown-plugin-gfm.js',
    integrity: 'sha384-b4AQtiEmaWubq+mFwFnRJCHtHL9HxF2bSrT67eGId8giR2orvUqJFaLQN5NsUP89',
  },
  { type: 'js', src: `${NEDI_ENDPOINT}/ai-agent-public.js?v=19` },
  { type: 'js', src: `${NEDI_ENDPOINT}/ai-agent-ui.js?v=19` },
];

// Route that owns the embed. Docusaurus serves it with and without a trailing slash.
export const NEDI_ROUTE = '/docs/ask-nedi';

export const isNediRoute = (pathname) =>
  typeof pathname === 'string' && pathname.replace(/\/+$/, '') === NEDI_ROUTE;

// The route a document was rendered for: its entry URL in the browser, or the route
// being rendered on the server, where there is no entry URL to read.
export const documentPathname = (routePathname) =>
  typeof window === 'undefined' ? routePathname : window.location.pathname;

// Shapes for the server-rendered declaration in src/theme/Root.js. react-helmet-async
// builds its client tags with setAttribute, so a boolean attribute must be declared as
// an empty string for the client tag to be isEqualNode-equal to the rendered one.
export const NEDI_HEAD_TAGS = {
  link: NEDI_ASSETS.filter((asset) => asset.type === 'css').map((asset) => ({
    rel: 'stylesheet',
    href: asset.src,
  })),
  script: NEDI_ASSETS.filter((asset) => asset.type === 'js').map((asset) =>
    asset.integrity
      ? { src: asset.src, async: '', integrity: asset.integrity, crossorigin: 'anonymous' }
      : { src: asset.src, async: '' },
  ),
};

let injected = [];
let loadFailed = false;

export const nediDependenciesReady = () =>
  typeof window !== 'undefined' &&
  typeof window.AiAgentChatUI !== 'undefined' &&
  ensureMarkdownItCompatibility(window);

export const nediAssetsFailed = () => loadFailed;

function createAssetElement(asset) {
  if (asset.type === 'css') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = asset.src;
    return link;
  }

  const script = document.createElement('script');
  script.src = asset.src;
  // Dynamically inserted scripts default to async; the embed expects markdown-it first.
  script.async = false;
  if (asset.integrity) {
    script.setAttribute('integrity', asset.integrity);
    script.setAttribute('crossorigin', 'anonymous');
  }
  return script;
}

// A tag the server already rendered for this route is loading the asset itself.
function assetIsDeclared(asset) {
  const selector =
    asset.type === 'css'
      ? `link[rel="stylesheet"][href="${asset.src}"]`
      : `script[src="${asset.src}"]`;
  return document.head.querySelector(selector) !== null;
}

function removeNediAssets() {
  injected.forEach((element) => {
    element.onerror = null;
    element.remove();
  });
  injected = [];
  loadFailed = false;
}

function injectNediAssets({ force }) {
  const onError = () => {
    loadFailed = true;
  };

  NEDI_ASSETS.forEach((asset) => {
    if (!force && assetIsDeclared(asset)) return;

    const element = createAssetElement(asset);
    element.onerror = onError;
    document.head.appendChild(element);
    injected.push(element);
  });
}

// Requests whatever the document is not already loading. On a direct load of the route
// every asset is declared server-side and nothing is injected; on a client-side entry
// none are and all are injected. A server-rendered tag that failed is not detected
// here, because its error fired before this runs; the readiness timeout covers it.
export function loadNediAssets() {
  // The embed reads this identifier when it is constructed.
  window.AI_AGENT_UI_SOURCE = 'learn';

  if (injected.length || nediDependenciesReady()) return;

  injectNediAssets({ force: false });
}

// Discards a failed attempt and requests every asset again, including any that a
// server-rendered tag failed to deliver. An already usable set is kept instead:
// removing a <script> element does not undo its side effects, so re-requesting it
// would only cost the stylesheet another round trip.
export function reloadNediAssets() {
  loadFailed = false;
  if (nediDependenciesReady()) return;

  removeNediAssets();
  injectNediAssets({ force: true });
}
