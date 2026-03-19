import {
  UpdateProfileRequest,
  UpdateProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '../types/profile-type';
import { ApiError, extractErrorMessage } from '@/lib/errors/api-error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class ProfileService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Only add Content-Type if not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const errorMessage = extractErrorMessage(
          errorData,
          `HTTP ${response.status}: ${response.statusText}`
        );

        const apiError = new ApiError(
          errorMessage,
          response.status,
          errorData.code || errorData.error_code,
          errorData
        );

        // Mark expected errors (400, 401, 404) as "digest" to prevent Next.js error overlay
        // This is the same approach Next.js uses internally for expected errors
        if (response.status === 400 || response.status === 401 || response.status === 404) {
          (apiError as any).digest = `${response.status}`;
        }

        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  async updateProfile(
    data: UpdateProfileRequest,
    token: string
  ): Promise<UpdateProfileResponse> {
    const formData = new FormData();
    
    // Only append name if it's provided and not empty
    if (data.name) {
      formData.append('name', data.name);
    }

    if (data.photo_profile) {
      formData.append('photo_profile', data.photo_profile);
    }

    return this.makeRequest<UpdateProfileResponse>(
      '/auth/profile',
      {
        method: 'PUT',
        body: formData,
      },
      token
    );
  }

  async changePassword(
    data: ChangePasswordRequest,
    token: string
  ): Promise<ChangePasswordResponse> {
    return this.makeRequest<ChangePasswordResponse>(
      '/auth/change-password',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      token
    );
  }
}

export const profileService = new ProfileService();

