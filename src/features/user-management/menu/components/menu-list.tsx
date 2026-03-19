'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SearchQuery } from '@/lib/data/search';
import { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DynamicTableActions } from '@/components/dynamic-actions';
import { useTableActions } from '@/lib/hooks/common/use-table-actions';
import { Menu, MenuListParams } from '../types/menu-type';
import { menuService } from '../services/menu-service';
import { toast } from 'sonner';
import { ApiError } from '@/lib/errors/api-error-handler';
import { format } from 'date-fns';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import type { ActionConfig } from '@/lib/services/action-service';
import { useLanguage } from '@/components/providers/language-provider';
import { DynamicIcon } from '@/lib/utils/dynamic-icon-loader';

interface MenuListProps {
  token: string;
  onView?: (menu: Menu) => void;
  onEdit?: (menuId: number) => void;
  onCreate?: () => void;
  onDelete?: (menuId: number) => void;
  refreshTrigger?: number;
}

export function MenuList({ token, onView, onEdit, onCreate, onDelete, refreshTrigger }: MenuListProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<Menu[]>([]);
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
  const actionConfigs: ActionConfig<Menu>[] = useMemo(
    () => [
      {
        code: 'DETAIL',
        label: t('common.details'),
        icon: 'Eye',
        variant: 'outline',
        showInTable: true,
        onClick: (menu?: Menu) => {
          if (menu && onView) onView(menu);
        },
      },
      {
        code: 'EDIT',
        label: t('common.edit'),
        icon: 'Edit',
        variant: 'ghost',
        showInTable: true,
        onClick: (menu?: Menu) => {
          if (menu && onEdit) onEdit(menu.id);
        },
      },
      {
        code: 'DELETE',
        label: t('common.delete'),
        icon: 'Trash2',
        variant: 'ghost',
        showInTable: true,
        requiresConfirmation: true,
        onClick: (menu?: Menu) => {
          if (menu && onDelete) onDelete(menu.id);
        },
      },
    ],
    [onView, onEdit, onDelete]
  );

  // Use dynamic actions hook
  const { tableActions, hasPermission: hasActionPermission } = useTableActions<Menu>(actionConfigs);

  // Define columns
  const columns = useMemo<ColumnDef<Menu>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('common.id'),
        enableSorting: true,
        cell: ({ row }) => <div className="w-16">{row.original.id}</div>,
      },
      {
        accessorKey: 'name',
        header: t('user_mgmt.menus.name'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'code',
        header: t('user_mgmt.menus.code'),
        enableSorting: true,
        cell: ({ row }) => (
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {row.original.code}
          </code>
        ),
      },
      {
        accessorKey: 'url_path',
        header: t('user_mgmt.menus.url_path'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.url_path}
          </div>
        ),
      },
      {
        accessorKey: 'icon',
        header: t('user_mgmt.menus.icon'),
        cell: ({ row }) => {
          const iconName = row.original.icon;
          if (!iconName) return <div className="text-sm text-muted-foreground">-</div>;

          return (
            <div className="flex items-center gap-2">
              <DynamicIcon name={iconName} className="h-4 w-4" />
              <span className="text-xs text-muted-foreground">{iconName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'order_no',
        header: t('user_mgmt.menus.order'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-center">{row.original.order_no}</div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: t('common.status'),
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
            {row.original.is_active ? t('common.active') : t('common.inactive')}
          </Badge>
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
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DynamicTableActions
            actions={tableActions}
            data={row.original}
            maxVisibleActions={2}
          />
        ),
      },
    ],
    [tableActions]
  );

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: MenuListParams = {
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

      const response = await menuService.getMenus(params, token);
      setData(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.pagination.total,
      }));
    } catch (error) {
      console.error('Error fetching menus:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('user_mgmt.menus.fetch_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Refetch when parameters change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, sorting, search, dateRange, refreshTrigger]);

  // Check if user can create menu
  const canCreate = hasActionPermission('CREATE');

  return (
    <div className="space-y-4">

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder={t('user_mgmt.menus.search_placeholder')}
        onSearch={(query) => setSearch(query)}
        searchTerm={search.query}
        searchColumn={search.column}
        searchConfig={{
          searchableFields: ['name', 'code', 'url_path'],
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
        tableMinWidth="1000px"
      />
    </div>
  );
}
