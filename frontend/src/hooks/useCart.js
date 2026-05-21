import { useSelector, useDispatch } from 'react-redux';
import { addToCart, updateCartItem, removeCartItem, clearCartThunk } from '../store/slices/cartSlice';

export function useCart() {
  const { cart, isLoading } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const items = cart?.items || [];
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + Number(i.product?.retailPrice || 0) * i.quantity, 0);
  return {
    cart, items, isLoading, totalItems, totalPrice,
    addItem: (productId, quantity) => dispatch(addToCart({ productId, quantity })),
    updateItem: (itemId, quantity) => dispatch(updateCartItem({ itemId, quantity })),
    removeItem: (itemId) => dispatch(removeCartItem(itemId)),
    clearCart: () => dispatch(clearCartThunk()),
  };
}
