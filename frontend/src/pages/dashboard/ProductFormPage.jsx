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
    images: [], 
  });

  const [imgUrlInput, setImgUrlInput] = useState('');

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
            images:         data.images         || [],
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleAddImage = () => {
    const trimmedUrl = imgUrlInput.trim();
    if (!trimmedUrl) return;

    if (form.images.includes(trimmedUrl)) {
      toast.warn('Таке посилання вже додано');
      return;
    }

    setForm(prev => ({
      ...prev,
      images: [...prev.images, trimmedUrl]
    }));
    setImgUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

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
      images:         form.images, 
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

          <div className="product-form__col" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
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

            <div className="product-form__section">
              <div className="product-form__section-title">Зображення товару</div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input 
                    label="Додати зображення за URL" 
                    placeholder="https://example.com/image.jpg"
                    value={imgUrlInput}
                    onChange={(e) => setImgUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                  />
                </div>
                <Button type="button" onClick={handleAddImage} style={{ marginBottom: '4px' }}>
                  Додати
                </Button>
              </div>

              {form.images.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                  gap: '12px', 
                  marginTop: '8px' 
                }}>
                  {form.images.map((url, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        position: 'relative', 
                        border: '1px solid var(--border)', 
                        borderRadius: '6px', 
                        padding: '4px', 
                        background: 'var(--surface-2)',
                        aspectRatio: '1'
                      }}
                    >
                      <img 
                        src={url} 
                        alt={`Прев'ю ${idx + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => { 
                          e.target.src = 'https://placehold.co/150x150?text=Брочений+URL'; 
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        style={{
                          position: 'absolute', top: '-6px', right: '-6px',
                          background: '#ef4444', color: '#fff', border: 'none',
                          borderRadius: '50%', width: '20px', height: '20px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '12px', fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                        title="Видалити зображення"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '16px', 
                  color: 'var(--text-secondary)', 
                  fontSize: '13px',
                  border: '1px dashed var(--border)',
                  borderRadius: '6px'
                }}>
                  Зображення відсутні. Вставте URL-посилання вище.
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