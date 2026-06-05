import { api } from './axios';

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  activate: (token) => api.get(`/auth/activate/${token}`),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.get('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ── Users ─────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

// ── Products ──────────────────────────────────────────
export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getMine: () => api.get('/products/my/list'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
};

// ── Categories ────────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

// ── Orders ────────────────────────────────────────────
export const orderApi = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
};

// ── Cart ──────────────────────────────────────────────
export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// ── Analytics ─────────────────────────────────────────
export const analyticsApi = {
  getStats: () => api.get('/analytics/stats'),
};

// ── Admin ─────────────────────────────────────────────
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingDropshippers: () => api.get('/admin/dropshippers/pending'),
  reviewDropshipper: (userId, status) =>
    api.patch(`/admin/dropshippers/${userId}/review`, { status }),
};
