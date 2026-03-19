import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MenuState, MenuItem } from '../types/menu-type';
import { menuService } from '../services/menu-service';
import { ApiErrorHandler } from '@/lib/errors';

interface MenuActions {
  fetchMenus: (token: string) => Promise<void>;
  refreshMenus: (token: string) => Promise<void>; // Force re-fetch ignoring cache conditions
  setMenus: (menus: MenuItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  hasPermission: (menuCode: string, actionCode: string) => boolean;
  clearMenus: () => void;
  markStale: () => void; // Flag menus as stale to trigger refresh
}

export const useMenuStore = create<MenuState & MenuActions>()(
  persist(
    (set, get) => ({
      // State
  menus: [],
  isLoading: false,
  error: null,
  // Internal metadata (not exported via type yet but partialized selectively)
  _lastFetchedAt: 0,
  _isStale: true,

      // Actions
      fetchMenus: async (token: string) => {
        console.log('[menu-store] fetchMenus called with token:', !!token);
        set({ isLoading: true, error: null });

        try {
          const response = await menuService.getMenus(token);
          console.log('[menu-store] Menus fetched successfully:', response.data.length);
          set({
            menus: response.data,
            isLoading: false,
            error: null,
            _lastFetchedAt: Date.now(),
            _isStale: false,
          });
        } catch (error) {
          console.error('[menu-store] Failed to fetch menus:', error);
          const appError = ApiErrorHandler.handleAuth(error, {
            fallbackMessage: 'Failed to fetch menus',
            context: { module: 'menu-store', action: 'fetchMenus' },
          });

          set({
            isLoading: false,
            error: appError.message,
            menus: [],
            _isStale: true,
          });
        }
      },

      refreshMenus: async (token: string) => {
        // Force re-fetch regardless of existing menus
        console.log('[menu-store] refreshMenus forcing menu reload');
        await get().fetchMenus(token);
      },

      setMenus: (menus: MenuItem[]) => {
        set({ menus });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      clearMenus: () => {
        set({ menus: [], isLoading: false, error: null, _isStale: true, _lastFetchedAt: 0 });
      },

      markStale: () => {
        set({ _isStale: true });
      },

      hasPermission: (menuCode: string, actionCode: string) => {
        const { menus } = get();

        // Fast path: no menus yet
        if (!menus || menus.length === 0) {
          return false;
        }

        // Build a map for quick lookups to avoid repeated deep traversal
        // Cache map in a module-level WeakMap keyed by the current array reference
        const MENU_CACHE = (globalThis as any).__MENU_LOOKUP_CACHE__ || new WeakMap();
        if (!(globalThis as any).__MENU_LOOKUP_CACHE__) {
          (globalThis as any).__MENU_LOOKUP_CACHE__ = MENU_CACHE;
        }

        type CacheVal = { byCode: Map<string, MenuItem> };
        let cache: CacheVal | undefined = MENU_CACHE.get(menus);
        if (!cache) {
          const byCode = new Map<string, MenuItem>();
          const walk = (items: MenuItem[]) => {
            for (const item of items) {
              byCode.set(item.code, item);
              if (item.children && item.children.length) walk(item.children);
            }
          };
          walk(menus);
          cache = { byCode };
          MENU_CACHE.set(menus, cache);
        }

        const menu = cache.byCode.get(menuCode);
        if (!menu) {
          return false;
        }

        const action = menu.actions.find(
          (a) => a.action_type.code === actionCode && a.is_active
        );
        return Boolean(action?.allowed);
      },
    }),
    {
      name: 'device-monitoring-menu-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist menus & metadata to allow TTL based revalidation
      partialize: (state) => ({
        menus: state.menus,
        _lastFetchedAt: (state as any)._lastFetchedAt,
      }),
      // Version bump could be used later for migrations
    }
  )
);
