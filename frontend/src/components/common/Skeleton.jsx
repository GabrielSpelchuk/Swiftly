import React from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ width = '100%', height = 16, radius = 4, className = '' }) {
  return (
    <span
      className={[styles.skeleton, className].join(' ')}
      style={{ width, height, borderRadius: radius }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.productCard}>
      <Skeleton height={200} radius={8} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={12} width="60%" />
        <Skeleton height={18} />
        <Skeleton height={14} width="40%" />
        <Skeleton height={36} radius={4} style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}
