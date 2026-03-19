'use client';

import { useMenuSearch } from '@/lib/hooks/common/use-menu-search';
import { MenuSearchDropdown } from './menu-search-dropdown';
import { useLanguage } from '@/components/providers/language-provider';

interface MenuSearchProps {
  className?: string;
}

/**
 * Menu Search Component
 * 
 * Features:
 * - Real-time menu search with debouncing
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Keyboard shortcut (press '/' to focus)
 * - Permission-based filtering
 * - Responsive dropdown results
 */
export function MenuSearch({ className }: MenuSearchProps) {
  const { t } = useLanguage();
  const {
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
    setShowResults,
  } = useMenuSearch({
    debounceMs: 150,
    minQueryLength: 1,
    enableKeyboardShortcut: true,
    shortcutKey: '/',
  });

  return (
    <MenuSearchDropdown
      searchQuery={searchQuery}
      menuResults={menuResults}
      isSearching={isSearching}
      showResults={showResults}
      selectedIndex={selectedIndex}
      isNavigating={isNavigating}
      inputRef={inputRef}
      itemRefs={itemRefs}
      handleInputChange={handleInputChange}
      handleKeyDown={handleKeyDown}
      handleMenuSelect={handleMenuSelect}
      onClose={() => setShowResults(false)}
      placeholder={t('common.search_placeholder')}
      className={className}
      maxHeight='max-h-80'
      showKeyboardShortcuts={true}
    />
  );
}
