import { useRef, useEffect } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const NEDI_ENDPOINT = 'https://nedi.netdata.cloud';
const PERSISTENT_ID = 'nedi-persistent';
const SCROLL_KEY = 'nedi-scroll-y';

// Match Docusaurus theme colors for seamless integration
const CSS_VARIABLES = {
  light: {
    '--ai-bg-primary': '#fdfdfd',
    '--ai-bg-secondary': '#f5f5f5',
    '--ai-bg-tertiary': '#e8e8e8',
    '--ai-text-primary': '#1a1a1a',
    '--ai-text-secondary': '#666666',
    '--ai-border-color': '#e0e0e0',
    '--ai-code-bg': '#e8e8e8',
    '--ai-code-text': '#1a1a1a',
  },
  dark: {
    '--ai-bg-primary': '#000000',
    '--ai-bg-secondary': '#0A0A0A',
    '--ai-bg-tertiary': '#1A1A1A',
    '--ai-text-primary': '#c0c0c0',
    '--ai-text-secondary': '#808080',
    '--ai-text-assistant-message': '#c0c0c0',
    '--ai-border-color': '#1A1A1A',
    '--ai-code-bg': '#1A1A1A',
    '--ai-code-text': '#e0e0e0',
    '--ai-scrollbar-thumb': '#333333',
    '--ai-scrollbar-track': '#0A0A0A',
  },
};

