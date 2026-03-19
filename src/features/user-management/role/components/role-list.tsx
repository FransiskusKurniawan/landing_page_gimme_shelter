'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SearchQuery } from '@/lib/data/search';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { DynamicTableActions } from '@/components/dynamic-actions';
import { useTableActions } from '@/lib/hooks/common/use-table-actions';
import { Role, RoleListParams } from '../types/role-type';
import { roleService } from '../services/role-service';
import { format } from 'date-fns';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import type { ActionConfig } from '@/lib/services/action-service';
import { useLanguage } from '@/components/providers/language-provider';

interface RoleListProps {
  token: string;
  onView?: (role: Role) => void;
  onEdit?: (roleId: number) => void;
  onCreate?: () => void;
  onDelete?: (roleId: number) => void;
  onManageAccess?: (role: Role) => void;
  refreshTrigger?: number;
}

export function RoleList({
  token,
  onView,
  onEdit,
  onCreate,
  onDelete,
  onManageAccess,
  refreshTrigger,
}: RoleListProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([{ id: 'created_at', desc: true }]);
  const [search, setSearch] = useState<SearchQuery>({ query: '', column: 'all' });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Get permission checker from menu store
  const hasPermission = useMenuStore((state) => state.hasPermission);

  // Define action configurations
  const actionConfigs: ActionConfig<Role>[] = useMemo(
    () => [
      {
        code: 'DETAIL',
        label: t('common.details'),
        icon: 'Eye',
        variant: 'outline',
        showInTable: true,
        onClick: (role?: Role) => {
          if (role && onView) onView(role);
        },
      },
      {
        code: 'EDIT',
        label: t('common.edit'),
        icon: 'Edit',
        variant: 'ghost',
        showInTable: true,
        onClick: (role?: Role) => {
          if (role && onEdit) onEdit(role.id);
        },
      },
      {
        code: 'DELETE',
        label: t('common.delete'),
        icon: 'Trash2',
        variant: 'ghost',
        showInTable: true,
        requiresConfirmation: true,
        onClick: (role?: Role) => {
          if (role && onDelete) onDelete(role.id);
        },
      },
    ],
    [onView, onEdit, onDelete]
  );

  // Use dynamic actions hook
  const { tableActions, hasPermission: hasActionPermission } = useTableActions<Role>(actionConfigs);

  // Define columns
  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('common.id'),
        enableSorting: true,
        cell: ({ row }) => <div className="w-16">{row.original.id}</div>,
      },
      {
        accessorKey: 'name',
        header: t('user_mgmt.roles.name'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'description',
        header: t('user_mgmt.roles.description_label'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground max-w-md truncate">
            {row.original.description}
          </div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: t('common.created_at'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-xs">
            {new Date(row.original.created_at).toLocaleString(t('common.language.english') === 'English' ? 'en-US' : 'id-ID', {
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
        accessorKey: 'updated_at',
        header: t('common.updated_at'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-xs">
            {new Date(row.original.updated_at).toLocaleString(t('common.language.english') === 'English' ? 'en-US' : 'id-ID', {
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
          <div className="flex items-center gap-2">
            {/* Manage Access button - protected by CREATE permission */}
            {onManageAccess && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onManageAccess(row.original)}
                className="flex items-center gap-1"
              >
                {t('user_mgmt.roles.manage_access')}
              </Button>
            )}
            <DynamicTableActions
              actions={tableActions}
              data={row.original}
              maxVisibleActions={2}
            />
          </div>
        ),
      },
    ],
    [tableActions, hasActionPermission, onManageAccess]
  );

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: RoleListParams = {
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sorting[0]?.id || 'id',
        sort: sorting[0]?.desc ? 'desc' : 'asc',
      };

      // Add search parameters
      if (search.query) {
        params.search = search.query;
        if (search.column !== 'all') {
          params.search_by = search.column;
        }
      }

      // Add date range parameters
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

      const response = await roleService.getRoles(params, token);
      setData(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.pagination.total,
      }));
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when parameters change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, sorting, search, dateRange, refreshTrigger]);

  // Check if user can create role
  const canCreate = hasActionPermission('CREATE');

  return (
    <div className="space-y-4">

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder={t('user_mgmt.roles.search_placeholder')}
        onSearch={(query) => setSearch(query)}
        searchTerm={search.query}
        searchColumn={search.column}
        searchConfig={{
          searchableFields: ['name', 'description'],
          defaultSearchField: 'all',
        }}
        onDateRangeChange={setDateRange}
        dateRange={dateRange}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
          onPageSizeChange: (limit) =>
            setPagination((prev) => ({ ...prev, limit, page: 1 })),
        }}
        paginationConfig={{
          defaultPage: 1,
          defaultLimit: 10,
          pageSizeOptions: [10, 25, 50, 100],
          maxLimit: 100,
          minLimit: 5,
        }}
        defaultSorting={sorting}
        onSortingChange={setSorting}
        stickyActionColumn={true}
        enableHorizontalScroll={true}
        tableMinWidth="900px"
      />
    </div>
  );
}
