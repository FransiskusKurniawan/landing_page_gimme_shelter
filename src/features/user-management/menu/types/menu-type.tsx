import type { ActionData } from '@/lib/services/action-service';

export interface Menu extends ActionData {
  id: number;
  parent_id: number | null;
  name: string;
  code: string;
  url_path: string;
  icon: string;
  order_no: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuListParams {
  page?: number;
  limit?: number;
  search?: string;
  search_by?: string;
  sort_by?: string;
  sort?: 'asc' | 'desc';
  start_date?: string;
  end_date?: string;
}

export interface MenuListResponse {
  data: Menu[];
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

export interface MenuDetailResponse {
  data: Menu;
  status: string;
}

export interface MenuAddResponse {
  data: Menu[];
  status: string;
}

export interface CreateMenuRequest {
  name: string;
  code: string;
  url_path: string;
  icon: string;
  order_no: number;
  is_active: boolean;
  parent_id?: number | null;
}

export interface UpdateMenuRequest {
  name?: string;
  code?: string;
  url_path?: string;
  icon?: string;
  order_no?: number;
  is_active?: boolean;
  parent_id?: number | null;
}

export interface CreateMenuResponse {
  data: Menu;
  message: string;
  status: string;
}

export interface UpdateMenuResponse {
  data: Menu;
  message: string;
  status: string;
}

export interface DeleteMenuResponse {
  message: string;
  status: string;
}
