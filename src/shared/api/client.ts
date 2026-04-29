import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '../auth/tokenStore';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
  __isRetryAfterRefresh?: boolean;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const shouldAttachPlatformContext = (url?: string): boolean => {
  if (!url) return false;
  return (
    url.startsWith('/platform') ||
    url === '/auth/login' ||
    url === '/auth/refresh' ||
    url === '/auth/logout' ||
    url === '/auth/bootstrap'
  );
};

const redirectToLogin = () => {
  tokenStore.removeToken();
  window.location.href = '/login';
};

// Retry logic with exponential backoff for idempotent requests only.
const retryRequest = (error: AxiosError): Promise<unknown> => {
  const config = error.config as RetryableRequestConfig | undefined;
  const maxRetries = 3;
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const method = (config?.method || 'get').toUpperCase();
  const shouldRetry =
    ['GET', 'HEAD', 'OPTIONS'].includes(method) &&
    error.response &&
    retryableStatuses.includes(error.response.status) &&
    config;

  if (shouldRetry) {
    config.__retryCount = (config.__retryCount || 0) + 1;
    if (config.__retryCount > maxRetries) {
      return Promise.reject(error);
    }

    const delay = Math.pow(2, config.__retryCount - 1) * 1000;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(apiClient.request(config));
      }, delay);
    });
  }

  return Promise.reject(error);
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.getToken();
    config.headers = config.headers ?? {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (shouldAttachPlatformContext(config.url) && !config.headers['X-Company-Id']) {
      config.headers['X-Company-Id'] = 'platform';
    }

    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.__isRetryAfterRefresh &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/accept-invite'
    ) {
      const refreshToken = tokenStore.getRefreshToken();

      if (!refreshToken) {
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await refreshClient.post('/auth/refresh', { refreshToken }, {
          headers: { 'X-Company-Id': 'platform' },
        });

        tokenStore.setTokens(
          refreshResponse.data.accessToken,
          refreshResponse.data.refreshToken,
        );

        originalRequest.__isRetryAfterRefresh = true;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;

        return apiClient.request(originalRequest);
      } catch (refreshError) {
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return retryRequest(error);
  }
);

export default apiClient;
