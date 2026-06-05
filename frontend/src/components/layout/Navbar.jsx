import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { logoutThunk } from '../../store/slices/authSlice';
import './Navbar.css';

export function Navbar() {
  const { user, isLoggedIn, isAdmin, isSupplier, isDropshipper } = useAuth();
  const { totalItems } = useCart();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/');
  };

  const dashboardPath = isAdmin ? '/dashboard/admin' : isSupplier ? '/dashboard/supplier' : '/dashboard/dropshipper';

  return (
    <nav className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">▲</span>
          <span className="navbar__logo-text">Swif<span>tly</span></span>
        </Link>

        <div className="navbar__links">
          <Link to="/catalog" className={`navbar__link ${location.pathname.startsWith('/catalog') ? 'navbar__link--active' : ''}`}>Каталог</Link>
          {isLoggedIn && (isDropshipper || isAdmin) && (
            <Link to="/dashboard/dropshipper" className={`navbar__link ${location.pathname.startsWith('/dashboard') ? 'navbar__link--active' : ''}`}>Панель</Link>
          )}
          {isLoggedIn && isSupplier && (
            <Link to="/dashboard/supplier" className={`navbar__link ${location.pathname.startsWith('/dashboard') ? 'navbar__link--active' : ''}`}>Панель</Link>
          )}
          {isAdmin && (
            <Link to="/dashboard/admin" className={`navbar__link ${location.pathname.startsWith('/dashboard/admin') ? 'navbar__link--active' : ''}`}>Адмін</Link>
          )}
        </div>

        <div className="navbar__actions">
          {!isSupplier && !isAdmin && (
            <Link to="/cart" className="navbar__cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {totalItems > 0 && <span className="navbar__badge">{totalItems}</span>}
            </Link>
          )}

          {isLoggedIn ? (
            <div className="navbar__user" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="navbar__avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <span className="navbar__username">{user?.name}</span>
              {menuOpen && (
                <div className="navbar__dropdown">
                  <Link to="/profile" className="navbar__dropdown-item" onClick={() => setMenuOpen(false)}>Профіль</Link>
                  <Link to="/orders" className="navbar__dropdown-item" onClick={() => setMenuOpen(false)}>Мої замовлення</Link>
                  <div className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>Вийти</button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="navbar__link">Увійти</Link>
              <Link to="/register" className="navbar__btn">Реєстрація</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
