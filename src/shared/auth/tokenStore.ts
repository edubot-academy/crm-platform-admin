const TOKEN_KEY = 'auth_token';

// NOTE: localStorage is vulnerable to XSS attacks. For production, consider using httpOnly cookies
// or a secure storage mechanism. This implementation includes error handling for private browsing mode.
const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

export const tokenStore = {
  getToken(): string | null {
    if (!isLocalStorageAvailable()) return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  },

  setToken(token: string): void {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage is not available');
      return;
    }
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  },

  removeToken(): void {
    if (!isLocalStorageAvailable()) return;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
