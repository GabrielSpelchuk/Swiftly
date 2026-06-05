import { useSelector } from 'react-redux';

export function useAuth() {
  const { user, isLoading } = useSelector((s) => s.auth);
  const isDropshipper = user?.role === 'dropshipper';
  const isApprovedDropshipper = isDropshipper && user?.isApproved !== false;

  return {
    user, isLoading,
    isLoggedIn: !!user,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isSupplier: user?.role === 'supplier',
    isDropshipper,
    isApprovedDropshipper,
    isPendingDropshipper: isDropshipper && user?.isApproved === false,
    isCustomer: user?.role === 'customer',
  };
}
