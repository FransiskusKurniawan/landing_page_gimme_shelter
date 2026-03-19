import { create } from 'zustand';
import { Menu } from '../types/menu-type';

interface MenuState {
  menus: Menu[];
  selectedMenu: Menu | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  setMenus: (menus: Menu[]) => void;
  setSelectedMenu: (menu: Menu | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { total: number; page: number; limit: number }) => void;
  clearError: () => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menus: [],
  selectedMenu: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
  setMenus: (menus) => set({ menus }),
  setSelectedMenu: (menu) => set({ selectedMenu: menu }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  clearError: () => set({ error: null }),
}));
