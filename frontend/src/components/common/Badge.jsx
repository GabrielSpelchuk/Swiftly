import React from 'react';

export function Badge({ children, color = '#5B9CF6' }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: color + '22',
      color: color,
      border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  );
}
