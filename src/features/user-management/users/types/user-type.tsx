export interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

import type { ActionData } from '@/lib/services/action-service';

export interface User extends ActionData {
  id: number;
  username: string;
  name: string;
  email: string;
  photo_profile: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  search_by?: string;
  sort_by?: string;
  sort?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
    search?: {
      search: string;
      search_by: string;
    };
    sort?: {
      sort_by: string;
      sort_order: string;
    };
    date_range?: Record<string, unknown>;
    searchable_columns: {
      string_columns: string[];
    };
    sortable_columns: {
      available_fields: string[];
    };
  };
  status: string;
}

export interface UserDetailResponse {
  data: User;
  status: string;
}

export interface UserAddResponse {
  data: {
    roles: Role[];
  };
  status: string;
}

export interface CreateUserRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  role_ids: number[];
  photo_profile?: File;
}

export interface UpdateUserRequest {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  role_ids?: number[];
  photo_profile?: File;
}

export interface CreateUserResponse {
  data: User;
  message: string;
  status: string;
}

export interface UpdateUserResponse {
  data: User;
  message: string;
  status: string;
}

export interface DeleteUserResponse {
  message: string;
  status: string;
}
