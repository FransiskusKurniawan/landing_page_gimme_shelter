# DataTable Component - Global Reusable Table System

A powerful, feature-rich, and fully reusable data table component built with TanStack Table, designed for consistent table implementations across your application.

## 📦 Installation

The following dependencies are required and have been installed:

```bash
npm install @tanstack/react-table react-day-picker date-fns
```

## 🎯 Features

- ✅ **Server-side operations**: Sorting, filtering, pagination, and search
- ✅ **Sticky action column**: Fixed on the right when scrolling horizontally
- ✅ **Responsive design**: Mobile-first approach with adaptive layouts
- ✅ **Column visibility**: Show/hide columns dynamically
- ✅ **Date range filtering**: Built-in date range picker
- ✅ **Search functionality**: Global and column-specific search
- ✅ **Sorting**: Multi-column sorting with visual indicators
- ✅ **Pagination**: Flexible pagination with customizable page sizes
- ✅ **TypeScript**: Full type safety
- ✅ **Reusable action buttons**: Consistent button components across tables

## 🚀 Basic Usage

### 1. Define Your Columns

```tsx
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ActionButtonsContainer,
} from '@/components/widget/action-buttons';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    enableSorting: true,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    enableSorting: true,
    cell: ({ row }) => {
      return new Date(row.original.created_at).toLocaleDateString();
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionButtonsContainer>
        <ViewButton
          onClick={() => handleView(row.original.id)}
          title="View Details"
        />
        <EditButton
          onClick={() => handleEdit(row.original.id)}
          title="Edit User"
        />
        <DeleteButton
          onClick={() => handleDelete(row.original.id)}
          title="Delete User"
        />
      </ActionButtonsContainer>
    ),
  },
];
```

### 2. Implement the DataTable

```tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { SearchQuery } from '@/lib/search';
import { DateRange } from 'react-day-picker';

export function UserList() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [sorting, setSorting] = useState([]);
  const [search, setSearch] = useState<SearchQuery>({ query: '', column: 'all' });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Fetch data function
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pagination.page,
          limit: pagination.limit,
          sort_by: sorting[0]?.id || 'id',
          sort: sorting[0]?.desc ? 'desc' : 'asc',
          search: search.query,
          search_by: search.column,
          start_date: dateRange?.from,
          end_date: dateRange?.to,
        }),
      });
      const result = await response.json();
      setData(result.data);
      setPagination(prev => ({ ...prev, total: result.total }));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when parameters change
  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, sorting, search, dateRange]);

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      searchPlaceholder="Search users..."
      onSearch={(query) => setSearch(query)}
      searchTerm={search.query}
      searchColumn={search.column}
      searchConfig={{
        searchableFields: ['name', 'email', 'role'],
        defaultSearchField: 'all',
      }}
      onDateRangeChange={setDateRange}
      dateRange={dateRange}
      pagination={{
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
        onPageSizeChange: (limit) => setPagination(prev => ({ ...prev, limit, page: 1 })),
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
      tableMinWidth="800px"
    />
  );
}
```

## 📋 Props Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | required | Column definitions |
| `data` | `TData[]` | required | Array of data to display |
| `loading` | `boolean` | `false` | Show loading state |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for search input |
| `onSearch` | `(query: SearchQuery) => void` | - | Search callback |
| `searchTerm` | `string` | `''` | Current search term |
| `searchColumn` | `string` | `'all'` | Current search column |
| `searchConfig` | `object` | - | Search configuration |
| `onDateRangeChange` | `(range?: DateRange) => void` | - | Date range callback |
| `dateRange` | `DateRange` | - | Current date range |
| `pagination` | `object` | - | Pagination state |
| `paginationConfig` | `object` | - | Pagination configuration |
| `showPagination` | `boolean` | `true` | Show/hide pagination |
| `defaultSorting` | `SortingState` | `[]` | Initial sorting state |
| `onSortingChange` | `(sorting: SortingState) => void` | - | Sorting callback |
| `columnVisibility` | `VisibilityState` | `{}` | Column visibility state |
| `onColumnVisibilityChange` | `(visibility: VisibilityState) => void` | - | Column visibility callback |
| `enableHorizontalScroll` | `boolean` | `true` | Enable horizontal scrolling |
| `tableMinWidth` | `string` | `'800px'` | Minimum table width |
| `stickyActionColumn` | `boolean` | `true` | Make action column sticky |

