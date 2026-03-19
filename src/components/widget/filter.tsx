'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useLanguage } from '@/components/providers/language-provider';

export interface FilterOption {
  value: string;
  label: string;
}

export interface DateRange {
  from?: string; // ISO date string
  to?: string;   // ISO date string
}

interface FilterProps {
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  // Filter dropdown
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  filterWidth?: string;

  // Date range
  showDateRange?: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;

  // Action button
  showActionButton?: boolean;
  actionButtonLabel?: string;
  actionButtonIcon?: React.ReactNode;
  onActionClick?: () => void;
}

export function Filter({
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  filterOptions,
  filterValue,
  onFilterChange,
  filterPlaceholder,
  filterWidth = 'w-[180px]',
  showDateRange = false,
  dateRange,
  onDateRangeChange,
  showActionButton = false,
  actionButtonLabel,
  actionButtonIcon,
  onActionClick,
}: FilterProps) {
  const { t } = useLanguage();
  const resolvedSearchPlaceholder = searchPlaceholder || t('common.search');
  const resolvedFilterPlaceholder = filterPlaceholder || t('common.filter_by');
  const resolvedActionButtonLabel = actionButtonLabel || t('common.add');
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (field: 'from' | 'to', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    onDateRangeChange?.(newRange);
  };

  const clearDateRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateRangeChange?.(undefined);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex flex-1 gap-2 flex-wrap">
        {/* Search Input */}
        {onSearchChange && (
          <Input
            placeholder={resolvedSearchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
        )}

        {/* Filter Dropdown */}
        {filterOptions && filterOptions.length > 0 && (
          <Select value={filterValue} onValueChange={onFilterChange}>
            <SelectTrigger className={filterWidth}>
              <SelectValue placeholder={resolvedFilterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date Range Picker */}
        {showDateRange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'min-w-[240px] justify-start text-left font-normal',
                  !dateRange?.from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                    </>
                  ) : (
                    formatDate(dateRange.from)
                  )
                ) : (
                  <span>{t('common.pick_date_range')}</span>
                )}
                {dateRange?.from && (
                  <X
                    className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
                    onClick={clearDateRange}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.from_date')}</label>
                  <Input
                    type="date"
                    value={dateRange?.from || ''}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('common.to_date')}</label>
                  <Input
                    type="date"
                    value={dateRange?.to || ''}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Action Button */}
      {showActionButton && onActionClick && (
        <Button onClick={onActionClick}>
          {actionButtonIcon || <Plus className="h-4 w-4 mr-2" />}
          {resolvedActionButtonLabel}
        </Button>
      )}
    </div>
  );
}

