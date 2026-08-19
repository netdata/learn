import { beforeEach, describe, expect, it, vi } from 'vitest';

const freshAssets = async () => {
  vi.resetModules();
  return import('./assets');
};

const injectedElements = () => [...document.head.querySelectorAll('link, script')];
const injectedScripts = () => [...document.head.querySelectorAll('script')];

const stubMarkdownIt = () => {
  const markdownIt = () => ({ linkify: { set: () => {} } });
  window.markdownit = markdownIt;
};

const stubEmbed = () => {
  window.AiAgentChatUI = function AiAgentChatUI() {};
};

describe('Nedi asset loader', () => {
  beforeEach(() => {
    injectedElements().forEach((element) => element.remove());
    delete window.AiAgentChatUI;
    delete window.markdownit;
    delete window.AI_AGENT_UI_SOURCE;
  });

  it('injects the stylesheet first and then every script in declaration order', async () => {
    const { NEDI_ASSETS, loadNediAssets } = await freshAssets();

    loadNediAssets();

    expect(injectedElements().map((element) => element.tagName)).toEqual([
      'LINK',
      ...NEDI_ASSETS.slice(1).map(() => 'SCRIPT'),
    ]);

    const [link] = injectedElements();
    expect(link.rel).toBe('stylesheet');
    expect(link.getAttribute('href')).toBe(NEDI_ASSETS[0].src);
    expect(injectedScripts().map((script) => script.getAttribute('src'))).toEqual(
      NEDI_ASSETS.filter((asset) => asset.type === 'js').map((asset) => asset.src),
    );
  });

  it('keeps script execution ordered instead of the dynamic-insertion default', async () => {
    const { loadNediAssets } = await freshAssets();

    loadNediAssets();

    expect(injectedScripts().every((script) => script.async === false)).toBe(true);
  });

  it('pins integrity only for the version-locked CDN dependencies', async () => {
    const { NEDI_ASSETS, loadNediAssets } = await freshAssets();

    loadNediAssets();

    const scripts = injectedScripts();
    NEDI_ASSETS.filter((asset) => asset.type === 'js').forEach((asset, index) => {
      const script = scripts[index];
      if (asset.src.startsWith('https://cdn.jsdelivr.net/')) {
        expect(asset.integrity).toMatch(/^sha384-/);
        expect(script.getAttribute('integrity')).toBe(asset.integrity);
        expect(script.getAttribute('crossorigin')).toBe('anonymous');
      } else {
        expect(asset.integrity).toBeUndefined();
        expect(script.hasAttribute('integrity')).toBe(false);
        expect(script.hasAttribute('crossorigin')).toBe(false);
      }
    });
  });

  it('identifies the embed source before the embed script runs', async () => {
    const { loadNediAssets } = await freshAssets();

    loadNediAssets();

    expect(window.AI_AGENT_UI_SOURCE).toBe('learn');
  });

  it('injects at most one copy of each asset', async () => {
    const { NEDI_ASSETS, loadNediAssets } = await freshAssets();

    loadNediAssets();
    loadNediAssets();

    expect(injectedElements()).toHaveLength(NEDI_ASSETS.length);
  });

  it('skips injection when the dependencies are already usable', async () => {
    const { loadNediAssets, nediDependenciesReady } = await freshAssets();
    stubEmbed();
    stubMarkdownIt();

    expect(nediDependenciesReady()).toBe(true);
    loadNediAssets();

    expect(injectedElements()).toHaveLength(0);
    expect(window.AI_AGENT_UI_SOURCE).toBeUndefined();
  });

  it('reports dependencies as unusable until both the embed and markdown-it exist', async () => {
    const { nediDependenciesReady } = await freshAssets();

    expect(nediDependenciesReady()).toBe(false);

    stubEmbed();
    expect(nediDependenciesReady()).toBe(false);

    stubMarkdownIt();
    expect(nediDependenciesReady()).toBe(true);
  });

  it('records a failure when any asset fails to load', async () => {
    const { loadNediAssets, nediAssetsFailed } = await freshAssets();

    loadNediAssets();
    expect(nediAssetsFailed()).toBe(false);

    injectedScripts()[0].dispatchEvent(new Event('error'));
    expect(nediAssetsFailed()).toBe(true);
  });

  it('replaces a failed injection with fresh elements on reload', async () => {
    const { NEDI_ASSETS, loadNediAssets, reloadNediAssets, nediAssetsFailed } =
      await freshAssets();

    loadNediAssets();
    const first = injectedElements();
    first[0].dispatchEvent(new Event('error'));

    reloadNediAssets();
    const second = injectedElements();

    expect(nediAssetsFailed()).toBe(false);
    expect(second).toHaveLength(NEDI_ASSETS.length);
    expect(second.some((element) => first.includes(element))).toBe(false);
    expect(first.every((element) => element.isConnected === false)).toBe(true);
  });
});