## 🎨 Action Buttons

Reusable action button components are available:

```tsx
import {
  ViewButton,
  EditButton,
  DeleteButton,
  SettingsButton,
  ActionButtonsContainer,
} from '@/components/widget/action-buttons';

<ActionButtonsContainer>
  <ViewButton onClick={() => {}} title="View" />
  <EditButton onClick={() => {}} title="Edit" />
  <DeleteButton onClick={() => {}} title="Delete" />
  <SettingsButton onClick={() => {}} title="Settings" />
</ActionButtonsContainer>
```

## 🎯 Column Configuration

### Sortable Column
```tsx
{
  accessorKey: 'name',
  header: 'Name',
  enableSorting: true,
}
```

### Custom Cell Rendering
```tsx
{
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => (
    <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
      {row.original.status}
    </Badge>
  ),
}
```

### Fixed Width Column
```tsx
{
  accessorKey: 'id',
  header: 'ID',
  minWidth: '80px',
}
```

### Action Column (Sticky)
```tsx
{
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => (
    <ActionButtonsContainer>
      {/* Action buttons */}
    </ActionButtonsContainer>
  ),
}
```

## 📱 Responsive Behavior

- **Mobile (<768px)**: 
  - Vertical layout for filters
  - Stacked pagination controls
  - Action column becomes scrollable (not sticky)
  
- **Tablet (>=768px)**: 
  - Horizontal filter layout
  - Column visibility controls visible
  
- **Desktop (>=1024px)**: 
  - Full horizontal layout
  - All features visible

## 🔧 Customization

### Custom Search Logic
```tsx
searchConfig={{
  searchableFields: ['name', 'email'],
  defaultSearchField: 'all',
  customSearchLogic: {
    email: (value, searchTerm) => {
      return value.toString().toLowerCase().includes(searchTerm);
    },
  },
}}
```

### Custom Pagination
```tsx
paginationConfig={{
  defaultPage: 1,
  defaultLimit: 25,
  pageSizeOptions: [10, 25, 50, 100],
  maxLimit: 100,
  minLimit: 10,
}}
```

## 🚦 Best Practices

1. **Always use server-side operations** for large datasets
2. **Memoize column definitions** to prevent unnecessary re-renders
3. **Use TypeScript interfaces** for type safety
4. **Implement proper loading states** for better UX
5. **Handle errors gracefully** with toast notifications
6. **Keep action columns last** for sticky positioning

## 📦 File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── data-table.tsx          # Main DataTable component
│   │   ├── date-range-picker.tsx   # Date range picker
│   │   ├── dropdown.tsx            # Dropdown component
│   │   └── table.tsx               # Base table components
│   └── widget/
│       └── action-buttons.tsx      # Reusable action buttons
├── lib/
│   ├── search.ts                   # Search utilities
│   ├── pagination.ts               # Pagination utilities
│   └── hooks/
│       └── use-search.ts           # Search hook
```

## 🎉 Migration from Old Tables

To migrate existing tables:

1. Install dependencies
2. Define columns using `ColumnDef`
3. Replace old table markup with `<DataTable>`
4. Update state management for server-side operations
5. Replace action buttons with reusable components
6. Test responsive behavior

## 🐛 Troubleshooting

### Action column not sticky
- Ensure column `id` is 'actions' or ends with '_actions'
- Check `stickyActionColumn` prop is `true`
- Verify `enableHorizontalScroll` is enabled

### Pagination not working
- Ensure `pagination` prop includes all required fields
- Check `onPageChange` and `onPageSizeChange` callbacks
- Verify server-side pagination implementation

### Search not triggering
- Check `onSearch` callback is properly connected
- Verify `searchConfig` is correctly configured
- Ensure server-side search endpoint is working

## 📚 Examples

See the following files for complete examples:
- `menu-list.tsx` - Menu management table
- `role-list.tsx` - Role management table
- `user-list.tsx` - User management table
