import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyTokenResponse,
  GenericResponse,
} from '../types/auth-type';
import { ApiError, extractErrorMessage } from '@/lib/errors/api-error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Extract error message from backend response format {"error": "message"}
        const errorMessage = extractErrorMessage(errorData, `HTTP ${response.status}: ${response.statusText}`);

        throw new ApiError(
          errorMessage,
          response.status,
          errorData.code || errorData.error_code,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw ApiError instances
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async refreshToken(token: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async logout(token: string): Promise<void> {
    try {
      return this.makeRequest<void>('/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: unknown) {
      // If logout endpoint doesn't exist (404), that's OK - treat as successful
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        console.warn(
          'Logout endpoint not found (404) - treating as successful logout'
        );
        return;
      }
      // Re-throw other errors
      throw error;
    }
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<GenericResponse> {
    return this.makeRequest<GenericResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async validateToken(token: string): Promise<VerifyTokenResponse> {
    return this.makeRequest<VerifyTokenResponse>(`/auth/reset-password/validate?token=${token}`, {
      method: 'GET',
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<GenericResponse> {
    return this.makeRequest<GenericResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const authService = new AuthService();
