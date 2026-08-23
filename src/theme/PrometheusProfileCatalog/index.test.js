import { fireEvent, getByLabelText, getByRole, queryAllByLabelText } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { enhancePrometheusProfileCatalogs } from './index';

const catalogue = (suffix = 'one', chartCount = 3) => `
  <details open data-prometheus-profile-catalog id="catalogue-${suffix}">
    <summary>Curated profile coverage</summary>
    <details open data-prometheus-profile>
      <summary>Ceph profile</summary>
      <details data-prometheus-profile-family>
        <summary>Health</summary>
        <details data-prometheus-profile-chart id="health-${suffix}">
          <summary>Cluster Health</summary>
          <p>Dimensions: healthy, warning, critical</p>
          <details><summary>Source selectors</summary><code>ceph_health_status</code></details>
        </details>
        ${chartCount > 1 ? `<details data-prometheus-profile-chart id="latency-${suffix}">
          <summary>Request Duration</summary>
          <p>Operator question: How is request latency distributed?</p>
          <details>
            <summary>Source selectors</summary>
            <code>prometheus.ceph.request_duration_seconds_bucket</code>
          </details>
        </details>` : ''}
      </details>
      ${chartCount > 2 ? `<details data-prometheus-profile-family>
        <summary>Capacity</summary>
        <details data-prometheus-profile-chart id="capacity-${suffix}">
          <summary>Cluster Capacity</summary><p>Units: bytes</p>
        </details>
      </details>` : ''}
    </details>
  </details>`;

describe('Prometheus profile catalogue enhancement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('ignores incomplete and empty catalogues', () => {
    document.body.innerHTML = `
      <details data-prometheus-profile-catalog><p>No summary</p></details>
      <details data-prometheus-profile-catalog><summary>No charts</summary></details>`;

    enhancePrometheusProfileCatalogs();

    expect(queryAllByLabelText(document.body, 'Search curated charts')).toHaveLength(0);
  });

  it('searches normalized chart content, reports no results, and restores authored state', () => {
    document.body.innerHTML = catalogue();
    enhancePrometheusProfileCatalogs();
    const catalog = document.querySelector('#catalogue-one');
    const input = getByLabelText(catalog, 'Search curated charts');
    const status = getByRole(catalog, 'status');

    expect(status).toHaveTextContent('3 charts');
    fireEvent.input(input, { target: { value: 'Dúration' } });
    expect(status).toHaveTextContent('1 of 3 charts shown');
    expect(document.querySelector('#latency-one')).not.toHaveAttribute('hidden');
    expect(document.querySelector('#latency-one')).toHaveAttribute('open');
    expect(document.querySelector('#latency-one details')).toHaveAttribute('open');
    expect(document.querySelector('#health-one')).toHaveAttribute('hidden');
    expect(document.querySelector('#capacity-one')).toHaveAttribute('hidden');
    fireEvent.click(getByRole(catalog, 'button', { name: 'Expand all' }));
    expect(document.querySelector('#latency-one details')).toHaveAttribute('open');

    fireEvent.input(input, { target: { value: 'does not exist' } });
    expect(status).toHaveTextContent('No charts match “does not exist”.');
    expect(status).toHaveClass('is-empty');
    expect(catalog.querySelector('[data-prometheus-profile]')).toHaveAttribute('hidden');

    fireEvent.input(input, { target: { value: '' } });
    expect(status).toHaveTextContent('3 charts');
    expect(status).not.toHaveClass('is-empty');
    expect(catalog.querySelector('[data-prometheus-profile]')).toHaveAttribute('open');
    expect(catalog.querySelector('[data-prometheus-profile-family]')).not.toHaveAttribute('open');
    expect(document.querySelector('#health-one')).not.toHaveAttribute('hidden');
  });

  it('uses native controls, isolates catalogues, and initializes only once', () => {
    document.body.innerHTML = `${catalogue()}${catalogue('two', 1)}`;
    enhancePrometheusProfileCatalogs();
    enhancePrometheusProfileCatalogs();
    const first = document.querySelector('#catalogue-one');
    const second = document.querySelector('#catalogue-two');

    expect(queryAllByLabelText(document.body, 'Search curated charts')).toHaveLength(2);
    expect(getByRole(second, 'status')).toHaveTextContent('1 chart');
    fireEvent.click(getByRole(first, 'button', { name: 'Expand all' }));
    expect(Array.from(first.querySelectorAll('details')).every((details) => details.open)).toBe(true);
    expect(second.querySelector('[data-prometheus-profile-family]')).not.toHaveAttribute('open');

    fireEvent.click(getByRole(first, 'button', { name: 'Collapse all' }));
    expect(Array.from(first.querySelectorAll('details')).every((details) => !details.open)).toBe(true);
    expect(first).toHaveAttribute('open');
  });
});
