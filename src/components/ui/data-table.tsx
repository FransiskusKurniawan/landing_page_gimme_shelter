'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Table as TanStackTable,
  Row,
  Cell,
  Column,
} from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { createSearchService, SearchQuery } from '@/lib/data/search';
import { createPaginationService } from '@/lib/data/pagination';
import { useSearch } from '@/lib/hooks/common/use-search';
import { useLanguage } from '@/components/providers/language-provider';

// Simple responsive hook for mobile detection
const useResponsive = (breakpoint: number = 768) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return { isMobile };
};

// Memoized Table Body Component to prevent unnecessary re-renders
// Table Body Component without memo to ensure proper re-rendering on column visibility changes
const TableBodyComponent = ({
  table,
  columns,
  loading,
  columnVisibility,
  stickyActionColumn = true,
}: {
  table: TanStackTable<Record<string, unknown>>;
  columns: ColumnDef<Record<string, unknown>, unknown>[];
  loading: boolean;
  columnVisibility: VisibilityState;
  stickyActionColumn?: boolean;
}) => {
  const { t } = useLanguage();
  const columnWidthConfig = React.useMemo(() => {
    const config = new Map<
      string,
      { isActionColumn: boolean; finalMinWidth: string; width: string }
    >();
    table
      .getAllColumns()
      .filter(column => column.getIsVisible()) // Only consider visible columns
      .forEach((column: Column<Record<string, unknown>, unknown>) => {
        const isActionColumn =
          (column.id === 'actions' ||
            column.id === 'action' ||
            column.id.endsWith('_action') ||
            column.id.endsWith('_actions')) &&
          stickyActionColumn;
        const customMinWidth = (column.columnDef as { minWidth?: string })
          ?.minWidth;
        const finalMinWidth =
          customMinWidth || (isActionColumn ? '140px' : '120px');

        config.set(column.id, {
          isActionColumn,
          finalMinWidth,
          width: isActionColumn ? '140px' : 'auto',
        });
      });
    return config;
  }, [table, stickyActionColumn, columnVisibility]);

  const renderCell = React.useCallback(
    (cell: Cell<Record<string, unknown>, unknown>, isLastColumn: boolean) => {
      const widthConfig = columnWidthConfig.get(cell.column.id) || {
        isActionColumn: false,
        finalMinWidth: '120px',
        width: 'auto',
      };

      return (
        <TableCell
          key={cell.id}
          className={`
        ${widthConfig.isActionColumn ? 'sticky right-0 z-10 bg-background shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]' : ''}
        ${isLastColumn && !widthConfig.isActionColumn ? 'pr-4' : ''}
      `}
          style={{
            minWidth: widthConfig.finalMinWidth,
            width: widthConfig.width,
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      );
    },
    [columnWidthConfig]
  );

  return (
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            {t('common.loading')}
          </TableCell>
        </TableRow>
      ) : (
        <>
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row: Row<Record<string, unknown>>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row
                    .getVisibleCells()
                    .map(
                      (
                        cell: Cell<Record<string, unknown>, unknown>,
                        index: number
                      ) => {
                        const isLastColumn =
                          index === row.getVisibleCells().length - 1;
                        return renderCell(cell, isLastColumn);
                      }
                    )}
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                {t('common.error')}
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    </TableBody>
  );
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: SearchQuery) => void;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  dateRange?: DateRange;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  paginationConfig?: {
    defaultPage: number;
    defaultLimit: number;
    pageSizeOptions: number[];
    maxLimit: number;
    minLimit: number;
  };
  showPagination?: boolean;
  className?: string;
  searchConfig?: {
    searchableFields: Array<keyof TData | string>;
    defaultSearchField: keyof TData | string;
  };
  searchTerm?: string;
  searchColumn?: string;
  defaultSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  enableHorizontalScroll?: boolean;
  tableMinWidth?: string;
  stickyActionColumn?: boolean;
}

