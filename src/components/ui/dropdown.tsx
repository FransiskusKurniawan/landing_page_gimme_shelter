'use client';

import * as React from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface DropdownItem {
  id: string;
  label: string;
  checked?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  onItemChange: (id: string, checked: boolean) => void;
  placeholder?: string;
  maxHeight?: number;
  variant?: 'default' | 'outline' | 'ghost';
  triggerIcon?: React.ReactNode;
  showBadge?: boolean;
  customBadgeContent?: string;
  hideBadgeWhenEmpty?: boolean;
  align?: 'start' | 'end' | 'center';
  className?: string;
  disabled?: boolean;
}

export function Dropdown({
  items,
  onItemChange,
  placeholder = 'Select',
  maxHeight = 300,
  variant = 'outline',
  triggerIcon,
  showBadge = false,
  customBadgeContent,
  hideBadgeWhenEmpty = false,
  align = 'start',
  className,
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const checkedCount = items.filter((item) => item.checked).length;
  const shouldShowBadge = showBadge && (!hideBadgeWhenEmpty || checkedCount > 0);

  const filteredItems = React.useMemo(() => {
    if (!searchTerm.trim()) return items;
    const lowercaseSearch = searchTerm.toLowerCase();
    return items.filter((item) =>
      item.label.toLowerCase().includes(lowercaseSearch)
    );
  }, [items, searchTerm]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            'h-9 justify-between font-normal transition-all',
            open && 'border-primary ring-1 ring-primary/20',
            checkedCount > 0 && 'border-primary/50 bg-primary/5',
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            {triggerIcon}
            <span className={cn(checkedCount === 0 && 'text-muted-foreground')}>
              {placeholder}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {shouldShowBadge && (
              <Badge
                variant="default"
                className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px] bg-primary hover:bg-primary"
              >
                {customBadgeContent || checkedCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 opacity-50 transition-transform duration-200',
                open && 'rotate-180 opacity-100'
              )}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="p-0 w-72" style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}>
        {/* Search Input */}
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={searchInputRef}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-7 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="ml-2 h-4 w-4 opacity-50 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Items List */}
        <div
          className="overflow-y-auto overflow-x-hidden p-1"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            filteredItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={(e) => {
                  e.preventDefault();
                  onItemChange(item.id, !item.checked);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer',
                  item.checked && 'bg-primary/10 text-primary focus:bg-primary/20 focus:text-primary'
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border border-primary transition-colors',
                    item.checked
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50'
                  )}
                >
                  {item.checked && <Check className="h-3 w-3" strokeWidth={3} />}
                </div>
                <span className={cn('flex-1 truncate', item.checked && 'font-medium')}>
                  {item.label}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
