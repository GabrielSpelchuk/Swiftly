import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/services';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/format';
import { toast } from 'react-toastify';
import './OrderDetailPage.css';

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupplier, isAdmin, isApprovedDropshipper, isCustomer } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusForm, setStatusForm] = useState({ status: '', trackingNumber: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    orderApi.getOne(id)
      .then(({ data }) => {
        setOrder(data);
        setStatusForm({ status: data.status, trackingNumber: data.trackingNumber || '' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data } = await orderApi.updateStatus(id, statusForm);
      setOrder(data);
      toast.success('Статус оновлено');
    } catch { toast.error('Помилка'); }
    finally { setUpdating(false); }
  };

  if (loading) return <Spinner />;
  if (!order) return <div className="container" style={{ padding: 40 }}>Замовлення не знайдено</div>;

  const statusColor = ORDER_STATUS_COLORS[order.status] || '#888';

  // Customers only see retail total — no wholesale/profit info
  const showFinancials = isSupplier || isAdmin || isApprovedDropshipper;

  return (
    <div className="order-detail container">
      <button className="order-detail__back" onClick={() => navigate(-1)}>← Назад</button>

      <div className="order-detail__header">
        <div>
          <h1 className="order-detail__id">
            Замовлення #{String(order.id).slice(0, 8).toUpperCase()}
          </h1>
          <div className="order-detail__date">{formatDate(order.createdAt)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {order.source === 'b2b' && <Badge color="#9B7FE8">B2B</Badge>}
          {order.source === 'b2c' && <Badge color="#5B9CF6">B2C</Badge>}
          <Badge color={statusColor}>{ORDER_STATUS_LABELS[order.status]}</Badge>
        </div>
      </div>

      <div className="order-detail__layout">
        <div className="order-detail__main">
          {/* Items */}
          <div className="order-detail__section">
            <div className="order-detail__section-title">Товари</div>
            {order.items?.map((item) => (
              <div key={item.id} className="order-detail__item">
                <div className="order-detail__item-img">
                  {item.product?.images?.[0]
                    ? <img src={item.product.images[0]} alt={item.product.name} />
                    : <div className="order-detail__item-no-img">IMG</div>
                  }
                </div>
                <div className="order-detail__item-info">
                  <div className="order-detail__item-name">{item.product?.name}</div>
                  <div className="order-detail__item-price">
                    {formatPrice(item.priceAtOrder)} × {item.quantity}
                  </div>
                </div>
                <div className="order-detail__item-total">
                  {formatPrice(item.priceAtOrder * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery */}
          <div className="order-detail__section">
            <div className="order-detail__section-title">Доставка</div>
            <div className="order-detail__info-row"><span>Отримувач</span><span>{order.customerName}</span></div>
            <div className="order-detail__info-row"><span>Телефон</span><span>{order.customerPhone}</span></div>
            <div className="order-detail__info-row"><span>Адреса</span><span>{order.customerAddress}</span></div>
            {order.trackingNumber && (
              <div className="order-detail__info-row">
                <span>Трек-номер</span>
                <strong style={{ color: 'var(--info)' }}>{order.trackingNumber}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="order-detail__sidebar">
          {/* Financials — only for supplier / admin / dropshipper */}
          <div className="order-detail__section">
            <div className="order-detail__section-title">Сума замовлення</div>

            {showFinancials ? (
              <>
                <div className="order-detail__info-row">
                  <span>Роздрібна сума</span>
                  <span>{formatPrice(order.totalRetail)}</span>
                </div>
                <div className="order-detail__info-row">
                  <span>Гуртова сума</span>
                  <span>{formatPrice(order.totalWholesale)}</span>
                </div>
                <div className="order-detail__info-row order-detail__info-row--accent">
                  <span>Прибуток</span>
                  <strong style={{ color: 'var(--success)' }}>
                    +{formatPrice(order.profit)}
                  </strong>
                </div>
              </>
            ) : (
              // Customer sees only total to pay
              <div className="order-detail__info-row order-detail__info-row--accent">
                <span>До сплати</span>
                <strong>{formatPrice(order.totalRetail)}</strong>
              </div>
            )}
          </div>

          {/* Status update — supplier / admin only */}
          {(isSupplier || isAdmin) && (
            <div className="order-detail__section">
              <div className="order-detail__section-title">Оновити статус</div>
              <form onSubmit={handleStatusUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <select
                  className="field__input"
                  value={statusForm.status}
                  onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                >
                  {['new','processing','shipped','delivered','cancelled'].map(s => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <Input
                  label="Трек-номер (необов'язково)"
                  value={statusForm.trackingNumber}
                  onChange={e => setStatusForm(f => ({ ...f, trackingNumber: e.target.value }))}
                  placeholder="UA000000000000"
                />
                <Button type="submit" loading={updating} fullWidth>Зберегти</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
