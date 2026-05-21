import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let refreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(() => api(original));
      }

      original._retry = true;
      refreshing = true;

      try {
        const { data } = await axios.get(`${API_URL}/auth/refresh`, { withCredentials: true });
        localStorage.setItem('accessToken', data.accessToken);

        queue.forEach(({ resolve }) => resolve());
        queue = [];

        return api(original);
      } catch {
        queue.forEach(({ reject }) => reject());
        queue = [];
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } finally {
        refreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
