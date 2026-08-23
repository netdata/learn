import React from 'react';

const ALERT_TABLE_HEADERS = ['Alert name', 'On metric', 'Description'];

const nodeText = (node) => React.Children.toArray(node)
  .map((child) => (React.isValidElement(child) ? nodeText(child.props.children) : String(child)))
  .join('')
  .trim();

const childrenOfType = (children, type) => React.Children.toArray(children)
  .filter((child) => React.isValidElement(child) && child.type === type);

const tableHeaders = (children) => {
  const head = childrenOfType(children, 'thead')[0];
  const row = head && childrenOfType(head.props.children, 'tr')[0];
  return row ? childrenOfType(row.props.children, 'th').map((cell) => nodeText(cell.props.children)) : [];
};

const isAlertTable = (children) => {
  const headers = tableHeaders(children);
  return headers.length === ALERT_TABLE_HEADERS.length &&
    ALERT_TABLE_HEADERS.every((header, index) => headers[index] === header);
};

const labelBody = (body) => React.cloneElement(body, undefined,
  React.Children.map(body.props.children, (row) => {
    if (!React.isValidElement(row) || row.type !== 'tr') return row;
    return React.cloneElement(row, undefined,
      React.Children.map(row.props.children, (cell, index) => {
        if (!React.isValidElement(cell) || cell.type !== 'td' || index >= ALERT_TABLE_HEADERS.length) {
          return cell;
        }
        return React.cloneElement(cell, undefined,
          <span className="integration-alert-table__mobile-label" aria-hidden="true">
            {ALERT_TABLE_HEADERS[index]}
          </span>,
          cell.props.children,
        );
      }),
    );
  }),
);

export default function ResponsiveAlertTable({ children, className, ...props }) {
  if (!isAlertTable(children)) {
    return <table className={className} {...props}>{children}</table>;
  }

  const responsiveChildren = React.Children.map(children, (child) => (
    React.isValidElement(child) && child.type === 'tbody' ? labelBody(child) : child
  ));
  const classes = [className, 'integration-alert-table'].filter(Boolean).join(' ');
  return <table className={classes} {...props}>{responsiveChildren}</table>;
}
