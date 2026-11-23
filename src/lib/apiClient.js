import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

const AUTH_STORAGE_KEY = 'auth_tokens';

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

export const getStoredTokens = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredTokens = (tokens) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
};

export const clearStoredTokens = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

const getErrorMessage = (error) => {
  const data = error.response?.data;
  if (data?.message) return data.message;
  if (typeof data?.error === 'string') return data.error;
  return error.message || 'Request failed';
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Auth uses Bearer tokens in localStorage, not cookies.
  // withCredentials + CORS * blocks browser requests (Postman still works).
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const { status, data } = response;

    if (status === 200 || status === 201) {
      return data;
    }

    return Promise.reject(new Error(data?.message || 'Unexpected response'));
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthRoute = originalRequest.url?.includes('/auth/login')
        || originalRequest.url?.includes('/auth/register')
        || originalRequest.url?.includes('/auth/refresh');

      if (isAuthRoute) {
        const apiError = new Error(getErrorMessage(error));
        apiError.status = status;
        apiError.data = error.response?.data;
        return Promise.reject(apiError);
      }

      const tokens = getStoredTokens();

      if (tokens?.refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken: tokens.refreshToken },
            { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
          );

          const payload = refreshResponse.data?.data || refreshResponse.data;
          const newAccessToken = payload?.accessToken;
          const newRefreshToken = payload?.refreshToken || tokens.refreshToken;

          if (newAccessToken) {
            setStoredTokens({
              ...tokens,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            });
            onTokenRefreshed(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          clearStoredTokens();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
            window.location.href = `${import.meta.env.BASE_URL}signin`;
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      clearStoredTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
        window.location.href = `${import.meta.env.BASE_URL}signin`;
      }
    }

    const apiError = new Error(getErrorMessage(error));
    apiError.status = status;
    apiError.code = error.response?.data?.error_code;
    apiError.data = error.response?.data;

    switch (status) {
      case 400:
        apiError.type = 'validation';
        break;
      case 403:
        apiError.type = 'forbidden';
        break;
      case 404:
        apiError.type = 'not_found';
        break;
      case 409:
        apiError.type = 'conflict';
        break;
      case 429:
        apiError.type = 'rate_limit';
        break;
      case 500:
        apiError.type = 'server';
        break;
      default:
        apiError.type = 'unknown';
    }

    return Promise.reject(apiError);
  },
);

export default apiClient;
