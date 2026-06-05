import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/services';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { formatPrice } from '../../utils/format';
import { toast } from 'react-toastify';
import './ProductPage.css';

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCart();
  const { isSupplier, isAdmin, isApprovedDropshipper, isPendingDropshipper, isLoggedIn, user } = useAuth();

  useEffect(() => {
    productApi.getOne(id)
      .then(({ data }) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!product) return (
    <div className="container" style={{ padding: '40px 24px', color: 'var(--text-muted)' }}>
      Товар не знайдено
    </div>
  );

  // Is this supplier the owner of this product?
  const isOwner = isSupplier && product.supplierId === user?.id;
  const canAddToCart = !isSupplier && !isAdmin && product.stock > 0;

  const margin = product.wholesalePrice
    ? ((product.retailPrice - product.wholesalePrice) / product.wholesalePrice * 100).toFixed(1)
    : null;
  const profit = product.wholesalePrice
    ? (product.retailPrice - product.wholesalePrice).toFixed(2)
    : null;

  const handleAddToCart = async () => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await addItem(product.id, qty);
      toast.success('Додано до кошика!');
    } catch { toast.error('Помилка додавання'); }
    finally { setAddingToCart(false); }
  };

  const renderPricing = () => {
    // --- Supplier who owns this product ---
    if (isOwner) {
      return (
        <div className="product-page__price-breakdown">
          <div className="product-page__price-row">
            <span className="product-page__price-label">Ваша гуртова ціна</span>
            <span className="product-page__wholesale-price">
              {formatPrice(product.wholesalePrice)}
            </span>
          </div>
          <div className="product-page__price-row">
            <span className="product-page__price-label">Роздрібна ціна (для покупців)</span>
            <span className="product-page__price">{formatPrice(product.retailPrice)}</span>
          </div>
          <div className="product-page__price-row product-page__price-row--profit">
            <span className="product-page__price-label">Різниця (маржа дропшипера)</span>
            <span className="product-page__profit-value">+{formatPrice(profit)} ({margin}%)</span>
          </div>
        </div>
      );
    }

    // --- Admin ---
    if (isAdmin) {
      return (
        <div className="product-page__price-breakdown">
          <div className="product-page__price-row">
            <span className="product-page__price-label">Гуртова ціна</span>
            <span className="product-page__wholesale-price">
              {formatPrice(product.wholesalePrice)}
            </span>
          </div>
          <div className="product-page__price-row">
            <span className="product-page__price-label">Роздрібна ціна</span>
            <span className="product-page__price">{formatPrice(product.retailPrice)}</span>
          </div>
          <div className="product-page__price-row product-page__price-row--profit">
            <span className="product-page__price-label">Маржа дропшипера</span>
            <span className="product-page__profit-value">+{formatPrice(profit)} ({margin}%)</span>
          </div>
        </div>
      );
    }

    // --- Dropshipper (approved) ---
    if (isApprovedDropshipper) {
      return (
        <div className="product-page__price-breakdown">
          <div className="product-page__price-row product-page__price-row--wholesale">
            <span className="product-page__price-label">Ви платите (гурт)</span>
            <span className="product-page__wholesale-price">
              {formatPrice(product.wholesalePrice)}
            </span>
          </div>
          <div className="product-page__price-row">
            <span className="product-page__price-label">Покупець платить (роздріб)</span>
            <span className="product-page__price">{formatPrice(product.retailPrice)}</span>
          </div>
          <div className="product-page__price-row product-page__price-row--profit">
            <span className="product-page__price-label">Ваш прибуток</span>
            <span className="product-page__profit-value">+{formatPrice(profit)} ({margin}%)</span>
          </div>
        </div>
      );
    }

    // --- Customer (default) ---
    return <div className="product-page__price">{formatPrice(product.retailPrice)}</div>;
  };

  return (
    <div className="product-page container">
      <button className="product-page__back" onClick={() => navigate(-1)}>← Назад</button>

      <div className="product-page__layout">
        <div className="product-page__image-wrap">
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name} />
            : <div className="product-page__no-image">NO IMAGE</div>
          }
        </div>

        <div className="product-page__info">
          {product.category && (
            <div className="product-page__category">{product.category.name}</div>
          )}
          <h1 className="product-page__name">{product.name}</h1>
          {product.supplier && (
            <div className="product-page__supplier">
              Постачальник: {product.supplier.name}
            </div>
          )}

          <div className="product-page__pricing">
            {renderPricing()}
          </div>

          <div className="product-page__stock">
            {product.stock > 0
              ? <span style={{ color: 'var(--success)' }}>● В наявності ({product.stock} шт.)</span>
              : <span style={{ color: 'var(--danger)' }}>● Немає в наявності</span>
            }
          </div>

          {product.description && (
            <p className="product-page__desc">{product.description}</p>
          )}

          {canAddToCart && (
            <div className="product-page__actions">
              <div className="product-page__qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <Button size="lg" loading={addingToCart} onClick={handleAddToCart} fullWidth>
                Додати до кошика
              </Button>
            </div>
          )}

          {isApprovedDropshipper && (
            <div className="product-page__dropship-note">
              💡 Ви оплачуєте гуртову ціну — різниця між роздрібом і гуртом є вашим прибутком
            </div>
          )}

          {isPendingDropshipper && (
            <div className="product-page__dropship-note" style={{ borderColor: 'var(--warning)' }}>
              ⏳ Ваш акаунт дропшипера очікує підтвердження адміністратором. Гуртові ціни та замовлення будуть доступні після схвалення.
            </div>
          )}

          {isOwner && (
            <div className="product-page__owner-note">
              ✏️ Це ваш товар —{' '}
              <span
                style={{ color: 'var(--accent)', cursor: 'pointer' }}
                onClick={() => navigate(`/dashboard/supplier/products/${product.id}/edit`)}
              >
                редагувати
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}