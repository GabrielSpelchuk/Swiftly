import React, { useEffect, useState } from 'react';
import { orderApi } from '../../api/services';
import { OrderCard } from '../../components/orders/OrderCard';
import { Spinner } from '../../components/common/Spinner';
import './OrdersPage.css';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders().then(({ data }) => setOrders(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="orders-page container">
      <h1 className="orders-page__title">Мої замовлення</h1>
      {loading ? <Spinner /> : orders.length === 0 ? (
        <div className="orders-page__empty">Замовлень ще немає</div>
      ) : (
        <div className="orders-page__list">
          {orders.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  );
}
