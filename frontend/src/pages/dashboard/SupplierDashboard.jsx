import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, orderApi, analyticsApi } from '../../api/services';
import { StatCard } from '../../components/dashboard/StatCard';
import { OrderCard } from '../../components/orders/OrderCard';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatPrice } from '../../utils/format';
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
            <div className="products-table__head" style={{ gridTemplateColumns: '48px 1fr 1fr 1fr 1fr 1fr auto' }}>
              <span></span><span>Назва</span><span>Гурт</span><span>Роздріб</span><span>Залишок</span><span>Статус</span><span>Дії</span>
            </div>
            {products.length === 0 ? (
              <div className="dashboard__empty">Товарів ще немає</div>
            ) : products.map((p) => (
              <div key={p.id} className="products-table__row" style={{ gridTemplateColumns: '48px 1fr 1fr 1fr 1fr 1fr auto' }}>
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt=""
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span style={{ fontSize: 20, opacity: 0.3 }}>📷</span>
                )}
                <span className="products-table__name">{p.name}</span>
                <span>{formatPrice(p.wholesalePrice)}</span>
                <span>{formatPrice(p.retailPrice)}</span>
                <span style={{ color: p.stock === 0 ? 'var(--danger)' : 'inherit' }}>{p.stock}</span>
                <span style={{ color: p.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                  {p.isActive ? 'Активний' : 'Прихований'}
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
