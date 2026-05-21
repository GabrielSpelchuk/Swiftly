import React from 'react';
import './StatCard.css';

export function StatCard({ label, value, accent = false, icon }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      {icon && <div className="stat-card__icon">{icon}</div>}
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}
