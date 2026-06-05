// RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerThunk } from '../../store/slices/authSlice';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { toast } from 'react-toastify';
import './AuthPage.css';

export function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'customer',
    phone: '',
    shopUrl: '',
    salesChannel: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    const result = await dispatch(registerThunk(form));
    if (registerThunk.fulfilled.match(result)) {
      const msg = form.role === 'dropshipper'
        ? 'Реєстрація успішна! Активуйте email. Після цього адмін перевірить вашу заявку дропшипера.'
        : 'Реєстрація успішна! Перевірте email для активації.';
      toast.success(msg);
      navigate('/login');
    } else {
      setError(result.payload || 'Помилка реєстрації');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">▲ SWIFTLY</div>
        <h1 className="auth-title">Реєстрація</h1>
        <p className="auth-sub">Оберіть свою роль та починайте</p>
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Ім'я" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Пароль" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          
          <Select label="Роль" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            <option value="customer">Покупець</option>
            <option value="dropshipper">Дропшипер</option>
            <option value="supplier">Постачальник</option>
          </Select>

          {form.role === 'dropshipper' && (
            <div className="dropshipper-verification-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Для доступу до гуртових цін адміністратор перевірить ваші дані після активації email.
              </p>
              
              <Input 
                label="Номер телефону (Viber/Telegram)" 
                type="tel" 
                placeholder="+380..." 
                value={form.phone} 
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                required 
              />

              <Select 
                label="Де ви продаєте? (Основний канал)" 
                value={form.salesChannel} 
                onChange={e => setForm(f => ({ ...f, salesChannel: e.target.value }))}
                required
              >
                <option value="">-- Оберіть платформу --</option>
                <option value="Instagram">Instagram аккаунт</option>
                <option value="Telegram">Telegram канал</option>
                <option value="Prom.ua">Маркетплейс Prom.ua</option>
                <option value="Rozetka">Маркетплейс Rozetka</option>
                <option value="Website">Власний інтернет-магазин</option>
                <option value="OLX / Shafa">OLX / Shafa / Kloomba</option>
              </Select>

              <Input 
                label="Посилання на ваш магазин або торгову сторінку" 
                placeholder="https://instagram.com/your_shop або посилання на фід" 
                value={form.shopUrl} 
                onChange={e => setForm(f => ({ ...f, shopUrl: e.target.value }))} 
                required 
              />

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Досвід роботи та докази (коментар для адміна)
                </label>
                <textarea 
                  style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', padding: '10px 14px', fontSize: '14px',
                    borderRadius: '6px', resize: 'vertical', minHeight: '80px', width: '100%'
                  }}
                  placeholder="Опишіть ваш досвід. Можна додати посилання на скріншоти вашої статистики продажів з інших кабінетів (через imgur тощо)..." 
                  value={form.experience} 
                  onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} 
                  required
                />
              </div>

            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>Зареєструватись</Button>
        </form>
        <div className="auth-link">Вже є акаунт? <Link to="/login">Увійти</Link></div>
      </div>
    </div>
  );
}