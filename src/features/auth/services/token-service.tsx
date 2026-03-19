import { User } from '../types/auth-type';

const TOKEN_KEY = 'device_monitoring_auth_token';
const USER_KEY = 'device_monitoring_user_data';

class TokenService {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Check if auth token exists in cookies
   */
  hasTokenInCookies(): boolean {
    if (typeof document === 'undefined') return false;
    const cookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith(`${TOKEN_KEY}=`));

    if (!cookie) {
      return false;
    }

    // Check if the cookie has a value after the '='
    const value = cookie.split('=')[1];
    return value !== undefined && value.trim() !== '';
  }

  /**
   * Get token from cookies (for client-side validation)
   */
  getTokenFromCookies(): string | null {
    if (typeof document === 'undefined') return null;
    const cookie = document.cookie
      .split(';')
      .find(c => c.trim().startsWith(`${TOKEN_KEY}=`));
    return cookie ? cookie.split('=')[1] || null : null;
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;

    // Store in localStorage first
    localStorage.setItem(TOKEN_KEY, token);

    // Also set cookie for middleware with proper expiration
    const maxAge = this.getTokenExpiration(token) || 7 * 24 * 60 * 60; // 7 days default
    const cookieString = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; samesite=lax`;
    document.cookie = cookieString;
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);

    // Remove cookie with all possible paths and domains
    const cookieOptions = [
      `${TOKEN_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      `${TOKEN_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`,
      `${TOKEN_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`,
      `${TOKEN_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict`,
    ];

    cookieOptions.forEach(option => {
      document.cookie = option;
    });
  }

  getUserData(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setUserData(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  removeUserData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  }

  getUserDataFromToken(token: string): User | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;

      const payload = JSON.parse(atob(parts[1]));
      // Assuming the payload contains the user object, or the user object can be derived from it.
      // This might need adjustment based on the actual JWT structure.
      return payload as User;
    } catch {
      return null;
    }
  }

  clearAll(): void {
    this.removeToken();
    this.removeUserData();
  }

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return true;

      const payload = JSON.parse(atob(parts[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getTokenExpiration(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;

      const payload = JSON.parse(atob(parts[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      return Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
    } catch {
      return null;
    }
  }
}

export const tokenService = new TokenService();
