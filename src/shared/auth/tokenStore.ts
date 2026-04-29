const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// NOTE: Browser storage is still readable by JavaScript. httpOnly cookies would be stronger,
// but sessionStorage reduces persistence compared with localStorage for this admin app.
const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = '__sessionStorage_test__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const getLegacyLocalStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const removeLegacyLocalStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore legacy cleanup failures.
  }
};

export const tokenStore = {
  getToken(): string | null {
    if (!isSessionStorageAvailable()) return null;
    try {
      const sessionToken = sessionStorage.getItem(TOKEN_KEY);
      if (sessionToken) return sessionToken;

      const legacyToken = getLegacyLocalStorageItem(TOKEN_KEY);
      if (legacyToken) {
        sessionStorage.setItem(TOKEN_KEY, legacyToken);
        removeLegacyLocalStorageItem(TOKEN_KEY);
      }

      return legacyToken;
    } catch (error) {
      console.error('Error reading access token from sessionStorage:', error);
      return null;
    }
  },

  getRefreshToken(): string | null {
    if (!isSessionStorageAvailable()) return null;
    try {
      const sessionToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
      if (sessionToken) return sessionToken;

      const legacyToken = getLegacyLocalStorageItem(REFRESH_TOKEN_KEY);
      if (legacyToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, legacyToken);
        removeLegacyLocalStorageItem(REFRESH_TOKEN_KEY);
      }

      return legacyToken;
    } catch (error) {
      console.error('Error reading refresh token from sessionStorage:', error);
      return null;
    }
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    if (!isSessionStorageAvailable()) {
      console.warn('sessionStorage is not available');
      return;
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Error saving tokens to sessionStorage:', error);
    }
  },

  removeToken(): void {
    if (!isSessionStorageAvailable()) return;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      removeLegacyLocalStorageItem(TOKEN_KEY);
      removeLegacyLocalStorageItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing tokens from sessionStorage:', error);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
