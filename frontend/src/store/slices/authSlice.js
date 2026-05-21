import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/services';
import { resetCart } from './cartSlice';

export const loginThunk = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerThunk = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    await authApi.register(payload);
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try { await authApi.logout(); } catch { /* ignore */ }
  localStorage.removeItem('accessToken');
  // Clear cart from store immediately on logout
  dispatch(resetCart());
});

export const refreshThunk = createAsyncThunk('auth/refresh', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authApi.refresh();
    localStorage.setItem('accessToken', data.accessToken);
    return data.user;
  } catch {
    localStorage.removeItem('accessToken');
    return rejectWithValue(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isLoading: true, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending,    (s) => { s.isLoading = true;  s.error = null; })
      .addCase(loginThunk.fulfilled,  (s, { payload }) => { s.isLoading = false; s.user = payload; })
      .addCase(loginThunk.rejected,   (s, { payload }) => { s.isLoading = false; s.error = payload; })

      .addCase(registerThunk.pending,   (s) => { s.isLoading = true;  s.error = null; })
      .addCase(registerThunk.fulfilled, (s) => { s.isLoading = false; })
      .addCase(registerThunk.rejected,  (s, { payload }) => { s.isLoading = false; s.error = payload; })

      .addCase(logoutThunk.fulfilled, (s) => { s.user = null; })

      .addCase(refreshThunk.pending,   (s) => { s.isLoading = true; })
      .addCase(refreshThunk.fulfilled, (s, { payload }) => { s.isLoading = false; s.user = payload; })
      .addCase(refreshThunk.rejected,  (s) => { s.isLoading = false; s.user = null; });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
