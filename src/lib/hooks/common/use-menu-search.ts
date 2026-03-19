'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import { MenuItem } from '@/features/dashboard/types/menu-type';

export interface MenuSearchResult {
  id: number;
  name: string;
  icon: string;
  url: string;
  level: number;
  parentId?: number;
  parentName?: string;
}

export interface UseMenuSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  enableKeyboardShortcut?: boolean;
  shortcutKey?: string;
}

export interface UseMenuSearchReturn {
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
  setShowResults: (show: boolean) => void;
  clearResults: () => void;
  focusInput: () => void;
}

const defaultOptions: Required<UseMenuSearchOptions> = {
  debounceMs: 150,
  minQueryLength: 1,
  enableKeyboardShortcut: true,
  shortcutKey: '/',
};

/**
 * Custom hook for searching menu items
 * Features:
 * - Real-time search with debouncing
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Keyboard shortcut (default: '/')
 * - Navigation to selected menu
 */
export function useMenuSearch(
  options: UseMenuSearchOptions = {}
): UseMenuSearchReturn {
  const opts = { ...defaultOptions, ...options };

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [menuResults, setMenuResults] = useState<MenuSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Dependencies
  const router = useRouter();
  const menus = useMenuStore(state => state.menus);
  const hasPermission = useMenuStore(state => state.hasPermission);

  /**
   * Flatten menu tree and filter by search query
   */
  const searchMenus = useCallback(
    (query: string): MenuSearchResult[] => {
      if (!query || query.length < opts.minQueryLength) {
        return [];
      }

      const results: MenuSearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      const flattenMenus = (
        items: MenuItem[],
        level: number = 0,
        parent?: MenuItem
      ) => {
        for (const item of items) {
          // Check if user has VIEW permission
          const hasViewPermission = hasPermission(item.code, 'VIEW');
          if (!hasViewPermission) {
            continue;
          }

          // Check if menu name matches query
          if (item.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              id: item.id,
              name: item.name,
              icon: item.icon,
              url: item.url_path,
              level,
              parentId: parent?.id,
              parentName: parent?.name,
            });
          }

          // Recursively search children
          if (item.children && item.children.length > 0) {
            flattenMenus(item.children, level + 1, item);
          }
        }
      };

      flattenMenus(menus);

      // Sort by relevance (exact match first, then by level)
      return results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === lowerQuery;
        const bExact = b.name.toLowerCase() === lowerQuery;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by level (top-level menus first)
        return a.level - b.level;
      });
    },
    [menus, hasPermission, opts.minQueryLength]
  );

  /**
   * Handle search with debouncing
   */
  const performSearch = useCallback(
    (query: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      setIsSearching(true);

      debounceTimer.current = setTimeout(() => {
        const results = searchMenus(query);
        setMenuResults(results);
        setIsSearching(false);
        setShowResults(true);
        setSelectedIndex(-1);
      }, opts.debounceMs);
    },
    [searchMenus, opts.debounceMs]
  );

  /**
   * Handle input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (value.trim().length === 0) {
        setMenuResults([]);
        setShowResults(false);
        setSelectedIndex(-1);
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      } else {
        performSearch(value);
      }
    },
    [performSearch]
  );

  /**
   * Handle menu selection and navigation
   */
  const handleMenuSelect = useCallback(
    async (url: string) => {
      setIsNavigating(true);
      setShowResults(false);

      try {
        await router.push(url);
        setSearchQuery('');
        setMenuResults([]);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsNavigating(false);
      }
    },
    [router]
  );

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showResults || menuResults.length === 0) {
        if (e.key === 'Escape') {
          setShowResults(false);
          inputRef.current?.blur();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < menuResults.length - 1 ? prev + 1 : prev
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < menuResults.length) {
            const selectedMenu = menuResults[selectedIndex];
            handleMenuSelect(selectedMenu.url);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setShowResults(false);
          setSearchQuery('');
          setMenuResults([]);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [showResults, menuResults, selectedIndex, handleMenuSelect]
  );

  /**
   * Scroll selected item into view
   */
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  /**
   * Keyboard shortcut
   */
  useEffect(() => {
    if (!opts.enableKeyboardShortcut) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus input when pressing the shortcut key (but not in input fields)
      if (
        e.key === opts.shortcutKey &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        const target = e.target as HTMLElement;
        const isInput =
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable;

        if (!isInput) {
          e.preventDefault();
          inputRef.current?.focus();
          setShowResults(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [opts.enableKeyboardShortcut, opts.shortcutKey]);

  /**
   * Close results when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInsideSearch =
        inputRef.current?.contains(target) ||
        itemRefs.current.some(ref => ref?.contains(target));

      if (!isInsideSearch) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setSearchQuery('');
    setMenuResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  }, []);

  /**
   * Focus input
   */
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
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
    clearResults,
    focusInput,
  };
}
