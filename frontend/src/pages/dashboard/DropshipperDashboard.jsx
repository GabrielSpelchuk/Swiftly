import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, analyticsApi } from '../../api/services';
import { StatCard } from '../../components/dashboard/StatCard';
import { OrderCard } from '../../components/orders/OrderCard';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { formatPrice, ORDER_STATUS_LABELS } from '../../utils/format';
import './Dashboard.css';

export function DropshipperDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.getStats(), orderApi.getMyOrders()])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard container">
      <div className="dashboard__header">
        <div>
          <div className="dashboard__tag">ДРОПШИПЕР</div>
          <h1 className="dashboard__title">Панель управління</h1>
        </div>
        <Link to="/catalog"><Button variant="primary">+ Нове замовлення</Button></Link>
      </div>

      <div className="dashboard__stats">
        <StatCard label="Всього замовлень" value={stats?.totalOrders || 0} icon="📦" />
        <StatCard label="Загальний прибуток" value={stats?.totalProfit ? formatPrice(stats.totalProfit) : '₴ 0'} accent icon="💰" />
        <StatCard label="Поточний баланс" value={stats?.balance ? formatPrice(stats.balance) : '₴ 0'} icon="💳" />
        <StatCard label="Успішних" value={stats?.ordersByStatus?.find(s => s.status === 'delivered')?.count || 0} icon="✅" />
      </div>

      <div className="dashboard__section">
        <div className="dashboard__section-title">Мої замовлення</div>
        {orders.length === 0 ? (
          <div className="dashboard__empty">
            <p>Замовлень ще немає</p>
            <Link to="/catalog"><Button size="sm">Переглянути каталог</Button></Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  );
}
