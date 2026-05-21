import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, categoryApi } from '../../api/services';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { toast } from 'react-toastify';
import './ProductFormPage.css';

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    wholesalePrice: '',
    retailPrice: '',
    stock: '',
    categoryId: '',
  });

  useEffect(() => {
    categoryApi.getAll().then(({ data }) => setCategories(data));

    if (isEdit) {
      productApi.getOne(id)
        .then(({ data }) => {
          setForm({
            name:           data.name           || '',
            description:    data.description    || '',
            wholesalePrice: data.wholesalePrice  || '',
            retailPrice:    data.retailPrice     || '',
            stock:          data.stock           ?? '',
            categoryId:     data.categoryId      || '',
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.wholesalePrice || !form.retailPrice) {
      toast.error("Заповніть обов'язкові поля: назва, гуртова та роздрібна ціни");
      return;
    }

    const payload = {
      name:           form.name.trim(),
      description:    form.description.trim() || null,
      wholesalePrice: Number(form.wholesalePrice),
      retailPrice:    Number(form.retailPrice),
      stock:          Number(form.stock) || 0,
      categoryId:     form.categoryId !== '' ? Number(form.categoryId) : null,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await productApi.update(id, payload);
        toast.success('Товар оновлено');
      } else {
        await productApi.create(payload);
        toast.success('Товар створено');
      }
      navigate('/dashboard/supplier');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const margin = form.wholesalePrice && form.retailPrice
    ? Math.round((Number(form.retailPrice) - Number(form.wholesalePrice)) / Number(form.wholesalePrice) * 100)
    : null;

  if (loading) return <Spinner />;

  return (
    <div className="product-form-page container">
      <button className="product-form-page__back" onClick={() => navigate(-1)}>← Назад</button>
      <h1 className="product-form-page__title">{isEdit ? 'Редагувати товар' : 'Новий товар'}</h1>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="product-form__grid">
          <div className="product-form__col">
            <div className="product-form__section">
              <div className="product-form__section-title">Основна інформація</div>
              <Input label="Назва *" value={form.name} onChange={f('name')} required />
              <div className="product-form__textarea-wrap">
                <label className="field__label">Опис</label>
                <textarea
                  className="product-form__textarea"
                  value={form.description}
                  onChange={f('description')}
                  rows={4}
                  placeholder="Опис товару..."
                />
              </div>
              <Select label="Категорія" value={form.categoryId} onChange={f('categoryId')}>
                <option value="">— Без категорії —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="product-form__col">
            <div className="product-form__section">
              <div className="product-form__section-title">Ціни та наявність</div>
              <Input
                label="Гуртова ціна (₴) *"
                type="number" step="0.01" min="0"
                value={form.wholesalePrice}
                onChange={f('wholesalePrice')}
                required
              />
              <Input
                label="Роздрібна ціна (₴) *"
                type="number" step="0.01" min="0"
                value={form.retailPrice}
                onChange={f('retailPrice')}
                required
              />
              <Input
                label="Залишок (шт.)"
                type="number" min="0"
                value={form.stock}
                onChange={f('stock')}
              />

              {margin !== null && !isNaN(margin) && (
                <div className="product-form__margin-preview">
                  Маржа:{' '}
                  <strong style={{ color: margin >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {margin >= 0 ? '+' : ''}{margin}%
                  </strong>
                  {' '}— прибуток:{' '}
                  <strong>
                    ₴{(Number(form.retailPrice) - Number(form.wholesalePrice)).toFixed(2)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="product-form__actions">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Скасувати</Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Зберегти зміни' : 'Створити товар'}
          </Button>
        </div>
      </form>
    </div>
  );
}
