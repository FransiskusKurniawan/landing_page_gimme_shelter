/**
 * Date Range Filter Service
 * Manages date range filtering with backend meta integration
 */

import { DateRange } from 'react-day-picker';

// Define filter type locally to avoid circular dependencies
type DashboardFilters = Record<string, string | number | boolean | undefined>;

export interface DateRangeFilterMeta {
  start_date?: string;
  end_date?: string;
}

export interface DateRangeFilterConfig {
  startDate: Date | undefined;
  endDate: Date | undefined;
  startDateParam: string;
  endDateParam: string;
}

export class DateRangeFilterService {
  private static instance: DateRangeFilterService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): DateRangeFilterService {
    if (!DateRangeFilterService.instance) {
      DateRangeFilterService.instance = new DateRangeFilterService();
    }
    return DateRangeFilterService.instance;
  }

  /**
   * Convert DateRange to backend meta format
   */
  toBackendMeta(dateRange: DateRange | undefined): DateRangeFilterMeta {
    if (!dateRange?.from || !dateRange?.to) {
      return {};
    }

    return {
      start_date: this.formatDateForBackend(dateRange.from),
      end_date: this.formatDateForBackend(dateRange.to),
    };
  }

  /**
   * Convert backend meta to DateRange format
   */
  fromBackendMeta(meta: DateRangeFilterMeta): DateRange | undefined {
    if (!meta.start_date || !meta.end_date) {
      return undefined;
    }

    const from = new Date(meta.start_date);
    const to = new Date(meta.end_date);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return undefined;
    }

    return { from, to };
  }

  /**
   * Format date for backend API
   */
  private formatDateForBackend(date: Date): string {
    // Use local timezone instead of UTC to match backend expectations
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone
  }

  /**
   * Check if date range is valid
   */
  isValidDateRange(dateRange: DateRange | undefined): boolean {
    if (!dateRange?.from || !dateRange?.to) {
      return false;
    }

    return dateRange.from <= dateRange.to;
  }

  /**
   * Get default date range (last 30 days)
   */
  getDefaultDateRange(): DateRange {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      from: thirtyDaysAgo,
      to: today,
    };
  }

  /**
   * Convert date range to API filter params
   */
  toApiParams(
    dateRange: DateRange | undefined,
    config: Partial<DateRangeFilterConfig> = {}
  ): Record<string, string> {
    const {
      startDateParam = 'start_date',
      endDateParam = 'end_date',
    } = config;

    const params: Record<string, string> = {};

    if (dateRange?.from) {
      params[startDateParam] = this.formatDateForBackend(dateRange.from);
    }

    if (dateRange?.to) {
      params[endDateParam] = this.formatDateForBackend(dateRange.to);
    }

    return params;
  }

  /**
   * Merge date range params into existing filters
   */
  mergeWithFilters<T extends DashboardFilters>(
    filters: T,
    dateRange: DateRange | undefined,
    config: Partial<DateRangeFilterConfig> = {}
  ): T {
    const dateParams = this.toApiParams(dateRange, config);
    
    return {
      ...filters,
      ...dateParams,
    } as T;
  }

  /**
   * Get human readable date range description
   */
  getDateRangeDescription(dateRange: DateRange | undefined): string {
    if (!dateRange?.from || !dateRange?.to) {
      return 'No date range selected';
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    if (this.isSameDay(dateRange.from, dateRange.to)) {
      return formatDate(dateRange.from);
    }

    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Get preset date ranges
   */
  getPresetDateRanges() {
    const today = new Date();
    
    return {
      today: {
        from: today,
        to: today,
      },
      yesterday: {
        from: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        to: new Date(today.getTime() - 24 * 60 * 60 * 1000),
      },
      last7Days: {
        from: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
        to: today,
      },
      last30Days: {
        from: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000),
        to: today,
      },
      thisMonth: {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: today,
      },
      lastMonth: (() => {
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          from: firstDayLastMonth,
          to: lastDayLastMonth,
        };
      })(),
      thisYear: {
        from: new Date(today.getFullYear(), 0, 1),
        to: today,
      },
      lastYear: (() => {
        const firstDayLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastDayLastYear = new Date(today.getFullYear() - 1, 11, 31);
        return {
          from: firstDayLastYear,
          to: lastDayLastYear,
        };
      })(),
    };
  }
}

// Export singleton instance
export const dateRangeService = DateRangeFilterService.getInstance();
