import {describe, expect, it, vi} from 'vitest';
import {
  composeDocTitle,
  formatSiteTitle,
  getImmediateParentTitle,
  stripGeneratedSnmpFormerly,
} from './title';

describe('SEO title helpers', () => {
  const breadcrumbs = [
    {label: 'Network Performance Monitoring', href: '/docs/network-performance-monitoring'},
    {label: 'Network Flows', href: '/docs/network-performance-monitoring/network-flows'},
    {label: 'Configuration', href: '/docs/network-performance-monitoring/network-flows/configuration'},
  ];

  it('composes a document title with its immediate parent', () => {
    expect(
      composeDocTitle({
        title: 'Configuration',
        permalink: '/docs/network-performance-monitoring/network-flows/configuration',
        breadcrumbs,
      }),
    ).toBe('Configuration | Network Flows');
  });

  it('uses the parent category correctly on a generated category page', () => {
    expect(
      getImmediateParentTitle(
        breadcrumbs.slice(0, 2),
        '/docs/network-performance-monitoring/network-flows',
      ),
    ).toBe('Network Performance Monitoring');
  });

  it('falls back to the sidebar label for a blank document title', () => {
    expect(
      composeDocTitle({title: ' ', sidebarLabel: 'Ask Nedi', permalink: '/docs/ask-nedi'}),
    ).toBe('Ask Nedi');
  });

  it('prefers an explicit generated integration SEO title without changing the H1 title', () => {
    expect(
      composeDocTitle({
        seoTitle: 'System statistics (windows.plugin)',
        title: 'System statistics',
        sidebarLabel: 'System statistics',
        permalink: '/docs/collecting-metrics/collectors/operating-systems/system-statistics-windows-plugin',
        breadcrumbs: [
          {label: 'Operating Systems', href: '/docs/collecting-metrics/collectors/operating-systems'},
          {
            label: 'System statistics',
            href: '/docs/collecting-metrics/collectors/operating-systems/system-statistics-windows-plugin',
          },
        ],
      }),
    ).toBe('System statistics (windows.plugin)');
  });

  it('strips generated SNMP legacy names only on generated SNMP routes', () => {
    const generated =
      '/docs/network-performance-monitoring/snmp-traps/integrations/delta';
    expect(stripGeneratedSnmpFormerly('Delta AG Formerly Vendor 9000 Corporation SNMP Traps', generated)).toBe(
      'Delta (Vendor 9000) SNMP Traps',
    );
    expect(stripGeneratedSnmpFormerly('Delta Formerly Vendor 9000 SNMP Traps', '/docs/article')).toBe(
      'Delta Formerly Vendor 9000 SNMP Traps',
    );
  });

  it('preserves a unique former-vendor identifier', () => {
    const generated = '/docs/network-performance-monitoring/snmp-traps/integrations/nokia';
    expect(stripGeneratedSnmpFormerly('Nokia Formerly Alcatel Lucent SNMP Traps', generated)).toBe(
      'Nokia (Alcatel Lucent) SNMP Traps',
    );
    expect(stripGeneratedSnmpFormerly('Nokia Formerly Infinera Corp SNMP Traps', generated)).toBe(
      'Nokia (Infinera) SNMP Traps',
    );
  });

  it('keeps shortened SNMP titles unique and under the result limit', () => {
    const defaultFormatter = ({title, siteTitle}) => `${title} | ${siteTitle}`;
    expect(
      formatSiteTitle({
        title: 'Brocade Communications Systems (Mcdata) SNMP Traps | Integrations',
        siteTitle: 'Learn Netdata',
        defaultFormatter,
      }),
    ).toBe('Brocade Communications Systems (Mcdata) SNMP Traps');
  });

  it('drops the site suffix only when the formatted title exceeds 60 characters', () => {
    const defaultFormatter = vi.fn(({title, siteTitle}) => `${title} | ${siteTitle}`);
    expect(
      formatSiteTitle({title: 'Short', siteTitle: 'Learn Netdata', defaultFormatter}),
    ).toBe('Short | Learn Netdata');
    const longTitle = 'A title that is intentionally long enough to exceed sixty characters';
    expect(formatSiteTitle({title: longTitle, siteTitle: 'Learn Netdata', defaultFormatter})).toBe(
      longTitle,
    );
  });
});
