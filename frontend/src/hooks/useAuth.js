import { useSelector } from 'react-redux';

export function useAuth() {
  const { user, isLoading } = useSelector((s) => s.auth);
  return {
    user, isLoading,
    isLoggedIn: !!user,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isSupplier: user?.role === 'supplier',
    isDropshipper: user?.role === 'dropshipper',
    isCustomer: user?.role === 'customer',
  };
}
