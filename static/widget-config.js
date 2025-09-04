// Widget configuration
// Update this URL when moving to production
window.NETDATA_WIDGET_CONFIG = {
  widgetUrl: 'https://agent-events.netdata.cloud/ask-netdata/widget',
  // You can add more configuration options here as needed
  position: 'bottom-right', // Position of the floating button
  buttonSize: '60px', // Size of the floating button
  expandedWidth: '400px', // Width of expanded chat window
  expandedHeight: '600px', // Height of expanded chat window
  // Optional appearance tokens - the widget can consume these via postMessage or query params
  theme: {
    accent: '#00ab44',
    accentRgb: '0,171,68',
    shellRadius: 12,
    shellShadow: '0 10px 40px rgba(0,0,0,0.45)'
  }
};