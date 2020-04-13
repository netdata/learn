import React from 'react';

import styles from './styles.module.scss';

export const BoxContainer = ({children}) => (
  <div className={styles.boxContainer}>
    {children}
  </div>
)

export const AgentBox = ({children, title, color}) => (
  <div
    style={{
      backgroundColor: color,
      borderRadius: '2px',
      color: '#fff',
      padding: '0.2rem',
    }}>
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);