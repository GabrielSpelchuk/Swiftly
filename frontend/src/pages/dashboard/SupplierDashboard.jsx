import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, orderApi, analyticsApi } from '../../api/services';
import { StatCard } from '../../components/dashboard/StatCard';
import { OrderCard } from '../../components/orders/OrderCard';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatPrice } from '../../utils/format';
import './Dashboard.css';

export function SupplierDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    Promise.all([
      analyticsApi.getStats(),
      productApi.getMine(),
      orderApi.getMyOrders(),
    ]).then(([s, p, o]) => {
      setStats(s.data);
      setProducts(p.data);
      setOrders(o.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard container">
      <div className="dashboard__header">
        <div>
          <div className="dashboard__tag">ПОСТАЧАЛЬНИК</div>
          <h1 className="dashboard__title">Панель управління</h1>
        </div>
        <Link to="/dashboard/supplier/products/new">
          <Button variant="primary">+ Новий товар</Button>
        </Link>
      </div>

      <div className="dashboard__stats">
        <StatCard label="Всього замовлень" value={stats?.totalOrders || 0} icon="📦" />
        <StatCard label="Виручка" value={stats?.revenue ? formatPrice(stats.revenue) : '₴ 0'} accent icon="💰" />
        <StatCard label="Активних товарів" value={products.filter(p => p.isActive).length} icon="🏷" />
        <StatCard label="Товарів всього" value={products.length} icon="📋" />
      </div>

      <div className="dashboard__tabs">
        {['orders', 'products'].map((t) => (
          <button key={t} className={`dashboard__tab ${activeTab === t ? 'dashboard__tab--active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'orders' ? 'Замовлення' : 'Мої товари'}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="dashboard__section">
          {orders.length === 0 ? <div className="dashboard__empty">Замовлень ще немає</div> : (
            <div className="orders-list">
              {orders.map((o) => <OrderCard key={o.id} order={o} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="dashboard__section">
          <div className="products-table">
            <div className="products-table__head">
              <span>Назва</span><span>Гурт</span><span>Роздріб</span><span>Залишок</span><span>Статус</span><span></span>
            </div>
            {products.map((p) => (
              <div key={p.id} className="products-table__row">
                <span className="products-table__name">{p.name}</span>
                <span>{formatPrice(p.wholesalePrice)}</span>
                <span>{formatPrice(p.retailPrice)}</span>
                <span style={{ color: p.stock === 0 ? 'var(--danger)' : 'inherit' }}>{p.stock}</span>
                <span style={{ color: p.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                  {p.isActive ? 'Активний' : 'Прихований'}
                </span>
                <Link to={`/dashboard/supplier/products/${p.id}/edit`}>
                  <Button variant="ghost" size="sm">Ред.</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
