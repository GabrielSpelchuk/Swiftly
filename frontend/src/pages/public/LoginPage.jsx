import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginThunk } from '../../store/slices/authSlice';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { toast } from 'react-toastify';
import './AuthPage.css';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await dispatch(loginThunk(form));
    if (loginThunk.fulfilled.match(result)) {
      const { user, pendingApproval, message } = result.payload;
      if (pendingApproval && message) toast.info(message, { autoClose: 6000 });
      const role = user.role;
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'supplier') navigate('/dashboard/supplier');
      else if (role === 'dropshipper') navigate('/dashboard/dropshipper');
      else navigate('/');
    } else {
      setError(result.payload || 'Помилка входу');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">▲ SWIFTLY</div>
        <h1 className="auth-title">Увійти</h1>
        <p className="auth-sub">Ласкаво просимо назад</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input label="Пароль" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <div className="auth-forgot"><Link to="/forgot-password">Забули пароль?</Link></div>
          <Button type="submit" fullWidth size="lg" loading={loading}>Увійти</Button>
        </form>
        <div className="auth-link">Немає акаунту? <Link to="/register">Зареєструватись</Link></div>
      </div>
    </div>
  );
}
