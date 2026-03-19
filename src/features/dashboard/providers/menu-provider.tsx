'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMenuStore } from '../stores/menu-store';
import { useAuthStore } from '@/features/auth/stores/auth-store';

interface MenuContextValue {
  isLoading: boolean;
  error: string | null;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { fetchMenus, refreshMenus, isLoading, error, menus } = useMenuStore();
  const lastFetchedAt = useMenuStore(state => state._lastFetchedAt);
  const isStale = useMenuStore(state => state._isStale);
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const TTL_MS = 1000 * 60 * 5; // 5 minutes TTL
    const now = Date.now();
    const expired = !lastFetchedAt || now - lastFetchedAt > TTL_MS;

    console.log('[MenuProvider] State:', {
      isMounted,
      isAuthenticated,
      hasToken: !!token,
      menusCount: menus.length,
      isLoading,
      lastFetchedAt,
      expired,
      isStale,
    });

    // Initial / expired / stale fetch conditions
    if (
      isMounted &&
      isAuthenticated &&
      token &&
      !isLoading &&
      (menus.length === 0 || expired || isStale)
    ) {
      console.log('[MenuProvider] Fetching menus (initial/stale/expired)...');
      fetchMenus(token);
    }
  }, [isMounted, isAuthenticated, token, fetchMenus, menus.length, isLoading, lastFetchedAt, isStale]);

  // Listen for cross-tab permission updates (e.g., role changed in another tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'device-monitoring-menu-storage') {
        console.log('[MenuProvider] Detected external menu storage change. Forcing refresh.');
        if (token) refreshMenus(token);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refreshMenus, token]);

  return (
    <MenuContext.Provider value={{ isLoading, error }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