const DataTableComponent = <TData, TValue>({
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  onSearch,
  onDateRangeChange,
  dateRange,
  pagination,
  paginationConfig,
  showPagination = true,
  className,
  searchConfig,
  searchTerm = '',
  searchColumn = 'all',
  defaultSorting = [],
  onSortingChange,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
  enableHorizontalScroll = true,
  tableMinWidth = '800px',
  stickyActionColumn = true,
}: DataTableProps<TData, TValue>): React.JSX.Element => {
  const { t } = useLanguage();
  const safeColumns = (columns ?? []) as ColumnDef<TData, TValue>[];
  const safeData = (data ?? []) as TData[];

  const { isMobile } = useResponsive();
  const responsiveStickyActionColumn = React.useMemo(() => {
    return isMobile ? false : stickyActionColumn;
  }, [isMobile, stickyActionColumn]);

  const sortingRef = React.useRef<SortingState>(defaultSorting);
  const [sorting, setSorting] = React.useState<SortingState>(defaultSorting);

  React.useEffect(() => {
    const hasChanged =
      JSON.stringify(defaultSorting) !== JSON.stringify(sortingRef.current);
    if (hasChanged) {
      sortingRef.current = defaultSorting;
      setSorting(defaultSorting);
    }
  }, [defaultSorting]);

  const handleSortingChange = React.useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const newSorting =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(sortingRef.current)
          : updaterOrValue;

      const hasChanged =
        JSON.stringify(newSorting) !== JSON.stringify(sortingRef.current);
      if (!hasChanged) return;

      sortingRef.current = newSorting;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    [onSortingChange]
  );

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(externalColumnVisibility || {});

  React.useEffect(() => {
    if (externalColumnVisibility) {
      setColumnVisibility(externalColumnVisibility);
    }
  }, [externalColumnVisibility]);

  const [rowSelection, setRowSelection] = React.useState({});

  const isDateRangeActive = React.useMemo(() => {
    return !!(dateRange?.from && dateRange?.to);
  }, [dateRange]);

  const {
    searchTerm: globalFilter,
    searchColumn: localSearchColumn,
    handleSearchChange,
    handleSearchColumnChange,
    clearSearch,
  } = useSearch({
    onSearch: onSearch || (() => { }),
    initialQuery: searchTerm || '',
    initialColumn: searchColumn || 'all',
  });

  const searchService = React.useMemo(() => {
    if (!searchConfig) return null;

    return createSearchService({
      searchableFields: searchConfig.searchableFields as string[],
      defaultSearchField: searchConfig.defaultSearchField as string,
    });
  }, [searchConfig]);

  const paginationService = React.useMemo(() => {
    if (!paginationConfig) return null;

    return createPaginationService({
      defaultPage: paginationConfig.defaultPage,
      defaultLimit: paginationConfig.defaultLimit,
      pageSizeOptions: paginationConfig.pageSizeOptions,
      maxLimit: paginationConfig.maxLimit,
      minLimit: paginationConfig.minLimit,
    });
  }, [paginationConfig]);

  const table = useReactTable({
    data: safeData,
    columns: safeColumns,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableSorting: true,
    manualSorting: true,
    enableHiding: true,
    enableColumnFilters: true,
  });

  // Sync column visibility with table
  React.useEffect(() => {
    Object.entries(columnVisibility).forEach(([columnId, isVisible]) => {
      const column = table?.getColumn(columnId);
      if (column && column.getIsVisible() !== isVisible) {
        column.toggleVisibility(isVisible);
      }
    });
  }, [columnVisibility, table]);

  const columnVisibilityItems: DropdownItem[] = React.useMemo(() => {
    return table
      .getAllColumns()
      .filter(column => column.getCanHide())
      .map(column => ({
        id: column.id,
        label: column.id,
        checked: column.getIsVisible(),
      }));
  }, [table, columnVisibility]);

  const handleColumnVisibilityChange = React.useCallback(
    (columnId: string, checked: boolean) => {
      const column = table.getColumn(columnId);
      if (column) {
        // Update local state first to trigger re-render
        setColumnVisibility(prev => {
          const newVisibility = {
            ...prev,
            [columnId]: checked,
          };
          return newVisibility;
        });

        // Update the column visibility in the table
        column.toggleVisibility(checked);

        // Call external callback if provided
        const newVisibility = { ...columnVisibility, [columnId]: checked };
        onColumnVisibilityChange?.(newVisibility);
      }
    },
    [table, columnVisibility, onColumnVisibilityChange]
  );

  const searchableColumnItems: DropdownItem[] = React.useMemo(() => {
    const baseColumns = [{ id: 'all', label: t('common.filter_by') }];

    if (searchService) {
      const searchableFields = searchService.getConfig().searchableFields;
      const filteredColumns = searchableFields.map(field => {
        const column = columns.find(
          col => 'accessorKey' in col && col.accessorKey === field
        );

        let label = field;
        if (column && typeof column.header === 'string') {
          label = column.header;
        } else {
          label = field
            .toString()
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        }

        return { id: field, label };
      });

      return [...baseColumns, ...filteredColumns].map(col => ({
        id: col.id,
        label: col.label,
        checked: localSearchColumn === col.id,
      }));
    } else {
      const filteredColumns = columns
        .filter(
          col =>
            'accessorKey' in col &&
            col.accessorKey &&
            typeof col.accessorKey === 'string'
        )
        .map(col => ({
          id: (col as { accessorKey?: string }).accessorKey as string,
          label:
            (typeof col.header === 'string'
              ? col.header
              : (col as { accessorKey?: string }).accessorKey) || 'Unknown',
        }));

      return [...baseColumns, ...filteredColumns].map(col => ({
        id: col.id,
        label: col.label,
        checked: localSearchColumn === col.id,
      }));
    }
  }, [columns, localSearchColumn, searchService]);

  const dynamicPlaceholder = React.useMemo(() => {
    if (localSearchColumn === 'all') {
      return searchPlaceholder;
    }

    const selectedColumn = searchableColumnItems.find(
      item => item.id === localSearchColumn
    );
    if (selectedColumn && localSearchColumn !== 'all') {
      return `${t('common.search')} ${selectedColumn.label.toLowerCase()}...`;
    }

    return searchPlaceholder;
  }, [localSearchColumn, searchableColumnItems, searchPlaceholder]);

  const visibilityStats = React.useMemo(() => {
    const hidableColumns = table
      .getAllColumns()
      .filter(column => column.getCanHide());
    const totalColumns = hidableColumns.length;
    const hiddenColumns = hidableColumns.filter(
      column => !column.getIsVisible()
    ).length;
    const visibleColumns = totalColumns - hiddenColumns;

    return {
      total: totalColumns,
      hidden: hiddenColumns,
      visible: visibleColumns,
      hasHidden: hiddenColumns > 0,
    };
  }, [table, columnVisibility]);

  const handleDateRangeChange = React.useCallback(
    (range: DateRange | undefined) => {
      onDateRangeChange?.(range);
    },
    [onDateRangeChange]
  );

  const applyDateRange = () => {
    // Handled by DateRangePicker component
  };

  const clearDateRange = () => {
    onDateRangeChange?.(undefined);
  };

  const handleSort = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (!column) return;

    const currentSort = column.getIsSorted();
    if (currentSort === false) {
      column.toggleSorting(false);
    } else if (currentSort === 'asc') {
      column.toggleSorting(true);
    } else {
      column.clearSorting();
    }
  };

  return (
    <div className={`w-full ${className || ''}`}>
      {/* Filter bar */}
      <div className="flex flex-col space-y-3 py-3 sm:space-y-4 sm:py-4">
        <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:space-y-0">
          {/* Search Section */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0 lg:flex-1 lg:max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={dynamicPlaceholder}
                value={globalFilter}
                onChange={event => {
                  handleSearchChange(event.target.value);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    handleSearchChange(globalFilter);
                  }
                }}
                className="pl-10 pr-10 placeholder:opacity-50 text-sm sm:text-base"
              />
              {globalFilter && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="hidden sm:block">
              <Dropdown
                items={searchableColumnItems}
                onItemChange={(columnId, checked) => {
                  if (checked) {
                    handleSearchColumnChange(columnId);
                  }
                }}
                placeholder={
                  searchableColumnItems.find(
                    item => item.id === localSearchColumn
                  )?.label || 'All Columns'
                }
                maxHeight={200}
                triggerIcon={<Filter className="mr-2 h-4 w-4" />}
                showBadge={false}
                align="start"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-2 sm:space-y-0">
            {onDateRangeChange && (
              <div className="w-full sm:w-auto">
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  placeholder={t('common.pick_date_range')}
                  isActive={isDateRangeActive}
                  showApplyButton={true}
                  onApply={applyDateRange}
                  onClear={clearDateRange}
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto"
                />
              </div>
            )}

            <div className="hidden sm:block">
              <Dropdown
                items={columnVisibilityItems}
                onItemChange={handleColumnVisibilityChange}
                placeholder={t('common.view')}
                maxHeight={300}
                variant={visibilityStats.hasHidden ? 'default' : 'outline'}
                triggerIcon={<Eye className="mr-2 h-4 w-4" />}
                showBadge={visibilityStats.hasHidden}
                customBadgeContent={
                  visibilityStats.hasHidden
                    ? `${visibilityStats.visible}/${visibilityStats.total}`
                    : undefined
                }
                hideBadgeWhenEmpty={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <div
          className={`relative ${enableHorizontalScroll ? 'overflow-x-auto' : ''}`}
        >
          <Table
            className="min-w-full"
            style={{
              minWidth: enableHorizontalScroll ? tableMinWidth : 'auto',
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers
                    .filter(header => header.column.getIsVisible())
                    .map((header, index, visibleHeaders) => {
                      const canSort = header.column.getCanSort();
                      const isSorted = header.column.getIsSorted();
                      const isActionColumn =
                        (header.column.id === 'actions' ||
                          header.column.id === 'action' ||
                          header.column.id.endsWith('_action') ||
                          header.column.id.endsWith('_actions')) &&
                        responsiveStickyActionColumn;

                      const isLastColumn =
                        index === visibleHeaders.length - 1;

                      const customMinWidth = (
                        header.column.columnDef as { minWidth?: string }
                      )?.minWidth;
                      const finalMinWidth =
                        customMinWidth || (isActionColumn ? '140px' : '120px');

                      return (
                        <TableHead
                          key={header.id}
                          className={`
                          ${isActionColumn ? 'sticky right-0 z-10 bg-background shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]' : ''}
                          ${isLastColumn && !isActionColumn ? 'pr-4' : ''}
                        `}
                          style={{
                            minWidth: finalMinWidth,
                            width: isActionColumn ? '140px' : 'auto',
                          }}
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center gap-2">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {canSort && (
                                <button
                                  onClick={() => handleSort(header.column.id)}
                                  className="p-1 hover:bg-muted rounded-sm transition-colors"
                                >
                                  {(() => {
                                    if (isSorted === 'asc') {
                                      return (
                                        <ArrowUp className="h-4 w-4 text-foreground" />
                                      );
                                    }
                                    if (isSorted === 'desc') {
                                      return (
                                        <ArrowDown className="h-4 w-4 text-foreground" />
                                      );
                                    }
                                    return (
                                      <ArrowUpDown className="h-4 w-4 text-muted-foreground opacity-30" />
                                    );
                                  })()}
                                </button>
                              )}
                            </div>
                          )}
                        </TableHead>
                      );
                    })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBodyComponent
              key={JSON.stringify(columnVisibility)}
              table={table as TanStackTable<Record<string, unknown>>}
              columns={columns as ColumnDef<Record<string, unknown>, unknown>[]}
              loading={loading}
              columnVisibility={columnVisibility}
              stickyActionColumn={responsiveStickyActionColumn}
            />
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && pagination && (
        <div className="flex flex-col space-y-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:space-x-2 sm:py-4">
          <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
            {paginationService
              ? paginationService.getPaginationInfo({
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: Math.ceil(pagination.total / pagination.limit),
                hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
                hasPreviousPage: pagination.page > 1,
                startIndex: (pagination.page - 1) * pagination.limit + 1,
                endIndex: Math.min(pagination.page * pagination.limit, pagination.total),
              })
              : `${t('common.showing')} ${pagination.page} ${t('common.of')} ${Math.ceil(pagination.total / pagination.limit)} ${t('common.items')}`}
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            {paginationService && (
              <div className="hidden sm:flex sm:items-center sm:space-x-2">
                <span className="text-sm text-muted-foreground">{t('common.view')}:</span>
                <Dropdown
                  items={paginationService.getPageSizeOptions().map(option => ({
                    id: option.value.toString(),
                    label: option.label,
                    checked: pagination.limit === option.value,
                  }))}
                  onItemChange={(id, checked) => {
                    if (checked) {
                      const newLimit = parseInt(id, 10);
                      pagination.onPageSizeChange?.(newLimit);
                    }
                  }}
                  placeholder={`${pagination.limit} ${t('common.items')}`}
                  maxHeight={200}
                  showBadge={false}
                  align="end"
                />
              </div>
            )}

            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = pagination.page - 1;
                  pagination.onPageChange?.(newPage);
                }}
                disabled={pagination.page <= 1}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{t('common.previous')}</span>
                <span className="sm:hidden">{t('common.previous')}</span>
              </Button>

              {paginationService && (
                <div className="flex items-center space-x-1">
                  {paginationService
                    .getPageNumbers({
                      page: pagination.page,
                      limit: pagination.limit,
                      total: pagination.total,
                      totalPages: Math.ceil(pagination.total / pagination.limit),
                      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
                      hasPreviousPage: pagination.page > 1,
                      startIndex: (pagination.page - 1) * pagination.limit + 1,
                      endIndex: Math.min(pagination.page * pagination.limit, pagination.total),
                    })
                    .map((item, index) =>
                      item === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-1 text-xs sm:text-sm text-muted-foreground select-none"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant={item === pagination.page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => pagination.onPageChange?.(item as number)}
                          className="w-7 h-7 p-0 text-xs sm:w-8 sm:h-8 sm:text-sm"
                        >
                          {item}
                        </Button>
                      )
                    )}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = pagination.page + 1;
                  pagination.onPageChange?.(newPage);
                }}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{t('common.next')}</span>
                <span className="sm:hidden">{t('common.next')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DataTableComponent.displayName = 'DataTable';

export const DataTable = React.memo(DataTableComponent) as <TData, TValue>(
  props: DataTableProps<TData, TValue>
) => React.JSX.Element;
