'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { DateRange } from 'react-day-picker';
import { SearchQuery } from '@/lib/data/search';
import { useLanguage } from '@/components/providers/language-provider';
import { AuditLog } from '../types/audit-log-type';

interface AuditLogListProps {
    logs: AuditLog[];
    isLoading: boolean;
    onView: (log: AuditLog) => void;
    pagination: {
        page: number;
        limit: number;
        total: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (size: number) => void;
    };
    onSearch: (query: SearchQuery) => void;
    onDateRangeChange: (range: DateRange | undefined) => void;
    dateRange?: DateRange;
    searchTerm?: string;
    searchColumn?: string;
}

export function AuditLogList({
    logs,
    isLoading,
    onView,
    pagination,
    onSearch,
    onDateRangeChange,
    dateRange,
    searchTerm = '',
    searchColumn = 'all',
}: AuditLogListProps) {
    const { t } = useLanguage();

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'CREATE':
                return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'UPDATE':
                return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            case 'DELETE':
                return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            case 'LOGIN':
                return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
            default:
                return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
        }
    };

    const columns = useMemo<ColumnDef<AuditLog>[]>(
        () => [
            {
                accessorKey: 'id',
                header: t('common.id'),
                enableSorting: true,
                cell: ({ row }) => <div className="w-16">{row.original.id}</div>,
            },
            {
                accessorKey: 'username',
                header: t('auth.username'),
                enableSorting: false,
                cell: ({ row }) => <span className="font-medium">{row.original.username}</span>,
            },
            {
                accessorKey: 'action',
                header: t('admin_system.audit_log.detail.action'),
                enableSorting: true,
                cell: ({ row }) => (
                    <Badge variant="outline" className={getActionColor(row.original.action)}>
                        {row.original.action}
                    </Badge>
                ),
            },
            {
                accessorKey: 'entity',
                header: t('admin_system.audit_log.detail.entity'),
                enableSorting: true,
            },
            {
                accessorKey: 'entity_id',
                header: t('admin_system.audit_log.detail.entity_id'),
                cell: ({ row }) => row.original.entity_id || '-',
            },
            {
                accessorKey: 'created_at',
                header: t('common.created_at'),
                enableSorting: true,
                cell: ({ row }) => (
                    <div className="text-sm">
                        {new Date(row.original.created_at).toLocaleDateString(t('common.language.indonesian') === 'Indonesia' ? 'id-ID' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                ),
            },
            {
                id: 'actions',
                header: t('common.actions'),
                cell: ({ row }) => (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onView(row.original)}
                            title={t('common.details')}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [onView, t]
    );

    return (
        <DataTable
            columns={columns}
            data={logs}
            loading={isLoading}
            pagination={pagination}
            paginationConfig={{
                defaultPage: 1,
                defaultLimit: 10,
                pageSizeOptions: [10, 25, 50, 100],
                maxLimit: 100,
                minLimit: 5,
            }}
            onSearch={onSearch}
            searchTerm={searchTerm}
            searchColumn={searchColumn}
            onDateRangeChange={onDateRangeChange}
            dateRange={dateRange}
            searchPlaceholder={t('admin_system.audit_log.list.search_placeholder')}
            searchConfig={{
                searchableFields: ['action', 'entity', 'username'],
                defaultSearchField: 'all',
            }}
            stickyActionColumn={true}
            enableHorizontalScroll={true}
            tableMinWidth="1000px"
        />
    );
}
