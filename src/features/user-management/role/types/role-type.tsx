import type { ActionData } from '@/lib/services/action-service';

export interface Role extends ActionData {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface RoleListParams {
  page?: number;
  limit?: number;
  search?: string;
  search_by?: string;
  sort_by?: string;
  sort?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
}

export interface RoleListResponse {
  data: Role[];
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

export interface RoleDetailResponse {
  data: Role;
  status: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export interface CreateRoleResponse {
  data: Role;
  status: string;
}

export interface UpdateRoleResponse {
  data: Role;
  status: string;
}

export interface DeleteRoleResponse {
  message: string;
  status: string;
}

// Access Management Types
export interface ActionType {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MenuAction {
  id: number;
  name: string;
  is_active: boolean;
  allowed: boolean;
  action_type: ActionType;
  created_at: string;
  updated_at: string;
}

export interface MenuWithAccess {
  id: number;
  parent_id: number | null;
  name: string;
  code: string;
  url_path: string;
  icon: string;
  order_no: number;
  is_active: boolean;
  actions: MenuAction[];
  created_at: string;
  updated_at: string;
  children?: MenuWithAccess[];
}

export interface AccessManagementResponse {
  data: MenuWithAccess[];
  status: string;
}

export interface UpdateAccessManagementRequest {
  role_id: number;
  menu_action_ids: number[];
}

export interface UpdateAccessManagementResponse {
  message: string;
  status: string;
}
