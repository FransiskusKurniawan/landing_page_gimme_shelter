// Re-export DataTable and related types
export { DataTable } from './data-table';
export type { ColumnDef, SortingState } from '@tanstack/react-table';
export type { DateRange } from 'react-day-picker';

// Re-export search utilities
export { createSearchService } from '@/lib/data/search';
export type { SearchQuery } from '@/lib/data/search';

// Re-export pagination utilities
export { createPaginationService } from '@/lib/data/pagination';
export type { PaginationInfo } from '@/lib/data/pagination';

// Re-export hooks
export { useSearch } from '@/lib/hooks/common/use-search';

// Re-export UI components
export { IconPicker } from './icon-picker';
export { SidePanelLayout } from './side-panel-layout';

// Re-export action buttons
export {
  ViewButton,
  EditButton,
  DeleteButton,
  SettingsButton,
  ActionMenu,
  ActionButtonsContainer,
} from '@/components/widget/action-buttons';

/**
 * Usage example:
 * 
 * import { 
 *   DataTable, 
 *   ColumnDef, 
 *   ViewButton, 
 *   EditButton, 
 *   DeleteButton,
 *   ActionButtonsContainer 
 * } from '@/components/ui';
 */
