import { MenuResponse } from '../types/menu-type';
import { ApiError, extractErrorMessage } from '@/lib/errors/api-error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class MenuService {
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
        const errorMessage = extractErrorMessage(
          errorData,
          `HTTP ${response.status}: ${response.statusText}`
        );

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

  async getMenus(token: string): Promise<MenuResponse> {
    return this.makeRequest<MenuResponse>('/auth/menus', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const menuService = new MenuService();
