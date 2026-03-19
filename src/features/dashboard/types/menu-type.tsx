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

export interface MenuItem {
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
  children?: MenuItem[];
}

export interface MenuResponse {
  data: MenuItem[];
}

export interface MenuState {
  menus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  // Optional metadata for caching/invalidation
  _lastFetchedAt?: number;
  _isStale?: boolean;
}
