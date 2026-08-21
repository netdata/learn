import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';

import { __setMockColorMode } from '@docusaurus/theme-common';
import {
  loadNediAssets,
  reloadNediAssets,
  nediAssetsFailed,
  nediDependenciesReady,
} from './assets';
import Nedi from './index';

vi.mock('./assets', () => ({
  NEDI_ENDPOINT: 'https://nedi.netdata.cloud',
  loadNediAssets: vi.fn(),
  reloadNediAssets: vi.fn(),
  nediAssetsFailed: vi.fn(() => false),
  nediDependenciesReady: vi.fn(() => false),
}));

const PERSISTENT_ID = 'nedi-persistent';
const READY_TIMEOUT = 15000;

let embedOptions;
let setTheme;

function installEmbed() {
  window.AiAgentChatUI = function AiAgentChatUI(container, options) {
    embedOptions = options;
    container.innerHTML =
      '<div class="ai-agent-wrapper"><input class="ai-agent-input" /></div>';
    this.setTheme = setTheme;
    container.__nediInstance = this;
  };
}

// Advances past one readiness poll interval and flushes the resulting render.
const tick = (ms) => act(() => vi.advanceTimersByTime(ms));

describe('Nedi component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    embedOptions = undefined;
    setTheme = vi.fn();
    nediDependenciesReady.mockReturnValue(false);
    nediAssetsFailed.mockReturnValue(false);
    sessionStorage.clear();
    __setMockColorMode('light');
  });

  afterEach(() => {
    // Unmount first: the component parks the embed on document.body on cleanup.
    cleanup();
    document.getElementById(PERSISTENT_ID)?.remove();
    vi.useRealTimers();
    vi.clearAllMocks();
    delete window.AiAgentChatUI;
    delete window.AiAgentChatConfig;
    delete window.posthog;
  });

  it('requests the assets and reports progress while they load', () => {
    render(<Nedi />);

    expect(loadNediAssets).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Loading Ask Nedi...');
  });

  it('mounts the embed as soon as the dependencies resolve', () => {
    installEmbed();
    const { container } = render(<Nedi />);

    nediDependenciesReady.mockReturnValue(true);
    tick(150);

    const mounted = container.querySelector(`#${PERSISTENT_ID}`);
    expect(mounted).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(window.AiAgentChatConfig).toEqual({ endpoint: 'https://nedi.netdata.cloud' });
    expect(embedOptions).toMatchObject({ mode: 'div', agentId: 'support-public', theme: 'light' });
  });

  it('mounts without polling when the dependencies are already present', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);

    const { container } = render(<Nedi />);

    expect(container.querySelector(`#${PERSISTENT_ID}`)).not.toBeNull();
  });

  it('sizes the mount and the embed to the remaining viewport', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    const { container } = render(<Nedi />);

    tick(150);

    const mount = container.firstChild;
    const mounted = document.getElementById(PERSISTENT_ID);
    expect(mount.style.minHeight).toBe('calc(100vh - 0px)');
    expect(mounted.style.minHeight).toBe('calc(100vh - 0px)');
    expect(mounted.querySelector('.ai-agent-wrapper').style.minHeight).toBe('calc(100vh - 0px)');
    expect(document.activeElement).toBe(mounted.querySelector('.ai-agent-input'));
  });

  it('tolerates an embed that has not rendered its chat surface yet', () => {
    window.AiAgentChatUI = function AiAgentChatUI() {};
    nediDependenciesReady.mockReturnValue(true);
    render(<Nedi />);

    tick(150);

    const mounted = document.getElementById(PERSISTENT_ID);
    expect(mounted.style.minHeight).toBe('calc(100vh - 0px)');
    expect(mounted.querySelector('.ai-agent-input')).toBeNull();
  });

  it('restores the scroll position recorded on the previous visit', () => {
    installEmbed();
    sessionStorage.setItem('nedi-scroll-y', '120');
    nediDependenciesReady.mockReturnValue(true);
    render(<Nedi />);

    tick(150);

    expect(window.scrollTo).toHaveBeenCalledWith(0, 120);
  });

  it('records the scroll position while the page is open', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    render(<Nedi />);
    tick(150);

    window.scrollY = 42;
    act(() => window.dispatchEvent(new Event('scroll')));

    expect(sessionStorage.getItem('nedi-scroll-y')).toBe('42');
  });

  it('parks the embed outside the page on unmount so it survives navigation', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    const { unmount } = render(<Nedi />);
    tick(150);

    unmount();

    const parked = document.getElementById(PERSISTENT_ID);
    expect(parked.parentElement).toBe(document.body);
    expect(parked.style.display).toBe('none');
  });

  it('reuses the embed instance across remounts', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    const first = render(<Nedi />);
    tick(150);
    const instance = document.getElementById(PERSISTENT_ID).__nediInstance;
    first.unmount();

    const second = render(<Nedi />);
    tick(150);

    expect(second.container.querySelector(`#${PERSISTENT_ID}`).__nediInstance).toBe(instance);
  });

  it('forwards a question to the analytics client when one is available', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    window.posthog = { capture: vi.fn() };
    render(<Nedi />);
    tick(150);

    embedOptions.onEvent({ type: 'user-message', content: 'why is my disk full' });
    embedOptions.onEvent({ type: 'other', content: 'ignored' });

    expect(window.posthog.capture).toHaveBeenCalledTimes(1);
    expect(window.posthog.capture).toHaveBeenCalledWith('nedi_question', {
      question: 'why is my disk full',
    });
  });

  it('drops a question when no analytics client is loaded', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    render(<Nedi />);
    tick(150);

    expect(() => embedOptions.onEvent({ type: 'user-message', content: 'q' })).not.toThrow();
  });

  it('follows the Docusaurus color mode', () => {
    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    const { rerender } = render(<Nedi />);
    tick(150);

    __setMockColorMode('dark');
    rerender(<Nedi />);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('offers a retry when an asset fails to load', () => {
    render(<Nedi />);

    nediAssetsFailed.mockReturnValue(true);
    tick(150);

    expect(screen.getByRole('status')).toHaveTextContent('Ask Nedi could not be loaded.');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('offers a retry when the dependencies never become usable', () => {
    render(<Nedi />);

    tick(READY_TIMEOUT);

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('re-injects the assets and resumes waiting when retried', () => {
    render(<Nedi />);
    tick(READY_TIMEOUT);

    act(() => screen.getByRole('button', { name: 'Retry' }).click());

    expect(reloadNediAssets).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent('Loading Ask Nedi...');

    installEmbed();
    nediDependenciesReady.mockReturnValue(true);
    tick(150);

    expect(document.getElementById(PERSISTENT_ID)).not.toBeNull();
  });

  it('offers a retry when the embed refuses to start', () => {
    window.AiAgentChatUI = function AiAgentChatUI() {
      throw new Error('embed unavailable');
    };
    nediDependenciesReady.mockReturnValue(true);

    render(<Nedi />);

    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('discards the container of an embed that failed to start', () => {
    let attempts = 0;
    window.AiAgentChatUI = function AiAgentChatUI(container, options) {
      attempts += 1;
      if (attempts === 1) throw new Error('embed unavailable');
      embedOptions = options;
      container.innerHTML =
        '<div class="ai-agent-wrapper"><input class="ai-agent-input" /></div>';
      this.setTheme = setTheme;
      container.__nediInstance = this;
    };
    nediDependenciesReady.mockReturnValue(true);
    render(<Nedi />);

    expect(document.getElementById(PERSISTENT_ID)).toBeNull();

    act(() => screen.getByRole('button', { name: 'Retry' }).click());
    tick(150);

    expect(attempts).toBe(2);
    expect(document.getElementById(PERSISTENT_ID).__nediInstance).toBeDefined();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
