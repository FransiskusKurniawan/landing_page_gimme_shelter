'use client';

import * as React from 'react';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  format,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';

import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
  // Server-side integration props
  isActive?: boolean;
  showApplyButton?: boolean;
  onApply?: () => void;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = 'Pick a date range',
  className,
  disabled = false,
  showClearButton = true,
  onClear,
  isActive: externalIsActive,
  showApplyButton = false,
  onApply,
  size = 'default',
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempDateRange, setTempDateRange] = React.useState<
    DateRange | undefined
  >(dateRange);
  const [month, setMonth] = React.useState(new Date());

  // Use external isActive if provided, otherwise calculate internally
  const isActive =
    externalIsActive !== undefined
      ? externalIsActive
      : !!(dateRange?.from && dateRange?.to);

  // Preset date ranges
  const today = new Date();
  const yesterday = {
    from: subDays(today, 1),
    to: subDays(today, 1),
  };
  const last7Days = {
    from: subDays(today, 6),
    to: today,
  };
  const last30Days = {
    from: subDays(today, 29),
    to: today,
  };
  const monthToDate = {
    from: startOfMonth(today),
    to: today,
  };
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  };
  const yearToDate = {
    from: startOfYear(today),
    to: today,
  };
  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1)),
  };

  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (showApplyButton) {
      // For server-side integration, store temporarily
      setTempDateRange(selectedRange);
    } else {
      // For immediate updates - always call callback
      onDateRangeChange?.(selectedRange);
    }
  };

  const handlePresetSelect = (presetRange: DateRange) => {
    if (showApplyButton) {
      setTempDateRange(presetRange);
      setMonth(presetRange.to || new Date());
    } else {
      onDateRangeChange?.(presetRange);
      setMonth(presetRange.to || new Date());
    }
  };

  const handleApply = () => {
    // Only call onDateRangeChange if tempDateRange is valid (at least 'from' is present)
    if (tempDateRange?.from) {
      onDateRangeChange?.(tempDateRange);
      // Reset tempDateRange after successful apply
      setTempDateRange(undefined);
    }
    onApply?.();
    setOpen(false);
  };

  const handleClear = () => {
    setTempDateRange(undefined);
    onDateRangeChange?.(undefined);
    onClear?.();
    setOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return placeholder;
    }

    if (!range.to) {
      return format(range.from, 'LLL dd, y');
    }

    return `${format(range.from, 'LLL dd, y')} - ${format(range.to, 'LLL dd, y')}`;
  };

  // Sync tempDateRange with external dateRange changes
  React.useEffect(() => {
    setTempDateRange(dateRange);
  }, [dateRange]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id='date'
            className={cn(
              // Match Select component styling exactly
              'border-input text-foreground data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex h-9 items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
              // Open state styling
              open && 'border-primary ring-1 ring-primary/20 bg-primary/5',
              // Active state styling (has selections)
              isActive && 'bg-primary/10 border-primary text-primary',
              // Hover state
              'hover:border-primary/50 hover:bg-accent/50',
              // Default width behavior: fit content with max width
              'w-auto min-w-[120px] max-w-[300px]',
              size === 'sm' && 'h-9',
              !dateRange && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <div className='flex items-center gap-2 flex-1 text-left'>
              <CalendarIcon className='mr-2 h-4 w-4' />
              <span
                className={cn(
                  'line-clamp-1 transition-colors',
                  // Placeholder text styling
                  !dateRange && 'text-muted-foreground',
                  // Selected value styling
                  dateRange && 'text-foreground',
                  // Active state (has selections)
                  isActive && 'text-primary font-medium'
                )}
              >
                {formatDateRange(showApplyButton ? tempDateRange : dateRange)}
              </span>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              {isActive && (
                <Badge
                  variant='secondary'
                  className='h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground'
                >
                  ✓
                </Badge>
              )}
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  'text-muted-foreground/80',
                  open && 'text-primary',
                  isActive && 'text-primary'
                )}
              />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <div className='rounded-md border'>
            <div className='flex max-sm:flex-col'>
              <div className='relative py-4 max-sm:order-1 max-sm:border-t sm:w-32'>
                <div className='h-full sm:border-e'>
                  <div className='flex flex-col px-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => {
                        const todayRange = {
                          from: today,
                          to: today,
                        };
                        handlePresetSelect(todayRange);
                      }}
                    >
                      Today
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handlePresetSelect(yesterday)}
                    >
                      Yesterday
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handlePresetSelect(last7Days)}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handlePresetSelect(last30Days)}
                    >
                      Last 30 days
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handlePresetSelect(monthToDate)}
                    >
                      Month to date
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handlePresetSelect(lastMonth)}
                    >
                      Last month
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handlePresetSelect(yearToDate)}
                    >
                      Year to date
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => handlePresetSelect(lastYear)}
                    >
                      Last year
                    </Button>
                  </div>
                </div>
              </div>
              <Calendar
                mode='range'
                selected={showApplyButton ? tempDateRange : dateRange}
                onSelect={newDate => {
                  if (newDate) {
                    handleSelect(newDate);
                  }
                }}
                month={month}
                onMonthChange={setMonth}
                className='p-2'
                disabled={[
                  { after: today }, // Dates after today
                ]}
              />
            </div>
          </div>

          {/* Action buttons for server-side integration */}
          {showApplyButton && (
            <div className='flex items-center justify-between p-3 border-t'>
              <div className='text-sm text-muted-foreground'>
                {tempDateRange?.from && tempDateRange?.to
                  ? `Selected: ${formatDateRange(tempDateRange)}`
                  : 'Select date range'}
              </div>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  onClick={handleApply}
                  disabled={!tempDateRange?.from}
                  className='h-8'
                >
                  Apply
                </Button>
              </div>
            </div>
          )}

          {/* Simple clear button for immediate updates */}
          {!showApplyButton && showClearButton && isActive && (
            <div className='border-t p-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleClear}
                className='w-full'
              >
                Clear Selection
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
