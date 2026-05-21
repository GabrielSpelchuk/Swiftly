import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../api/services';
import { Input, Select } from '../common/Input';
import { Button } from '../common/Button';
import './ProductFilters.css';

export function ProductFilters({ filters, onChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryApi.getAll().then(({ data }) => setCategories(data));
  }, []);

  const handleChange = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  const clearFilters = () => onChange({ search: '', categoryId: '', minPrice: '', maxPrice: '', page: 1 });

  return (
    <aside className="filters">
      <div className="filters__header">
        <span className="filters__title">ФІЛЬТРИ</span>
        <button className="filters__clear" onClick={clearFilters}>Скинути</button>
      </div>

      <Input
        label="Пошук"
        placeholder="Назва товару..."
        value={filters.search || ''}
        onChange={(e) => handleChange('search', e.target.value)}
      />

      <Select
        label="Категорія"
        value={filters.categoryId || ''}
        onChange={(e) => handleChange('categoryId', e.target.value)}
      >
        <option value="">Всі категорії</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </Select>

      <div className="filters__price-row">
        <Input
          label="Ціна від"
          type="number"
          placeholder="0"
          value={filters.minPrice || ''}
          onChange={(e) => handleChange('minPrice', e.target.value)}
        />
        <Input
          label="до"
          type="number"
          placeholder="∞"
          value={filters.maxPrice || ''}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
        />
      </div>
    </aside>
  );
}
