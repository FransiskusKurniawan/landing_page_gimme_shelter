export interface AuditLog {
    id: number;
    user_id: number;
    username: string;
    action: string;
    entity: string;
    entity_id: number | null;
    before_data: string | null;
    after_data: string | null;
    created_at: string;
}

export interface AuditLogStatsData {
    total_logs: number;
    logs_today: number;
    entity_counts: {
        Entity: string;
        Count: number;
    }[];
    action_counts: {
        Action: string;
        Count: number;
    }[];
}

export interface AuditLogParams {
    page?: number;
    limit?: number;
    search?: string;
    search_by?: string;
    start_date?: string;
    end_date?: string;
    sort_by?: string;
    sort?: 'asc' | 'desc';
}

export interface AuditLogListResponse {
    data: AuditLog[];
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

export interface AuditLogStatsResponse {
    data: AuditLogStatsData;
    status: string;
}
