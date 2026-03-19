import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchQuery } from '../../data/search';

interface UseSearchProps {
  onSearch: (query: SearchQuery) => void;
  initialQuery?: string;
  initialColumn?: string;
  debounceMs?: number;
}

export const useSearch = ({
  onSearch,
  initialQuery = '',
  initialColumn = 'all',
  debounceMs = 500,
}: UseSearchProps) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [searchColumn, setSearchColumn] = useState(initialColumn);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchTerm(query);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced search
      debounceTimerRef.current = setTimeout(() => {
        onSearch({
          query,
          column: searchColumn,
        });
      }, debounceMs);
    },
    [searchColumn, onSearch, debounceMs]
  );

  const handleSearchColumnChange = useCallback(
    (column: string) => {
      setSearchColumn(column);

      // Trigger search immediately with new column if there's a search term
      if (searchTerm) {
        onSearch({
          query: searchTerm,
          column,
        });
      }
    },
    [searchTerm, onSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    onSearch({
      query: '',
      column: searchColumn,
    });
  }, [searchColumn, onSearch]);

  return {
    searchTerm,
    searchColumn,
    handleSearchChange,
    handleSearchColumnChange,
    clearSearch,
  };
};
