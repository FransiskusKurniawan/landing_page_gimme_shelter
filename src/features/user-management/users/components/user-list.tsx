'use client';

import { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { SearchQuery } from '@/lib/data/search';
import { DateRange } from 'react-day-picker';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DynamicTableActions } from '@/components/dynamic-actions';
import { useTableActions } from '@/lib/hooks/common/use-table-actions';
import { User, UserListParams } from '../types/user-type';
import { userService } from '../services/user-service';
import { toast } from 'sonner';
import { ApiError } from '@/lib/errors/api-error-handler';
import { format } from 'date-fns';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import type { ActionConfig } from '@/lib/services/action-service';
import { useLanguage } from '@/components/providers/language-provider';

interface UserListProps {
  token: string;
  onView?: (user: User) => void;
  onEdit?: (userId: number) => void;
  onCreate?: () => void;
  onDelete?: (userId: number) => void;
  refreshTrigger?: number;
}

export function UserList({ token, onView, onEdit, onCreate, onDelete, refreshTrigger }: UserListProps) {
  const { t } = useLanguage();
  const [data, setData] = useState<User[]>([]);
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
  const actionConfigs: ActionConfig<User>[] = useMemo(
    () => [
      {
        code: 'DETAIL',
        label: t('common.details'),
        icon: 'Eye',
        variant: 'outline',
        showInTable: true,
        onClick: (user?: User) => {
          if (user && onView) onView(user);
        },
      },
      {
        code: 'EDIT',
        label: t('common.edit'),
        icon: 'Edit',
        variant: 'ghost',
        showInTable: true,
        onClick: (user?: User) => {
          if (user && onEdit) onEdit(user.id);
        },
      },
      {
        code: 'DELETE',
        label: t('common.delete'),
        icon: 'Trash2',
        variant: 'ghost',
        showInTable: true,
        requiresConfirmation: true,
        onClick: (user?: User) => {
          if (user && onDelete) onDelete(user.id);
        },
      },
    ],
    [onView, onEdit, onDelete]
  );

  // Use dynamic actions hook
  const { tableActions, hasPermission: hasActionPermission } = useTableActions<User>(actionConfigs);

  // Define columns
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('common.id'),
        enableSorting: true,
        cell: ({ row }) => <div className="w-16">{row.original.id}</div>,
      },
      {
        accessorKey: 'photo_profile',
        header: t('user_mgmt.users.avatar'),
        cell: ({ row }) => (
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={row.original.photo_profile}
              alt={row.original.name}
            />
            <AvatarFallback>
              {row.original.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ),
      },
      {
        accessorKey: 'username',
        header: t('user_mgmt.users.username'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.username}</div>
        ),
      },
      {
        accessorKey: 'name',
        header: t('user_mgmt.users.name'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: t('user_mgmt.users.email'),
        enableSorting: true,
        cell: ({ row }) => (
          <div className="text-sm">{row.original.email}</div>
        ),
      },
      {
        accessorKey: 'roles',
        header: t('user_mgmt.users.roles'),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.roles && row.original.roles.length > 0 ? (
              row.original.roles.map((role) => (
                <Badge key={role.id} variant="outline" className="text-xs">
                  {role.name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{t('user_mgmt.users.no_roles')}</span>
            )}
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
      const params: UserListParams = {
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

      const response = await userService.getUsers(params, token);
      setData(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.meta.pagination.total,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error(t('user_mgmt.users.fetch_failed'));
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

  // Check if user can create user
  const canCreate = hasActionPermission('CREATE');

  return (
    <div className="space-y-4">

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchPlaceholder={t('user_mgmt.users.search_placeholder')}
        onSearch={(query) => setSearch(query)}
        searchTerm={search.query}
        searchColumn={search.column}
        searchConfig={{
          searchableFields: ['username', 'name', 'email'],
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
