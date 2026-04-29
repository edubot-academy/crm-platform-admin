import apiClient from '../api/client';
import { tokenStore } from './tokenStore';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  return { valid: true };
}

export interface JWTPayload {
  sub: string;
  id?: number;
  email: string;
  role: string;
  companyId?: string | null;
  tenantId?: string | null;
  iat?: number;
  exp?: number;
}

// Simple JWT decoder for basic frontend checks
// NOTE: This does not verify the JWT signature. For production, implement proper JWT verification
// using a library like 'jose' and verify against the backend's public key or use httpOnly cookies
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse & { user: JWTPayload | null }> {
    if (!validateEmail(credentials.email)) {
      throw new Error('Invalid email format');
    }

    const passwordValidation = validatePassword(credentials.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error || 'Invalid password');
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', credentials, {
      headers: { 'X-Company-Id': 'platform' },
    });
    tokenStore.setTokens(response.data.accessToken, response.data.refreshToken);

    // Decode user info from JWT
    const user = decodeJWT(response.data.accessToken);

    return {
      ...response.data,
      user,
    };
  },

  async logout(): Promise<void> {
    const user = this.getCurrentUser();
    const companyId = user?.tenantId ? String(user.tenantId) : 'platform';

    try {
      await apiClient.post('/auth/logout', undefined, {
        headers: { 'X-Company-Id': companyId },
      });
    } catch {
      // Local logout should still succeed even if the backend token revoke fails.
    } finally {
      tokenStore.removeToken();
    }
  },

  getCurrentUser(): JWTPayload | null {
    const token = tokenStore.getToken();
    if (!token) return null;
    return decodeJWT(token);
  },

  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    return (
      user?.role === 'superadmin' &&
      (!user.tenantId || user.tenantId === null) &&
      (!user.companyId || user.companyId === null)
    );
  },
};
