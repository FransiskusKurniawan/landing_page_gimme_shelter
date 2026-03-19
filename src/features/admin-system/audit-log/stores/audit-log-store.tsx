import { create } from 'zustand';
import { AuditLog, AuditLogStatsData } from '../types/audit-log-type';

interface AuditLogState {
    logs: AuditLog[];
    stats: AuditLogStatsData | null;
    isLoading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
    setLogs: (logs: AuditLog[]) => void;
    setStats: (stats: AuditLogStatsData) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setPagination: (pagination: { total: number; page: number; limit: number }) => void;
    clearError: () => void;
}

export const useAuditLogStore = create<AuditLogState>((set) => ({
    logs: [],
    stats: null,
    isLoading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
    },
    setLogs: (logs) => set({ logs }),
    setStats: (stats) => set({ stats }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),
    clearError: () => set({ error: null }),
}));
