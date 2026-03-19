import { useCallback } from 'react';
import { auditLogService } from '../services/audit-log-service';
import { useAuditLogStore } from '../stores/audit-log-store';
import { AuditLogParams } from '../types/audit-log-type';
import { ApiError } from '@/lib/errors/api-error-handler';

export const useAuditLog = (token: string) => {
    const {
        logs,
        stats,
        isLoading,
        error,
        pagination,
        setLogs,
        setStats,
        setLoading,
        setError,
        setPagination,
        clearError,
    } = useAuditLogStore();

    const fetchLogs = useCallback(
        async (params: AuditLogParams = {}) => {
            if (!token) {
                setError('No authentication token available');
                return;
            }

            setLoading(true);
            clearError();

            try {
                const response = await auditLogService.getAuditLogs(params, token);
                setLogs(response.data);
                setPagination(response.meta.pagination);
            } catch (err) {
                const errorMessage =
                    err instanceof ApiError ? err.message : 'Failed to fetch audit logs';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [token, setLogs, setPagination, setLoading, setError, clearError]
    );

    const fetchStats = useCallback(async () => {
        if (!token) {
            setError('No authentication token available');
            return;
        }

        setLoading(true);
        clearError();

        try {
            const response = await auditLogService.getAuditLogStats(token);
            setStats(response.data);
        } catch (err) {
            const errorMessage =
                err instanceof ApiError ? err.message : 'Failed to fetch audit log stats';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token, setStats, setLoading, setError, clearError]);

    return {
        logs,
        stats,
        isLoading,
        error,
        pagination,
        fetchLogs,
        fetchStats,
        clearError,
    };
};
