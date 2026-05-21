import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../common/Spinner';

export function PrivateRoute({ children, roles }) {
  const { isLoggedIn, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;

  return children;
}
