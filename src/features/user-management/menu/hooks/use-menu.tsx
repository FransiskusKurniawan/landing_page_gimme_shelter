import { useState, useCallback } from 'react';
import { menuService } from '../services';
import { useMenuStore } from '../stores/menu-store';
import {
  MenuListParams,
  CreateMenuRequest,
  UpdateMenuRequest,
  Menu,
} from '../types/menu-type';
import { GlobalErrorHandler } from '@/lib/errors';

export const useMenu = (token: string) => {
  const {
    menus,
    selectedMenu,
    isLoading,
    error,
    pagination,
    setMenus,
    setSelectedMenu,
    setLoading,
    setError,
    setPagination,
    clearError,
  } = useMenuStore();

  const [availableParentMenus, setAvailableParentMenus] = useState<Menu[]>([]);

  const fetchMenus = useCallback(
    async (params: MenuListParams = {}) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await menuService.getMenus(params, token);
        setMenus(response.data);
        setPagination(response.meta.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menus';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setMenus, setPagination, setLoading, setError, clearError]
  );

  const fetchMenuById = useCallback(
    async (id: number) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await menuService.getMenuById(id, token);
        setSelectedMenu(response.data);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu details';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setSelectedMenu, setLoading, setError, clearError]
  );

  const fetchMenuAddData = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    clearError();

    try {
      const response = await menuService.getMenuAddData(token);
      setAvailableParentMenus(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available parent menus';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, setError, clearError]);

  const createMenu = useCallback(
    async (data: CreateMenuRequest) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await menuService.createMenu(data, token);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create menu';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  const updateMenu = useCallback(
    async (id: number, data: UpdateMenuRequest) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await menuService.updateMenu(id, data, token);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update menu';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  const deleteMenu = useCallback(
    async (id: number) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await menuService.deleteMenu(id, token);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  return {
    menus,
    selectedMenu,
    isLoading,
    error,
    pagination,
    availableParentMenus,
    fetchMenus,
    fetchMenuById,
    fetchMenuAddData,
    createMenu,
    updateMenu,
    deleteMenu,
    clearError,
  };
};
