import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../../store/slices/authSlice';
import { getInitials } from '../../utils/helpers';
import styles from './DashboardLayout.module.css';

const navByRole = {
  admin: [
    { to: '/dashboard', label: 'Огляд', icon: '▦' },
    { to: '/dashboard/users', label: 'Користувачі', icon: '◎' },
    { to: '/dashboard/categories', label: 'Категорії', icon: '◈' },
    { to: '/dashboard/orders', label: 'Замовлення', icon: '◻' },
    { to: '/dashboard/analytics', label: 'Аналітика', icon: '◈' },
  ],
  supplier: [
    { to: '/dashboard', label: 'Огляд', icon: '▦' },
    { to: '/dashboard/products', label: 'Мої товари', icon: '◻' },
    { to: '/dashboard/orders', label: 'Замовлення', icon: '◎' },
    { to: '/dashboard/analytics', label: 'Аналітика', icon: '◈' },
  ],
  dropshipper: [
    { to: '/dashboard', label: 'Огляд', icon: '▦' },
    { to: '/catalog', label: 'Каталог', icon: '◻' },
    { to: '/dashboard/orders', label: 'Мої замовлення', icon: '◎' },
    { to: '/dashboard/analytics', label: 'Аналітика', icon: '◈' },
    { to: '/dashboard/balance', label: 'Баланс', icon: '◈' },
  ],
  customer: [
    { to: '/catalog', label: 'Каталог', icon: '◻' },
    { to: '/dashboard/orders', label: 'Мої замовлення', icon: '◎' },
    { to: '/cart', label: 'Кошик', icon: '◎' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const nav = navByRole[user?.role] || [];
  const cartCount = cart?.items?.length || 0;

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <div className={[styles.layout, collapsed ? styles.collapsed : ''].join(' ')}>
      {/* ─── Sidebar ─── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>⬡</span>
          {!collapsed && <span className={styles.brandName}>Dropflow</span>}
        </div>

        <nav className={styles.nav}>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].join(' ')
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ''].join(' ')
            }
          >
            <span className={styles.navIcon}>⚙</span>
            {!collapsed && <span className={styles.navLabel}>Налаштування</span>}
          </NavLink>

          <button className={styles.navItem} onClick={handleLogout}>
            <span className={styles.navIcon}>⇥</span>
            {!collapsed && <span className={styles.navLabel}>Вихід</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle sidebar"
          >
            {collapsed ? '→' : '←'}
          </button>

          <div className={styles.topbarRight}>
            {user?.role === 'customer' && (
              <NavLink to="/cart" className={styles.cartBtn}>
                🛒
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </NavLink>
            )}

            <NavLink to="/dashboard/settings" className={styles.userChip}>
              <span className={styles.avatar}>{getInitials(user?.name)}</span>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={`badge badge--${user?.role}`}>{user?.role}</span>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
