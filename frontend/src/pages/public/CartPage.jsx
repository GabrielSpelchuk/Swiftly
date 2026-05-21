import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useCart } from '../../hooks/useCart';
import { fetchCart, clearCartThunk } from '../../store/slices/cartSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { orderApi } from '../../api/services';
import { formatPrice } from '../../utils/format';
import { toast } from 'react-toastify';
import './CartPage.css';

export function CartPage() {
  const { items, totalItems, totalPrice, updateItem, removeItem } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerAddress: '' });

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.customerAddress) {
      toast.error('Заповніть всі поля доставки');
      return;
    }

    setSubmitting(true);
    try {
      // Group items by supplierId
      const grouped = {};
      for (const item of items) {
        const sid = item.product?.supplierId;
        if (!sid) {
          toast.error(`Не вдалось визначити постачальника для "${item.product?.name}"`);
          setSubmitting(false);
          return;
        }
        if (!grouped[sid]) grouped[sid] = [];
        grouped[sid].push({
          productId: item.productId || item.product?.id,
          quantity: item.quantity,
        });
      }

      for (const [supplierId, orderItems] of Object.entries(grouped)) {
        await orderApi.create({
          customerName:    form.customerName,
          customerPhone:   form.customerPhone,
          customerAddress: form.customerAddress,
          supplierId:      Number(supplierId),
          items:           orderItems,
        });
      }

      // Clear cart AFTER successful order
      await dispatch(clearCartThunk());

      toast.success('Замовлення оформлено!');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка при оформленні замовлення');
    } finally {
      setSubmitting(false);
    }
  };

  if (totalItems === 0) {
    return (
      <div className="cart-page container">
        <h1 className="cart-page__title">Кошик</h1>
        <div className="cart-page__empty">
          <div className="cart-page__empty-icon">◻</div>
          <p>Кошик порожній</p>
          <Link to="/catalog"><Button>До каталогу</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="cart-page__title">Кошик <span>({totalItems})</span></h1>

      <div className="cart-page__layout">
        <div className="cart-page__items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item__image">
                {item.product?.images?.[0]
                  ? <img src={item.product.images[0]} alt={item.product.name} />
                  : <div className="cart-item__no-img">IMG</div>
                }
              </div>
              <div className="cart-item__info">
                <Link to={`/catalog/${item.productId || item.product?.id}`} className="cart-item__name">
                  {item.product?.name}
                </Link>
                <div className="cart-item__price">{formatPrice(item.product?.retailPrice)}</div>
              </div>
              <div className="cart-item__qty">
                <button onClick={() => item.quantity > 1 && updateItem(item.id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item__subtotal">
                {formatPrice((item.product?.retailPrice || 0) * item.quantity)}
              </div>
              <button className="cart-item__remove" onClick={() => removeItem(item.id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="cart-page__summary">
          <div className="cart-summary">
            <div className="cart-summary__title">Підсумок</div>
            <div className="cart-summary__row">
              <span>Товари ({totalItems})</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>Разом</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            {!checkoutOpen ? (
              <Button fullWidth size="lg" onClick={() => setCheckoutOpen(true)}>
                Оформити замовлення
              </Button>
            ) : (
              <form onSubmit={handleCheckout} className="cart-summary__form">
                <div className="cart-summary__form-title">Дані доставки</div>
                <Input label="ПІБ" value={form.customerName}
                  onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} required />
                <Input label="Телефон" value={form.customerPhone}
                  onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} required />
                <Input label="Адреса доставки" value={form.customerAddress}
                  onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))} required />
                <Button type="submit" fullWidth size="lg" loading={submitting}>
                  Підтвердити замовлення
                </Button>
                <button type="button" className="cart-summary__cancel"
                  onClick={() => setCheckoutOpen(false)}>Скасувати</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
