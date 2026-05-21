import React from 'react';
import styles from './StatsCard.module.css';

export default function StatsCard({ label, value, sub, accent = false, icon }) {
  return (
    <div className={[styles.card, accent ? styles.accent : ''].join(' ')}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
