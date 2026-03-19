import {
  MenuListParams,
  MenuListResponse,
  MenuDetailResponse,
  MenuAddResponse,
  CreateMenuRequest,
  UpdateMenuRequest,
  CreateMenuResponse,
  UpdateMenuResponse,
  DeleteMenuResponse,
} from '../types/menu-type';
import { GlobalErrorHandler } from '@/lib/errors';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class MenuService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

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
          `Menu API: ${options.method || 'GET'} ${endpoint}`
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
        `Menu API: Unexpected error in ${endpoint}`
      );
    }
  }

  private buildQueryString(params: MenuListParams): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  async getMenus(
    params: MenuListParams,
    token: string
  ): Promise<MenuListResponse> {
    const queryString = this.buildQueryString(params);
    return this.makeRequest<MenuListResponse>(
      `/user-management/menus${queryString}`,
      {
        method: 'GET',
      },
      token
    );
  }

  async getMenuById(id: number, token: string): Promise<MenuDetailResponse> {
    return this.makeRequest<MenuDetailResponse>(
      `/user-management/menus/${id}`,
      {
        method: 'GET',
      },
      token
    );
  }

  async getMenuAddData(token: string): Promise<MenuAddResponse> {
    return this.makeRequest<MenuAddResponse>(
      '/user-management/menus/add',
      {
        method: 'GET',
      },
      token
    );
  }

  async createMenu(
    data: CreateMenuRequest,
    token: string
  ): Promise<CreateMenuResponse> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('code', data.code || '');
    formData.append('url_path', data.url_path || '');
    formData.append('icon', data.icon || '');
    formData.append('order_no', data.order_no.toString());
    formData.append('is_active', data.is_active.toString());
    
    if (data.parent_id !== null && data.parent_id !== undefined) {
      formData.append('parent_id', data.parent_id.toString());
    }

    return this.makeRequest<CreateMenuResponse>(
      '/user-management/menus',
      {
        method: 'POST',
        body: formData,
        headers: {},
      },
      token
    );
  }

  async updateMenu(
    id: number,
    data: UpdateMenuRequest,
    token: string
  ): Promise<UpdateMenuResponse> {
    return this.makeRequest<UpdateMenuResponse>(
      `/user-management/menus/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async deleteMenu(id: number, token: string): Promise<DeleteMenuResponse> {
    return this.makeRequest<DeleteMenuResponse>(
      `/user-management/menus/${id}`,
      {
        method: 'DELETE',
      },
      token
    );
  }
}

export const menuService = new MenuService();
