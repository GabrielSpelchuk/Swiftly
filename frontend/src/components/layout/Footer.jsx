import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">▲ Swiftly</span>
          <p className="footer__tagline">Платформа для сучасного дропшипінгу</p>
        </div>
        <div className="footer__links">
          <Link to="/catalog">Каталог</Link>
          <Link to="/login">Увійти</Link>
          <Link to="/register">Реєстрація</Link>
        </div>
        <div className="footer__copy">© 2025 Swiflty.</div>
      </div>
    </footer>
  );
}
