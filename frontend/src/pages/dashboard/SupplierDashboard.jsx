import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, orderApi, analyticsApi } from '../../api/services';
import { StatCard } from '../../components/dashboard/StatCard';
import { OrderCard } from '../../components/orders/OrderCard';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatPrice, formatPriceExact, formatPercent } from '../../utils/format';
import { toast } from 'react-toastify';
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

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Видалити товар «${name}»? Цю дію не можна скасувати.`)) return;
    try {
      await productApi.remove(id);
      toast.success('Товар видалено');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Не вдалося видалити товар');
    }
  };

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
              <span></span>
              <span>Назва</span>
              <span className="products-table__num">Гурт</span>
              <span className="products-table__num">Роздріб</span>
              <span className="products-table__num">Маржа</span>
              <span className="products-table__num">Залишок</span>
              <span>Статус</span>
              <span>Дії</span>
            </div>
            {products.length === 0 ? (
              <div className="dashboard__empty products-table__empty">Товарів ще немає</div>
            ) : products.map((p) => {
              const wholesale = Number(p.wholesalePrice) || 0;
              const retail = Number(p.retailPrice) || 0;
              const margin = wholesale > 0 ? ((retail - wholesale) / wholesale) * 100 : null;

              return (
                <div key={p.id} className="products-table__row">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt=""
                      className="products-table__thumb"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: 20, opacity: 0.3 }}>📷</span>
                  )}
                  <span className="products-table__name" title={p.name}>{p.name}</span>
                  <span className="products-table__cell products-table__num">{formatPriceExact(p.wholesalePrice)}</span>
                  <span className="products-table__cell products-table__num">{formatPriceExact(p.retailPrice)}</span>
                  <span
                    className="products-table__cell products-table__num"
                    style={{ color: margin === null ? 'var(--text-muted)' : margin > 0 ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {margin === null ? '—' : formatPercent(margin)}
                  </span>
                  <span
                    className="products-table__cell products-table__num"
                    style={{ color: p.stock === 0 ? 'var(--danger)' : 'inherit' }}
                  >
                    {p.stock}
                  </span>
                  <span className="products-table__cell" style={{ color: p.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                    {p.isActive ? 'Активний' : 'Прихований'}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/dashboard/supplier/products/${p.id}/edit`}>
                      <Button variant="secondary" size="sm">Редагувати</Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                    >
                      Видалити
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
