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

function removeNediAssets() {
  injected.forEach((element) => {
    element.onerror = null;
    element.remove();
  });
  injected = [];
  loadFailed = false;
}

export function loadNediAssets() {
  if (injected.length || nediDependenciesReady()) return;

  // The embed reports this identifier with every conversation it starts.
  window.AI_AGENT_UI_SOURCE = 'learn';

  const onError = () => {
    loadFailed = true;
  };

  NEDI_ASSETS.forEach((asset) => {
    const element = createAssetElement(asset);
    element.onerror = onError;
    document.head.appendChild(element);
    injected.push(element);
  });
}

// Discards a failed injection so the next load starts from a clean head.
export function reloadNediAssets() {
  removeNediAssets();
  loadNediAssets();
}
