'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search } from 'lucide-react';
import { DynamicIcon, getAllIconNames, searchIcons, formatIconName } from '@/lib/utils/dynamic-icon-loader';

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
}

export function IconPicker({ value, onChange, placeholder = 'Select an icon' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 60 }); // Show 60 icons initially (10 rows)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get all Lucide icons from dynamicIconImports (kebab-case names)
  const allIcons = useMemo(() => getAllIconNames(), []);

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery) return allIcons;
    return searchIcons(searchQuery);
  }, [allIcons, searchQuery]);

  // Constants for virtualization
  const ICON_SIZE = 48; // h-12 = 48px
  const GAP = 8; // gap-2 = 8px
  const COLS = 6;
  const ITEM_HEIGHT = ICON_SIZE + GAP;
  const ITEMS_PER_ROW = COLS;
  const OVERSCAN = 3; // Number of extra rows to render above/below viewport

  // Calculate total height for virtual scrolling
  const totalRows = Math.ceil(filteredIcons.length / ITEMS_PER_ROW);
  const totalHeight = totalRows * ITEM_HEIGHT;

  // Handle scroll event to update visible range
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const scrollTop = scrollContainerRef.current.scrollTop;
    const viewportHeight = scrollContainerRef.current.clientHeight;

    const startRow = Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN;
    const endRow = Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN;

    const start = Math.max(0, startRow * ITEMS_PER_ROW);
    const end = Math.min(filteredIcons.length, endRow * ITEMS_PER_ROW);

    setVisibleRange({ start, end });
  };

  // Reset visible range when search query changes
  useEffect(() => {
    setVisibleRange({ start: 0, end: 60 });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [searchQuery]);

  // Get visible icons
  const visibleIcons = filteredIcons.slice(visibleRange.start, visibleRange.end);
  const offsetY = Math.floor(visibleRange.start / ITEMS_PER_ROW) * ITEM_HEIGHT;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start"
        >
          {value ? (
            <div className="flex items-center gap-2">
              <DynamicIcon name={value} className="h-4 w-4" />
              <span>{formatIconName(value)}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="flex flex-col gap-2 p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div 
            ref={scrollContainerRef}
            className="h-[300px] overflow-y-scroll overflow-x-hidden scrollbar-thin"
            onScroll={handleScroll}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
              <div 
                className="grid grid-cols-6 gap-2 p-2"
                style={{ 
                  transform: `translateY(${offsetY}px)`,
                  position: 'absolute',
                  width: '100%'
                }}
              >
                {visibleIcons.map((iconName) => (
                  <Button
                    key={iconName}
                    variant={value === iconName ? 'default' : 'ghost'}
                    size="sm"
                    className="h-12 w-12 p-0 flex flex-col items-center justify-center"
                    onClick={() => {
                      onChange(iconName);
                      setOpen(false);
                      setSearchQuery('');
                    }}
                    title={formatIconName(iconName)}
                  >
                    <DynamicIcon name={iconName} className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No icons found
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground text-center border-t pt-2">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
