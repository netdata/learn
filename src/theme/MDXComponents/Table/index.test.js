import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ResponsiveAlertTable from './index';

const alertTable = (props = {}) => (
  <ResponsiveAlertTable {...props}>
    <thead>
      <tr>
        <th><span>Alert name</span></th>
        <th>On metric</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>ceph_health_error</td>
        <td>prometheus.ceph.cluster.health_status</td>
        <td>Ceph reports an unhealthy cluster.</td>
      </tr>
      <tr>
        <td>ceph_nvmeof_subsystem_open_security</td>
        <td>prometheus.ceph.nvme_of.subsystems.state_metadata</td>
        <td>The subsystem is configured without host security.</td>
      </tr>
    </tbody>
  </ResponsiveAlertTable>
);

describe('ResponsiveAlertTable', () => {
  it('labels the exact integration alert schema while preserving table semantics and values', () => {
    const { container } = render(alertTable({ className: 'existing', 'data-testid': 'alerts' }));
    const table = screen.getByTestId('alerts');
    expect(table).toHaveClass('existing', 'integration-alert-table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    const metricCell = within(table).getByText('prometheus.ceph.nvme_of.subsystems.state_metadata').closest('td');
    expect(metricCell).toHaveAccessibleName('prometheus.ceph.nvme_of.subsystems.state_metadata');

    const labels = container.querySelectorAll('.integration-alert-table__mobile-label');
    expect(labels).toHaveLength(6);
    expect(Array.from(labels, (label) => label.textContent)).toEqual([
      'Alert name', 'On metric', 'Description',
      'Alert name', 'On metric', 'Description',
    ]);
    expect(Array.from(labels).every((label) => label.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('leaves unrelated and malformed tables unchanged', () => {
    const { rerender, container } = render(
      <ResponsiveAlertTable className="ordinary">
        <thead><tr><th>Name</th><th>Value</th></tr></thead>
        <tbody><tr><td>one</td><td>1</td></tr></tbody>
      </ResponsiveAlertTable>,
    );
    expect(screen.getByRole('table')).toHaveClass('ordinary');
    expect(screen.getByRole('table')).not.toHaveClass('integration-alert-table');
    expect(container.querySelector('.integration-alert-table__mobile-label')).not.toBeInTheDocument();

    rerender(<ResponsiveAlertTable><tbody>plain text</tbody></ResponsiveAlertTable>);
    expect(screen.getByRole('table')).not.toHaveClass('integration-alert-table');
  });

  it('marks generated Prometheus metric tables without changing their content', () => {
    render(
      <ResponsiveAlertTable className="existing">
        <thead>
          <tr>
            <th>Prometheus metric</th>
            <th>Netdata chart</th>
            <th>Dimension</th>
            <th>Unit</th>
            <th>Scope</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ceph_health_status</td>
            <td>Health / Overall — Cluster Health</td>
            <td>status</td>
            <td>status</td>
            <td>Ceph cluster endpoint</td>
          </tr>
        </tbody>
      </ResponsiveAlertTable>,
    );

    const table = screen.getByRole('table');
    expect(table).toHaveClass('existing', 'prometheus-profile-metrics-table');
    expect(within(table).getAllByRole('columnheader')).toHaveLength(5);
    expect(within(table).getByText('ceph_health_status')).toBeInTheDocument();
  });

  it('keeps non-cell body children and extra cells when enhancing a valid header', () => {
    const { container } = render(
      <ResponsiveAlertTable>
        <thead><tr><th>Alert name</th><th>On metric</th><th>Description</th></tr></thead>
        <tbody>
          {'preserved'}
          <tr><td>alert</td><td>metric</td><td>description</td><td>extra</td></tr>
        </tbody>
      </ResponsiveAlertTable>,
    );
    expect(screen.getByRole('table')).toHaveClass('integration-alert-table');
    expect(container.querySelectorAll('.integration-alert-table__mobile-label')).toHaveLength(3);
    expect(screen.getByText('extra')).toBeInTheDocument();
    expect(screen.getByText('preserved')).toBeInTheDocument();
  });
});
