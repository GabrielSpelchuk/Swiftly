import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../api/services';
import { refreshThunk } from '../../store/slices/authSlice';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ROLE_LABELS } from '../../utils/format';
import { toast } from 'react-toastify';
import './ProfilePage.css';

export function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile(form);
      await dispatch(refreshThunk());
      toast.success('Профіль оновлено');
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Помилка збереження');
    } finally { setSaving(false); }
  };

  return (
    <div className="profile-page container">
      <h1 className="profile-page__title">Мій профіль</h1>

      <div className="profile-page__layout">
        <div className="profile-card">
          <div className="profile-card__avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="profile-card__name">{user?.name}</div>
          <div className="profile-card__email">{user?.email}</div>
          <div style={{ marginTop: 12 }}>
            <Badge color="var(--accent)">{ROLE_LABELS[user?.role] || user?.role}</Badge>
          </div>
          {user?.balance > 0 && (
            <div className="profile-card__balance">
              <div className="profile-card__balance-label">Баланс</div>
              <div className="profile-card__balance-value">₴ {Number(user.balance).toFixed(2)}</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form__section">
            <div className="profile-form__section-title">Особисті дані</div>
            <Input label="Ім'я" value={form.name} onChange={f('name')} />
            <Input label="Телефон" value={form.phone} onChange={f('phone')} placeholder="+380..." />
            <Input label="Email" type="email" value={form.email} onChange={f('email')} />
          </div>

          <div className="profile-form__section">
            <div className="profile-form__section-title">Зміна паролю</div>
            <Input label="Поточний пароль" type="password" value={form.currentPassword} onChange={f('currentPassword')} placeholder="Залиште порожнім, якщо не змінюєте" />
            <Input label="Новий пароль" type="password" value={form.newPassword} onChange={f('newPassword')} />
            <Input label="Підтвердження паролю" type="password" value={form.confirmPassword} onChange={f('confirmPassword')} />
          </div>

          <div className="profile-form__actions">
            <Button type="submit" loading={saving}>Зберегти зміни</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
