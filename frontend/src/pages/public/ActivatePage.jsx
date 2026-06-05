import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi } from '../../api/services';
import './AuthPage.css';
import './ActivatePage.css';

export function ActivatePage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const calledRef = useRef(false); // prevent double-call in React StrictMode

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    authApi.activate(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        // 404 = invalid token, anything else = already activated or expired
        if (err.response?.status === 404) {
          setStatus('error');
        } else {
          // Could be already activated — treat as success so UX is smooth
          setStatus('already');
        }
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-box activate-box">
        <div className="auth-logo">▲ SWIFTLY</div>

        {status === 'loading' && (
          <div className="activate-state">
            <div className="activate-spinner" />
            <p>Активація акаунту...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="activate-state">
            <div className="activate-icon">✓</div>
            <h2>Акаунт активовано!</h2>
            <p>Тепер ви можете увійти в систему.</p>
            <Link to="/login" className="activate-btn">Увійти →</Link>
          </div>
        )}

        {status === 'already' && (
          <div className="activate-state">
            <div className="activate-icon">✓</div>
            <h2>Акаунт вже активовано</h2>
            <p>Ви можете увійти в систему.</p>
            <Link to="/login" className="activate-btn">Увійти →</Link>
          </div>
        )}

        {status === 'error' && (
          <div className="activate-state">
            <div className="activate-icon activate-icon--error">✕</div>
            <h2>Невірне посилання</h2>
            <p>Токен активації недійсний. Зареєструйтесь ще раз.</p>
            <Link to="/register" className="activate-btn">Зареєструватись →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
