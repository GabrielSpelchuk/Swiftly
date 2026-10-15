import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../../api/services';
import { ProductCard } from '../../components/catalog/ProductCard';
import { ProductFilters } from '../../components/catalog/ProductFilters';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import './CatalogPage.css';

export function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', categoryId: '', minPrice: '', maxPrice: '', page: 1 });
  const { isLoading: isAuthLoading, isApprovedDropshipper, isSupplier, isAdmin } = useAuth();

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await productApi.getAll(filters);
      setProducts(data.products ?? []);
      setMeta({ total: data.total ?? 0, totalPages: data.totalPages ?? 1 });
    } catch (err) {
      // Раніше помилку ковтали мовчки, тому "Товарів не знайдено"
      // було наслідком 400 від бекенда, а не порожнім результатом.
      console.error('Catalog load failed:', err.response?.status, err.response?.data);
      setProducts([]);
      setMeta({ total: 0, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Не вантажимо товари, доки не зрозуміло, хим є користувач.
  // Інакше запит іде без токена, бекенд повертає товари без гуртових
  // цін, а після відновлення сесії картки вже не перезавантажуються.
  useEffect(() => {
    if (!isAuthLoading) {
      load();
    }
  }, [load, isAuthLoading]);

  // Якщо роль змінилась уже після завантаження (refresh завершився пізніше) —
  // перезавантажуємо, щоб отримати повний набір цін.
  const canSeeWholesale = isApprovedDropshipper || isSupplier || isAdmin;
  const [lastRole, setLastRole] = useState(canSeeWholesale);

  useEffect(() => {
    if (lastRole !== canSeeWholesale) {
      setLastRole(canSeeWholesale);
      load();
    }
  }, [canSeeWholesale, lastRole, load]);

  return (
    <div className="catalog-page container">
      <div className="catalog-page__header">
        <h1 className="catalog-page__title">Каталог товарів</h1>
        <span className="catalog-page__count">{meta.total} товарів</span>
      </div>

      <div className="catalog-page__layout">
        <ProductFilters filters={filters} onChange={setFilters} />

        <div className="catalog-page__main">
          {isLoading || isAuthLoading ? (
            <Spinner />
          ) : products.length === 0 ? (
            <div className="catalog-page__empty">
              <div className="catalog-page__empty-icon">◻</div>
              <p>Товарів не знайдено</p>
            </div>
          ) : (
            <>
              <div className="catalog-page__grid">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {meta.totalPages > 1 && (
                <div className="catalog-page__pagination">
                  <Button
                    variant="secondary" size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                  >← Назад</Button>
                  <span className="catalog-page__page-info">{filters.page} / {meta.totalPages}</span>
                  <Button
                    variant="secondary" size="sm"
                    disabled={filters.page >= meta.totalPages}
                    onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                  >Далі →</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
