import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/services';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { toast } from 'react-toastify';
import './AuthPage.css';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { toast.error('Паролі не збігаються'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: form.newPassword });
      toast.success('Пароль змінено! Тепер можна увійти.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">▲ DROPSYNC</div>
        <h1 className="auth-title">Новий пароль</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Новий пароль" type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required />
          <Input label="Підтвердження" type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />
          <Button type="submit" fullWidth size="lg" loading={loading}>Змінити пароль</Button>
        </form>
      </div>
    </div>
  );
}
