import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../api/services';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await cartApi.getCart(); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async ({ productId, quantity = 1 }, { dispatch }) => {
  await cartApi.addItem({ productId, quantity });
  dispatch(fetchCart());
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { dispatch }) => {
  await cartApi.updateItem(itemId, quantity);
  dispatch(fetchCart());
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { dispatch }) => {
  await cartApi.removeItem(itemId);
  dispatch(fetchCart());
});

export const clearCartThunk = createAsyncThunk('cart/clear', async (_, { dispatch }) => {
  await cartApi.clearCart();
  dispatch(fetchCart());
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cart: null, isLoading: false },
  reducers: {
    // Reset cart to empty immediately (used on logout)
    resetCart: (state) => { state.cart = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending,   (s) => { s.isLoading = true; })
      .addCase(fetchCart.fulfilled, (s, { payload }) => { s.cart = payload; s.isLoading = false; })
      .addCase(fetchCart.rejected,  (s) => { s.isLoading = false; });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
