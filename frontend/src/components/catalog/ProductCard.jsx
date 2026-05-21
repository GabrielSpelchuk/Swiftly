import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/format';
import { toast } from 'react-toastify';
import './ProductCard.css';

export function ProductCard({ product }) {
  const { isSupplier, isAdmin, isDropshipper } = useAuth();
  const { addItem } = useCart();

  const showWholesale = isDropshipper || isSupplier || isAdmin;
  const canAddToCart  = !isSupplier && !isAdmin;

  const margin = showWholesale && product.wholesalePrice && product.retailPrice
    ? Math.round(((product.retailPrice - product.wholesalePrice) / product.wholesalePrice) * 100)
    : null;

  const profit = showWholesale && product.wholesalePrice && product.retailPrice
    ? (product.retailPrice - product.wholesalePrice).toFixed(0)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addItem(product.id, 1);
      toast.success(`"${product.name}" додано до кошика`);
    } catch {
      toast.error('Помилка при додаванні до кошика');
    }
  };

  return (
    <Link to={`/catalog/${product.id}`} className="product-card">
      <div className="product-card__image">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} />
          : <div className="product-card__no-image">IMG</div>
        }
        {margin !== null && (
          <div className="product-card__margin-badge">+{margin}%</div>
        )}
        {product.stock === 0 && (
          <div className="product-card__out">Немає</div>
        )}
      </div>

      <div className="product-card__body">
        {product.category && (
          <span className="product-card__category">{product.category.name}</span>
        )}
        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__pricing">
          {showWholesale ? (
            <>
              {/* Dropshipper/supplier sees both prices clearly */}
              <div className="product-card__price-row">
                <span className="product-card__price-label">Роздріб</span>
                <span className="product-card__retail">{formatPrice(product.retailPrice)}</span>
              </div>
              <div className="product-card__price-row product-card__price-row--wholesale">
                <span className="product-card__price-label">Гурт</span>
                <span className="product-card__wholesale">{formatPrice(product.wholesalePrice)}</span>
              </div>
              {profit && (
                <div className="product-card__profit">
                  Прибуток: <strong>+{formatPrice(profit)}</strong>
                </div>
              )}
            </>
          ) : (
            <span className="product-card__price">{formatPrice(product.retailPrice)}</span>
          )}
        </div>

        <div className="product-card__footer">
          <span className="product-card__stock">
            {product.stock > 0 ? `${product.stock} шт.` : 'Немає в наявності'}
          </span>
          {canAddToCart && product.stock > 0 && (
            <button className="product-card__add-btn" onClick={handleAddToCart}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
