import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/services';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import './AuthPage.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch { setError('Помилка. Спробуйте ще раз.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">▲ SWIFTLY</div>
        <h1 className="auth-title">Відновлення паролю</h1>
        {sent ? (
          <div style={{ color: 'var(--success)', fontSize: 14, lineHeight: 1.7 }}>
            Якщо email існує в системі — ви отримаєте посилання для відновлення.
            <br /><br />
            <Link to="/login" style={{ color: 'var(--accent)' }}>← Повернутись до входу</Link>
          </div>
        ) : (
          <>
            <p className="auth-sub">Введіть email — ми надішлемо посилання</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" fullWidth size="lg" loading={loading}>Надіслати посилання</Button>
            </form>
            <div className="auth-link"><Link to="/login">← Назад до входу</Link></div>
          </>
        )}
      </div>
    </div>
  );
}
