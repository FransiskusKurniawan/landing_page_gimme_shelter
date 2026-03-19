import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginRequest, RegisterRequest } from '../types/auth-type';
import { authService, tokenService } from '../services';
import { ApiErrorHandler } from '@/lib/errors';

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: (skipApiCall?: boolean) => Promise<void>;
  refreshToken: () => Promise<{ token: string; user: User } | void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => void;
  forceLogout: () => void;
}

// Initialize auth state synchronously before store creation
const initializeAuthStateSync = () => {
  // SSR-safe: Only run on client-side
  const isClient = !!(
    typeof globalThis !== 'undefined' &&
    globalThis.window?.document?.createElement
  );

  if (!isClient) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  try {
    const tokenFromCookie = tokenService.getTokenFromCookies();
    if (tokenFromCookie && !tokenService.isTokenExpired(tokenFromCookie)) {
      const user = tokenService.getUserData();
      return {
        user,
        token: tokenFromCookie,
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch (error) {
    // Silent fail - return logged out state
    console.warn('Auth initialization failed:', error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

const initialAuthState = initializeAuthStateSync();

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State - initialized synchronously
      user: initialAuthState.user,
      token: initialAuthState.token,
      isAuthenticated: initialAuthState.isAuthenticated,
      isLoading: initialAuthState.isLoading,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);
          const { token, user } = response.data;

          // Store in localStorage and cookies
          tokenService.setToken(token);
          tokenService.setUserData(user);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const appError = ApiErrorHandler.handleAuth(error, {
            fallbackMessage: 'Login failed',
            context: { module: 'auth-store', action: 'login' },
          });

          set({
            isLoading: false,
            error: appError.message,
            isAuthenticated: false,
          });

          // Don't re-throw - error is already set in state for UI display
          // This prevents Next.js error overlay from showing
        }
      },

      register: async (credentials: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(credentials);
          const { token, user } = response.data;

          // Store in localStorage and cookies
          tokenService.setToken(token);
          tokenService.setUserData(user);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const appError = ApiErrorHandler.handleAuth(error, {
            fallbackMessage: 'Registration failed',
            context: { module: 'auth-store', action: 'register' },
          });

          set({
            isLoading: false,
            error: appError.message,
            isAuthenticated: false,
          });

          // Don't re-throw - error is already set in state for UI display
          // This prevents Next.js error overlay from showing
        }
      },

      logout: async (skipApiCall = false) => {
        const { token } = get();

        // Skip API call if explicitly requested (e.g., after manual cookie deletion)
        if (!skipApiCall) {
          try {
            if (token) {
              await authService.logout(token);
            }
          } catch (error) {
            // Handle logout error with proper error handler
            ApiErrorHandler.handleSilent(error, {
              fallbackMessage: 'Error during logout',
              context: { module: 'auth-store', action: 'logout' },
            });
            // Don't throw - logout should always succeed on client
          }
        }

        // Always clear storage and state regardless of server response
        tokenService.clearAll();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Immediately redirect to login page after logout
        if (globalThis.window !== undefined) {
          globalThis.window.location.href = '/auth/login';
        }
      },

      refreshToken: async () => {
        const { token } = get();

        if (!token) {
          const error = new Error('No token available');
          ApiErrorHandler.handleAuth(error, {
            fallbackMessage: 'Token refresh failed',
            context: { module: 'auth-store', action: 'refreshToken' },
          });
          throw error;
        }

        try {
          const response = await authService.refreshToken(token);
          const { token: newToken, user } = response.data;

          tokenService.setToken(newToken);
          tokenService.setUserData(user);

          set({
            user,
            token: newToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { token: newToken, user };
        } catch (error) {
          const appError = ApiErrorHandler.handleAuth(error, {
            fallbackMessage: 'Token refresh failed',
            context: { module: 'auth-store', action: 'refreshToken' },
          });

          // If refresh fails, logout user
          tokenService.clearAll();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: appError.message,
          });

          throw appError;
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        // Re-sync auth state (lightweight operation)
        // This is now instant since we initialized synchronously
        try {
          const tokenFromStorage = tokenService.getToken();
          const tokenFromCookie = tokenService.getTokenFromCookies();

          if (tokenFromCookie && !tokenService.isTokenExpired(tokenFromCookie)) {
            // If localStorage is out of sync, update it
            if (tokenFromStorage !== tokenFromCookie) {
              const user = tokenService.getUserDataFromToken(tokenFromCookie);
              tokenService.setToken(tokenFromCookie);
              if (user) tokenService.setUserData(user);
            }
            const user = tokenService.getUserData();
            set({ user, token: tokenFromCookie, isAuthenticated: true, isLoading: false });
          } else {
            // No valid cookie found
            if (tokenFromStorage) {
              tokenService.clearAll();
            }
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          // On any error, ensure logged out state
          tokenService.clearAll();
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      forceLogout: () => {
        // Emergency logout - clear everything without API call
        tokenService.clearAll();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });

        // Force page reload to clear any cached state
        if (globalThis.window !== undefined) {
          globalThis.window.location.href = '/auth/login';
        }
      },
    }),
    {
      name: 'device-monitoring-auth-storage',
      partialize: state => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
