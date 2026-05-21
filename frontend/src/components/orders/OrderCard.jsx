import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatPrice, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/format';
import { Badge } from '../common/Badge';
import './OrderCard.css';

export function OrderCard({ order }) {
  const statusColor = ORDER_STATUS_COLORS[order.status] || '#888';
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;

  // id can be integer (Postgres) or UUID string — handle both
  const shortId = String(order.id).length > 8
    ? String(order.id).slice(0, 8).toUpperCase()
    : String(order.id).padStart(6, '0');

  return (
    <Link to={`/orders/${order.id}`} className="order-card">
      <div className="order-card__header">
        <div>
          <span className="order-card__id">#{shortId}</span>
          <span className="order-card__date">{formatDate(order.createdAt)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {order.source === 'b2b' && <Badge color="#9B7FE8">B2B</Badge>}
          {order.source === 'b2c' && <Badge color="#5B9CF6">B2C</Badge>}
          <Badge color={statusColor}>{statusLabel}</Badge>
        </div>
      </div>

      <div className="order-card__customer">
        <span>📦 {order.customerName}</span>
        <span className="order-card__address">{order.customerAddress}</span>
      </div>

      {order.trackingNumber && (
        <div className="order-card__tracking">
          Трек: <strong>{order.trackingNumber}</strong>
        </div>
      )}

      <div className="order-card__footer">
        <span className="order-card__items">{order.items?.length || 0} товарів</span>
        <div>
          <span className="order-card__total">{formatPrice(order.totalRetail)}</span>
          {order.profit > 0 && (
            <span className="order-card__profit">+{formatPrice(order.profit)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
