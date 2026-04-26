import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Retry logic with exponential backoff
const retryRequest = (error: any, retryCount: number = 0): Promise<any> => {
  const maxRetries = 3;
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const shouldRetry =
    retryCount < maxRetries &&
    error.response &&
    retryableStatuses.includes(error.response.status);

  if (shouldRetry) {
    const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
    return new Promise((resolve) => {
      setTimeout(() => {
        if (error.config) {
          resolve(apiClient.request(error.config));
        }
      }, delay);
    });
  }

  return Promise.reject(error);
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  async (error) => {
    if (import.meta.env.DEV) {
      console.error('[API Response Error]', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry logic for retryable errors
    return retryRequest(error);
  }
);

export default apiClient;
