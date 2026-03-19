import {
  UserListParams,
  UserListResponse,
  UserDetailResponse,
  UserAddResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateUserResponse,
  UpdateUserResponse,
  DeleteUserResponse,
} from '../types/user-type';
import { GlobalErrorHandler } from '@/lib/errors';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class UserService {
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

        throw GlobalErrorHandler.handleApiError(
          errorData,
          response.status,
          true,
          `User API: ${options.method || 'GET'} ${endpoint}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'ApiError') {
        throw error;
      }

      throw GlobalErrorHandler.handleApiError(
        error,
        undefined,
        true,
        `User API: Unexpected error in ${endpoint}`
      );
    }
  }

  private buildQueryString(params: UserListParams): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      // Skip if value is undefined, null, or empty string
      // This allows search_by to be omitted when set to undefined
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getUsers(
    params: UserListParams,
    token: string
  ): Promise<UserListResponse> {
    const queryString = this.buildQueryString(params);
    return this.makeRequest<UserListResponse>(
      `/user-management/users${queryString}`,
      {
        method: 'GET',
      },
      token
    );
  }

  async getUserById(id: number, token: string): Promise<UserDetailResponse> {
    return this.makeRequest<UserDetailResponse>(
      `/user-management/users/${id}`,
      {
        method: 'GET',
      },
      token
    );
  }

  async getUserAddData(token: string): Promise<UserAddResponse> {
    return this.makeRequest<UserAddResponse>(
      '/user-management/users/add',
      {
        method: 'GET',
      },
      token
    );
  }

  async createUser(
    data: CreateUserRequest,
    token: string
  ): Promise<CreateUserResponse> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('name', data.name);
    formData.append('password', data.password);
    formData.append('email', data.email);

    // Append role_ids as comma-separated string
    formData.append('role_ids', data.role_ids.join(','));

    if (data.photo_profile) {
      formData.append('photo_profile', data.photo_profile);
    }

    return this.makeRequest<CreateUserResponse>(
      '/user-management/users',
      {
        method: 'POST',
        body: formData,
      },
      token
    );
  }

  async updateUser(
    id: number,
    data: UpdateUserRequest,
    token: string
  ): Promise<UpdateUserResponse> {
    const formData = new FormData();

    if (data.username) formData.append('username', data.username);
    if (data.name) formData.append('name', data.name);
    if (data.password) formData.append('password', data.password);
    if (data.email) formData.append('email', data.email);

    if (data.role_ids && data.role_ids.length > 0) {
      // Append role_ids as comma-separated string
      formData.append('role_ids', data.role_ids.join(','));
    }

    if (data.photo_profile) {
      formData.append('photo_profile', data.photo_profile);
    }

    return this.makeRequest<UpdateUserResponse>(
      `/user-management/users/${id}`,
      {
        method: 'PUT',
        body: formData,
      },
      token
    );
  }

  async deleteUser(id: number, token: string): Promise<DeleteUserResponse> {
    return this.makeRequest<DeleteUserResponse>(
      `/user-management/users/${id}`,
      {
        method: 'DELETE',
      },
      token
    );
  }
}

export const userService = new UserService();
