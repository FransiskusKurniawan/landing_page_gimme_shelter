'use client';

import { Search, Menu as MenuIcon, ArrowRight, Keyboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/utils';
import { getIconByName } from '@/lib/utils/icon-utils';
import type { MenuSearchResult } from '@/lib/hooks/common/use-menu-search';

export interface MenuSearchDropdownProps {
  // State
  searchQuery: string;
  menuResults: MenuSearchResult[];
  isSearching: boolean;
  showResults: boolean;
  selectedIndex: number;
  isNavigating: boolean;

  // Refs
  inputRef: React.RefObject<HTMLInputElement | null>;
  itemRefs: React.RefObject<(HTMLDivElement | null)[]>;

  // Actions
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleMenuSelect: (url: string) => Promise<void>;
  onClose?: () => void;

  // UI Props
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  showKeyboardShortcuts?: boolean;
}

export function MenuSearchDropdown({
  searchQuery,
  menuResults,
  isSearching,
  showResults,
  selectedIndex,
  isNavigating,
  inputRef,
  itemRefs,
  handleInputChange,
  handleKeyDown,
  handleMenuSelect,
  onClose,
  placeholder = 'Search menus... (Press / to focus)',
  className,
  maxHeight = 'max-h-80',
  showKeyboardShortcuts = true,
}: MenuSearchDropdownProps) {
  const getPlaceholder = () => {
    if (isSearching) {
      return 'Searching...';
    }
    return placeholder;
  };

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          ref={inputRef}
          type='text'
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className='pl-9 pr-4 h-9 text-sm rounded-md border focus:border-primary transition-colors'
          disabled={isNavigating}
        />
        {isSearching && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {showResults && (
        <div className='absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-lg shadow-xl'>
          <div className={cn('overflow-auto', maxHeight)}>
            {menuResults.length > 0 ? (
              <>
                {/* Header */}
                <div className='px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-muted/50'>
                  <MenuIcon className='h-3 w-3 inline mr-1.5' />
                  Found {menuResults.length} menu{menuResults.length !== 1 ? 's' : ''}
                </div>

                {/* Menu Results */}
                <div className='py-1'>
                  {menuResults.map((menu, index) => {
                    const isSelected = index === selectedIndex;
                    const Icon = getIconByName(menu.icon);

                    return (
                      <div
                        key={menu.id}
                        ref={el => {
                          itemRefs.current[index] = el;
                        }}
                        onClick={() => {
                          if (!isNavigating) {
                            handleMenuSelect(menu.url);
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!isNavigating) {
                              handleMenuSelect(menu.url);
                            }
                          }
                        }}
                        role='button'
                        tabIndex={0}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 transition-all duration-150',
                          isNavigating
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer',
                          isSelected
                            ? 'bg-primary/10 text-primary border-l-2 border-primary'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-sm truncate'>
                            {menu.name}
                          </div>
                          {menu.parentName && (
                            <div className='text-xs text-muted-foreground truncate mt-0.5'>
                              {menu.parentName} › {menu.name}
                            </div>
                          )}
                        </div>
                        <ArrowRight className='h-3.5 w-3.5 text-muted-foreground flex-shrink-0' />
                        {isSelected && (
                          <div className='absolute right-2 top-1/2 -translate-y-1/2'>
                            <kbd className='px-1.5 py-0.5 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded'>
                              ↵
                            </kbd>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Keyboard Shortcuts Footer */}
                {showKeyboardShortcuts && (
                  <div className='px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-1'>
                        <kbd className='px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded'>
                          ↑
                        </kbd>
                        <kbd className='px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded'>
                          ↓
                        </kbd>
                        <span className='ml-1'>Navigate</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <kbd className='px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded'>
                          ↵
                        </kbd>
                        <span className='ml-1'>Select</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <kbd className='px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded'>
                          Esc
                        </kbd>
                        <span className='ml-1'>Close</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Keyboard className='h-3 w-3' />
                      <kbd className='px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded'>
                        /
                      </kbd>
                      <span>to focus</span>
                    </div>
                  </div>
                )}
              </>
            ) : searchQuery.trim().length > 0 ? (
              <div className='p-4 text-center text-sm text-muted-foreground'>
                <MenuIcon className='h-8 w-8 mx-auto mb-2 opacity-50' />
                <div className='font-medium'>No menus found</div>
                <div className='text-xs mt-1'>
                  Try a different search term
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
