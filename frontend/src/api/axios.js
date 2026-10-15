import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3005';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies cross-origin
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — try refresh once, then redirect to login
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// На цих ендпоінтах 401 означає "неправильний пароль / неправильні дані",
// а НЕ "сесія протухла". Спроба оновити токен тут безглузда: refresh
// усе одно впаде, і користувач побачить помилку від refresh замість
// нормальної "Invalid email or password".
const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/activate',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const shouldSkipRefresh = (url = '') =>
  url.includes('/auth/refresh') ||
  AUTH_ENDPOINTS.some((path) => url.includes(path));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (shouldSkipRefresh(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.get('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        processQueue(error, null);
        localStorage.removeItem('accessToken');
        // Повертаємо ПОЧАТКОВУ помилку, а не помилку refresh.
        // Раніше тут reject-илась помилка від refresh, тож користувач
        // бачив "Refresh token is missing" замість реальної причини.
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