// Word cloud data: [x, y, fontSize, duration, delay, peakOpacity, text]
const HOME_WORDS = [
  [20,38,13,9,-3,.35,'Configure alerts in Netdata'],
  [240,30,15,11,-8,.42,'Anomaly detection'],
  [420,46,18,8,-1,.52,'How to install Netdata?'],
  [650,34,12,12,-5,.30,'Detección de anomalías'],
  [830,44,14,10,0,.38,'Custom dashboards'],
  [180,48,11,13,-10,.28,'Rilevamento anomalie'],
  [540,28,11,7,-6,.25,'Alarm yapılandırma'],
  [760,30,11,14,2,.30,'विसंगति का पता लगाना'],
  [25,70,12,10,-7,.30,'Metric correlations'],
  [185,74,14,8,-2,.42,'Monitor Docker containers'],
  [430,78,16,12,1,.48,'How does Netdata scale?'],
  [670,66,12,9,-9,.30,'Tableaux de bord personnalisés'],
  [670,86,11,11,-4,.25,'Correlación de métricas'],
  [870,72,13,13,3,.35,'Data retention'],
  [25,58,11,7,-11,.28,'Jak zainstalować Netdata?'],
  [380,62,11,14,5,.25,'Anomalidetektering'],
  [15,108,12,9,-6,.30,'Container-Überwachung'],
  [190,105,11,11,-2,.28,'Corrélation des métriques'],
  [390,108,19,8,-8,.52,'Where are my data stored?'],
  [720,100,12,13,1,.30,'Paneles personalizados'],
  [170,128,13,10,-4,.35,'Où sont stockées mes données?'],
  [720,120,14,12,4,.38,'Streaming and replication'],
  [15,125,11,7,-12,.25,'Wykrywanie anomalii'],
  [430,92,11,14,-10,.28,'Hoe installeer ik Netdata?'],
  [580,128,12,8,2,.30,'Dashboard personalizzate'],
  [20,150,14,10,-5,.38,'Wie installiere ich Netdata?'],
  [10,175,12,12,0,.30,'Hohe CPU-Auslastung'],
  [175,172,13,8,-9,.32,'Speichermangel'],
  [290,148,21,9,-3,.55,'How does anomaly detection work?'],
  [630,150,12,11,-7,.30,'Мониторинг контейнеров'],
  [700,142,22,13,2,.55,'Reduce alert noise'],
  [700,170,10,7,-11,.22,'¿Cómo instalo Netdata?'],
  [170,140,11,14,4,.25,'Netdata nasıl kurulur?'],
  [430,170,12,10,-1,.30,'Ανίχνευση ανωμαλιών'],
  [22,208,18,9,-6,.50,'異常検知の仕組み'],
  [20,232,13,11,-2,.35,'コンテナの監視'],
  [178,222,12,8,-8,.28,'Alarme konfigurieren'],
  [690,200,18,12,1,.50,'Parent-child architecture'],
  [720,225,13,10,-4,.35,'Configurer les alertes'],
  [870,212,11,13,3,.28,'eBPF monitoring'],
  [200,195,12,7,-10,.30,'Come installare Netdata?'],
  [870,195,11,14,5,.25,'컨테이너 모니터링'],
  [350,215,11,9,-12,.25,'Aangepaste dashboards'],
  [500,188,11,8,-5,.28,'Hur installerar jag Netdata?'],
  [110,250,17,10,-7,.45,'如何配置告警？'],
  [12,248,12,12,-3,.25,'カスタムダッシュボード'],
  [200,240,12,8,0,.30,'Netdata कैसे इंस्टॉल करें?'],
  [180,255,11,11,-9,.22,'Özel panolar'],
  [790,235,17,9,-1,.45,'アラートの設定方法'],
  [835,255,13,13,4,.30,'이상 탐지'],
  [720,248,11,7,-6,.25,'Anpassade instrumentpaneler'],
  [12,282,14,10,-4,.38,'Обнаружение аномалий'],
  [800,285,17,11,-8,.45,'自定义仪表盘'],
  [870,305,15,8,2,.40,'容器监控'],
  [12,305,11,13,-11,.25,'Niestandardowe panele'],
  [780,270,11,9,0,.28,'Dove sono archiviati i miei dati?'],
  [15,268,11,12,-6,.25,'Anomali tespiti'],
  [15,325,11,10,-5,.25,'Где хранятся мои данные?'],
  [50,345,15,8,-2,.42,'Systemd journal logs'],
  [55,365,13,12,1,.32,'Machine learning insights'],
  [240,348,16,9,-8,.42,'CPU使用率过高'],
  [310,330,14,11,-4,.38,'Email notifications'],
  [825,325,11,13,3,.25,'커스텀 대시보드'],
  [810,345,13,7,-10,.32,'数据存储在哪里？'],
  [745,355,14,10,0,.38,'Detecção de anomalias'],
  [120,340,11,14,-7,.25,'Waarschuwingen configureren'],
  [400,352,12,8,4,.30,'Προσαρμοσμένοι πίνακες'],
  [105,388,12,10,-6,.30,'K8s CrashLoopBackOff'],
  [280,385,17,9,-1,.50,'How to create custom dashboards?'],
  [540,378,16,12,-8,.45,'Netdataのインストール方法'],
  [540,400,19,8,2,.50,'Slice and dice any dataset'],
  [805,375,12,11,-3,.28,'Configurar alertas'],
  [805,395,13,13,1,.32,'Painéis personalizados'],
  [15,395,11,7,-9,.25,'Konfiguracja alertów'],
  [340,400,14,14,5,.35,'指标关联分析'],
  [690,395,11,9,-5,.28,'Retención de datos'],
  [20,425,18,10,-4,.48,'Настройка оповещений'],
  [260,430,13,12,0,.30,'Пользовательские панели'],
  [495,425,18,8,-7,.50,'データの保存先は？'],
  [490,450,22,9,-2,.55,'Como instalar o Netdata?'],
  [120,448,12,11,-10,.28,'Wo werden meine Daten gespeichert?'],
  [120,465,11,13,3,.25,'Benutzerdefinierte Dashboards'],
  [825,430,11,7,-6,.22,'Multi-cloud monitoring'],
  [825,448,11,14,4,.25,'Datenaufbewahrung'],
  [700,440,12,10,-1,.30,'Configurare gli avvisi'],
  [345,415,13,8,-8,.35,'Windows Event Logs'],
  [15,480,11,10,-5,.25,'Comment installer Netdata?'],
  [195,490,12,12,-2,.32,'Netdata 설치 방법'],
  [310,478,12,8,-9,.28,'Onde meus dados são armazenados?'],
  [440,488,17,9,1,.45,'Как установить Netdata?'],
  [440,505,14,11,-7,.35,"Détection d'anomalies"],
  [690,478,13,13,2,.30,'¿Dónde se almacenan mis datos?'],
  [690,498,12,7,-4,.25,'Anomalieerkennung'],
  [170,502,11,14,4,.22,'Notifications par email'],
  [550,470,13,10,-6,.35,'Space and Room management'],
  [870,490,12,9,-3,.25,'GPU monitoring'],
  [12,518,11,11,-8,.22,'Alert notifications'],
  [195,525,10,8,0,.20,'異常検測'],
  [690,522,11,13,-5,.22,'メトリクスの相関分析'],
  [350,530,12,10,2,.25,'Машинное обучение'],
  [480,518,11,7,-10,.22,'Πώς να εγκαταστήσω το Netdata;'],
  [850,515,11,12,3,.25,'SNMP monitoring'],
  [100,530,10,14,-7,.20,'कस्टम डैशबोर्ड'],
  [700,535,11,9,-1,.22,'Потоковая передача данных'],
  [15,498,11,8,-12,.25,'Monitoreo de contenedores'],
  [250,510,11,11,5,.22,'Surveillance de conteneurs'],
  [560,530,10,13,-9,.20,'Anomaliedetectie'],
];

