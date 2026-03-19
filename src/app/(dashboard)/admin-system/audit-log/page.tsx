'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
    AuditLogStats,
    AuditLogList,
    AuditLogDetail,
    AuditLog as IAuditLog,
    AuditLogStatsData,
    auditLogService,
} from '@/features/admin-system/audit-log';
import { DateRange } from 'react-day-picker';
import { SearchQuery } from '@/lib/data/search';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ApiError } from '@/lib/errors/api-error-handler';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { useLanguage } from '@/components/providers/language-provider';

export default function AuditLogPage() {
    const { token } = useAuth();
    const { t } = useLanguage();

    // Local state instead of store
    const [logs, setLogs] = useState<IAuditLog[]>([]);
    const [stats, setStats] = useState<AuditLogStatsData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
    });
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<IAuditLog | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [searchQuery, setSearchQuery] = useState<SearchQuery>({
        query: '',
        column: 'all',
    });

    // Fetch stats function
    const fetchStats = async () => {
        if (!token) return;

        try {
            const response = await auditLogService.getAuditLogStats(token);
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            if (error instanceof ApiError) {
                toast.error(error.message);
            }
        }
    };

    // Fetch logs function
    const fetchLogs = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            // Build params with proper date formatting
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
            };

            // Add search parameters
            if (searchQuery.query) {
                params.search = searchQuery.query;
                if (searchQuery.column !== 'all') {
                    params.search_by = searchQuery.column;
                }
            }

            // Add date range parameters in yyyy-MM-dd format
            if (dateRange?.from) {
                const dateStr = format(dateRange.from, 'yyyy-MM-dd');
                params.start_date = dateStr;
                if (!dateRange.to) {
                    params.end_date = dateStr;
                }
            }
            if (dateRange?.to) {
                params.end_date = format(dateRange.to, 'yyyy-MM-dd');
            }

            const response = await auditLogService.getAuditLogs(params, token);
            setLogs(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.meta.pagination.total,
            }));
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error(t('admin_system.audit_log.list.fetch_failed'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (token) {
            fetchStats();
            fetchLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, pagination.page, pagination.limit, searchQuery, dateRange]);

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handlePageSizeChange = (limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
    };

    const handleSearch = (query: SearchQuery) => {
        setSearchQuery(query);
        // fetchLogs is called by useEffect when searchQuery changes
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        // fetchLogs is called by useEffect when dateRange changes
    };

    const handleView = (log: IAuditLog) => {
        setSelectedLog(log);
        setDetailDialogOpen(true);
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t('common.back_to_login')}</p>
            </div>
        );
    }

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('admin_system.audit_log.title')}</h1>
                <p className="text-muted-foreground">
                    {t('admin_system.audit_log.description')}
                </p>
            </div>

            <AuditLogStats stats={stats} isLoading={isLoading} />

            <Card>
                <CardHeader>
                    <CardTitle>{t('admin_system.audit_log.list.title')}</CardTitle>
                    <CardDescription>
                        {t('admin_system.audit_log.list.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AuditLogList
                        logs={logs}
                        isLoading={isLoading}
                        onView={handleView}
                        pagination={{
                            page: pagination.page,
                            limit: pagination.limit,
                            total: pagination.total,
                            onPageChange: handlePageChange,
                            onPageSizeChange: handlePageSizeChange,
                        }}
                        onSearch={handleSearch}
                        onDateRangeChange={handleDateRangeChange}
                        dateRange={dateRange}
                    />
                </CardContent>
            </Card>

            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent variant="right-panel" title={t('admin_system.audit_log.detail.title')}>
                    <AuditLogDetail log={selectedLog} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
