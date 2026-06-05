import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, analyticsApi } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import { StatCard } from '../../components/dashboard/StatCard';
import { OrderCard } from '../../components/orders/OrderCard';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { formatPrice, ORDER_STATUS_LABELS } from '../../utils/format';
import './Dashboard.css';

export function DropshipperDashboard() {
  const { isPendingDropshipper } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPendingDropshipper) {
      setLoading(false);
      return;
    }
    Promise.all([analyticsApi.getStats(), orderApi.getMyOrders()])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data); })
      .finally(() => setLoading(false));
  }, [isPendingDropshipper]);

  if (loading) return <Spinner />;

  if (isPendingDropshipper) {
    return (
      <div className="dashboard container">
        <div className="dashboard__header">
          <div>
            <div className="dashboard__tag">ДРОПШИПЕР</div>
            <h1 className="dashboard__title">Очікування підтвердження</h1>
          </div>
        </div>
        <div className="dashboard__section" style={{
          maxWidth: 560,
          padding: '32px',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          background: 'var(--surface)',
        }}>
          <p style={{ marginBottom: 16, lineHeight: 1.6 }}>
            Дякуємо за реєстрацію як дропшипер. Адміністратор перевіряє ваші дані
            (телефон, канал продажів, посилання на магазин та коментар) і підтвердить акаунт.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Після схвалення ви побачите гуртові ціни в каталозі та зможете оформлювати замовлення.
          </p>
          <Link to="/catalog"><Button variant="secondary">Переглянути каталог (роздріб)</Button></Link>
        </div>
      </div>
    );
  }

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
