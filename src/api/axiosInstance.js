import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let store;
export function injectStore(_store) {
  store = _store;
}

const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

axiosInstance.interceptors.request.use((config) => {
  const token = store?.getState()?.auth?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const skipRefresh = NO_REFRESH_PATHS.some((path) => originalRequest.url?.includes(path));

    if (status === 401 && !originalRequest._retry && !skipRefresh) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axiosInstance.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }
        const { data } = await refreshPromise;
        store.dispatch({ type: 'auth/setCredentials', payload: data.data });
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch({ type: 'auth/sessionExpired' });
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
