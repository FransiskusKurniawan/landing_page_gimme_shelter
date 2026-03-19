import {
  RoleListParams,
  RoleListResponse,
  RoleDetailResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateRoleResponse,
  UpdateRoleResponse,
  DeleteRoleResponse,
  AccessManagementResponse,
  UpdateAccessManagementRequest,
  UpdateAccessManagementResponse,
} from '../types/role-type';
import { GlobalErrorHandler } from '@/lib/errors';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class RoleService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

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
          `Role API: ${options.method || 'GET'} ${endpoint}`
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
        `Role API: Unexpected error in ${endpoint}`
      );
    }
  }

  private buildQueryString(params: RoleListParams): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getRoles(
    params: RoleListParams,
    token: string
  ): Promise<RoleListResponse> {
    const queryString = this.buildQueryString(params);
    return this.makeRequest<RoleListResponse>(
      `/user-management/roles${queryString}`,
      {
        method: 'GET',
      },
      token
    );
  }

  async getRoleById(id: number, token: string): Promise<RoleDetailResponse> {
    return this.makeRequest<RoleDetailResponse>(
      `/user-management/roles/${id}`,
      {
        method: 'GET',
      },
      token
    );
  }

  async createRole(
    data: CreateRoleRequest,
    token: string
  ): Promise<CreateRoleResponse> {
    return this.makeRequest<CreateRoleResponse>(
      '/user-management/roles',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async updateRole(
    id: number,
    data: UpdateRoleRequest,
    token: string
  ): Promise<UpdateRoleResponse> {
    return this.makeRequest<UpdateRoleResponse>(
      `/user-management/roles/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async deleteRole(id: number, token: string): Promise<DeleteRoleResponse> {
    return this.makeRequest<DeleteRoleResponse>(
      `/user-management/roles/${id}`,
      {
        method: 'DELETE',
      },
      token
    );
  }

  async getAccessManagement(
    roleId: number,
    token: string
  ): Promise<AccessManagementResponse> {
    return this.makeRequest<AccessManagementResponse>(
      `/user-management/management-access/${roleId}`,
      {
        method: 'GET',
      },
      token
    );
  }

  async updateAccessManagement(
    data: UpdateAccessManagementRequest,
    token: string
  ): Promise<UpdateAccessManagementResponse> {
    return this.makeRequest<UpdateAccessManagementResponse>(
      '/user-management/management-access',
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  }
}

export const roleService = new RoleService();
