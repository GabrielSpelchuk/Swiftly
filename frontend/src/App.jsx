import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

import { refreshThunk } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { useAuth } from './hooks/useAuth';

import { Navbar }       from './components/layout/Navbar';
import { Footer }       from './components/layout/Footer';
import { PrivateRoute } from './components/layout/PrivateRoute';

import { HomePage }           from './pages/public/HomePage';
import { CatalogPage }        from './pages/public/CatalogPage';
import { ProductPage }        from './pages/public/ProductPage';
import { CartPage }           from './pages/public/CartPage';
import { OrdersPage }         from './pages/public/OrdersPage';
import { OrderDetailPage }    from './pages/public/OrderDetailPage';
import { ProfilePage }        from './pages/public/ProfilePage';
import { LoginPage }          from './pages/public/LoginPage';
import { RegisterPage }       from './pages/public/RegisterPage';
import { ActivatePage }       from './pages/public/ActivatePage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage }  from './pages/public/ResetPasswordPage';

import { SupplierDashboard }    from './pages/dashboard/SupplierDashboard';
import { DropshipperDashboard } from './pages/dashboard/DropshipperDashboard';
import { AdminDashboard }       from './pages/dashboard/AdminDashboard';
import { ProductFormPage }      from './pages/dashboard/ProductFormPage';

function AppRoutes() {
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();

  useEffect(() => { dispatch(refreshThunk()); }, [dispatch]);
  useEffect(() => { if (isLoggedIn) dispatch(fetchCart()); }, [isLoggedIn, dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<HomePage />} />
          <Route path="/catalog"           element={<CatalogPage />} />
          <Route path="/catalog/:id"       element={<ProductPage />} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"          element={<RegisterPage />} />
          <Route path="/activate/:token"   element={<ActivatePage />} />
          <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
          <Route path="/reset-password"    element={<ResetPasswordPage />} />

          {/* Authenticated */}
          <Route path="/cart"        element={<PrivateRoute><CartPage /></PrivateRoute>} />
          <Route path="/orders"      element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:id"  element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/profile"     element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Dashboards */}
          <Route path="/dashboard/supplier"
            element={<PrivateRoute roles={['supplier','admin']}><SupplierDashboard /></PrivateRoute>} />
          <Route path="/dashboard/supplier/products/new"
            element={<PrivateRoute roles={['supplier','admin']}><ProductFormPage /></PrivateRoute>} />
          <Route path="/dashboard/supplier/products/:id/edit"
            element={<PrivateRoute roles={['supplier','admin']}><ProductFormPage /></PrivateRoute>} />
          <Route path="/dashboard/dropshipper"
            element={<PrivateRoute roles={['dropshipper']}><DropshipperDashboard /></PrivateRoute>} />
          <Route path="/dashboard/admin"
            element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 800, lineHeight: 1, color: 'var(--border-bright)' }}>404</div>
              <p style={{ marginTop: 16 }}>Сторінку не знайдено</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
