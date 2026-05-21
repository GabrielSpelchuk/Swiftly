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
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await dispatch(registerThunk(form));
    if (registerThunk.fulfilled.match(result)) {
      toast.success('Реєстрація успішна! Перевірте email для активації.');
      navigate('/login');
    } else {
      setError(result.payload || 'Помилка реєстрації');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">▲ DROPSYNC</div>
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
          <Button type="submit" fullWidth size="lg" loading={loading}>Зареєструватись</Button>
        </form>
        <div className="auth-link">Вже є акаунт? <Link to="/login">Увійти</Link></div>
      </div>
    </div>
  );
}