// Build theme-adaptive home SVG using the widget's CSS variables
function buildHomeSvg() {
  const icon = 'M232.07,186.76a80,80,0,0,0-62.5-114.17A80,80,0,1,0,23.93,138.76l-7.27,24.71a16,16,0,0,0,19.87,19.87l24.71-7.27a80.39,80.39,0,0,0,25.18,7.35,80,80,0,0,0,108.34,40.65l24.71,7.27a16,16,0,0,0,19.87-19.86ZM62,159.5a8.28,8.28,0,0,0-2.26.32L32,168l8.17-27.76a8,8,0,0,0-.63-6,64,64,0,1,1,26.26,26.26A8,8,0,0,0,62,159.5Zm153.79,28.73L224,216l-27.76-8.17a8,8,0,0,0-6,.63,64.05,64.05,0,0,1-85.87-24.88A79.93,79.93,0,0,0,174.7,89.71a64,64,0,0,1,41.75,92.48A8,8,0,0,0,215.82,188.23Z';

  const words = HOME_WORDS.map(w =>
    `<text class="hc-wc" x="${w[0]}" y="${w[1]}" font-size="${w[2]}" style="--d:${w[3]}s;--t:${w[4]}s;--p:${w[5]}">${w[6].replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><defs><linearGradient id="hc-ig" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4A9FE5"/><stop offset="100%" stop-color="#C050CF"/></linearGradient></defs><style>.hc-wc{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;fill:var(--ai-text-secondary,#808080);opacity:0;will-change:opacity;animation:hc-fade var(--d,10s) var(--t,0s) infinite}@keyframes hc-fade{0%{opacity:0}12%{opacity:var(--p,.4)}28%{opacity:var(--p,.4)}40%,100%{opacity:0}}</style>${words}<g transform="translate(302,218) scale(0.42)"><path d="${icon}" fill="url(#hc-ig)"/></g><text x="418" y="295" font-size="95" font-weight="700" fill="var(--ai-text-primary,#fff)" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif" letter-spacing="-1">Nedi</text><text x="418" y="327" font-size="21" fill="var(--ai-text-secondary,#808080)" font-family="'Segoe UI','Helvetica Neue',Arial,sans-serif" letter-spacing="0.5">AI Netdata Assistant</text></svg>`;
}

// Persistent container + instance, survives React unmounts
function getOrCreateNedi(theme) {
  let container = document.getElementById(PERSISTENT_ID);
  if (container) return container;

  container = document.createElement('div');
  container.id = PERSISTENT_ID;
  container.style.cssText = 'width:100%;display:none';
  document.body.appendChild(container);

  window.AiAgentChatConfig = { endpoint: NEDI_ENDPOINT };

  const instance = new window.AiAgentChatUI(container, {
    mode: 'div',
    theme,
    showThemeToggle: false,
    stickyInput: true,
    cssVariables: CSS_VARIABLES,
    homeContent: buildHomeSvg(),
    urlParams: ['q', 'question'],
    onEvent: (event) => {
      if (event.type === 'user-message' && window.posthog) {
        window.posthog.capture('nedi_question', { question: event.content });
      }
    },
  });

  container.__nediInstance = instance;
  return container;
}

export default function Nedi() {
  const mountRef = useRef(null);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (!mountRef.current) return;

    let cleanups = [];

    const boot = () => {
      if (!mountRef.current) return;
      if (typeof window.AiAgentChatUI === 'undefined') return false;

      const nediEl = getOrCreateNedi(colorMode);

      // Move persistent container into the mount point
      mountRef.current.appendChild(nediEl);
      nediEl.style.display = '';

      // Ensure containers fill viewport so sticky footer stays at bottom even when empty.
      // Uses document-relative position (rect.top + scrollY) so the value stays
      // correct even when a resize fires while the user is scrolled down.
      const setMinHeight = () => {
        const top = mountRef.current.getBoundingClientRect().top + window.scrollY;
        const vh = `calc(100vh - ${top}px)`;
        mountRef.current.style.minHeight = vh;
        nediEl.style.minHeight = vh;
        const wrapper = nediEl.querySelector('.ai-agent-wrapper');
        if (wrapper) wrapper.style.minHeight = vh;
      };
      requestAnimationFrame(setMinHeight);
      window.addEventListener('resize', setMinHeight);

      // Save scroll position continuously while on this page
      const onScroll = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
      window.addEventListener('scroll', onScroll, { passive: true });

      // Restore scroll position after DOM settles
      const savedScroll = sessionStorage.getItem(SCROLL_KEY);
      if (savedScroll) {
        setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 50);
      }

      // Focus the chat input after DOM settles
      requestAnimationFrame(() => {
        const input = nediEl.querySelector('.ai-agent-input');
        if (input) input.focus();
      });

      cleanups = [
        () => window.removeEventListener('scroll', onScroll),
        () => window.removeEventListener('resize', setMinHeight),
        () => { nediEl.style.display = 'none'; document.body.appendChild(nediEl); },
      ];
      return true;
    };

    // Try immediately; poll if async script hasn't loaded yet
    if (!boot()) {
      const poll = setInterval(() => { if (boot()) clearInterval(poll); }, 150);
      cleanups.push(() => clearInterval(poll));
    }

    return () => cleanups.forEach(fn => fn());
  }, []);

  // Sync Docusaurus theme changes to Nedi
  useEffect(() => {
    const container = document.getElementById(PERSISTENT_ID);
    if (container && container.__nediInstance) {
      container.__nediInstance.setTheme(colorMode);
    }
  }, [colorMode]);

  return <div ref={mountRef} />;
}
