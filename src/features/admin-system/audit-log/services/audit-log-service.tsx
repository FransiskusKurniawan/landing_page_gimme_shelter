import {
    AuditLogParams,
    AuditLogListResponse,
    AuditLogStatsResponse,
} from '../types/audit-log-type';
import { GlobalErrorHandler } from '@/lib/errors';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

class AuditLogService {
    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        token?: string
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const headers: Record<string, string> = {
            ...options.headers as Record<string, string>,
        };

        headers['Content-Type'] = 'application/json';

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
                    `Audit Log API: ${options.method || 'GET'} ${endpoint}`
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
                `Audit Log API: Unexpected error in ${endpoint}`
            );
        }
    }

    private buildQueryString(params: AuditLogParams): string {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : '';
    }

    async getAuditLogs(
        params: AuditLogParams,
        token: string
    ): Promise<AuditLogListResponse> {
        const queryString = this.buildQueryString(params);
        return this.makeRequest<AuditLogListResponse>(
            `/admin-system/audit-logs${queryString}`,
            {
                method: 'GET',
            },
            token
        );
    }

    async getAuditLogStats(token: string): Promise<AuditLogStatsResponse> {
        return this.makeRequest<AuditLogStatsResponse>(
            '/admin-system/audit-logs/stats',
            {
                method: 'GET',
            },
            token
        );
    }
}

export const auditLogService = new AuditLogService();
