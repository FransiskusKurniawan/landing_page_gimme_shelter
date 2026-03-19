'use client';

import { usePermission } from './use-permission';
import { useMenuStore } from '../stores/menu-store';
import { ActionCodes } from '../constants/permission-constants';
import { useEffect, useMemo } from 'react';

/**
 * Hook to get all action permissions for a specific menu
 * Returns an object with boolean flags for each action type
 * Also returns isLoading state to handle async menu data loading
 * 
 * @param menuCode - The code of the menu (e.g., "USER", "ROLE", "MENU")
 * @returns Object with permission flags for all actions and loading state
 * 
 * @example
 * const { permissions, isLoading } = useActionPermissions('USER');
 * // Returns: { permissions: { canView, canCreate, ... }, isLoading: boolean }
 * 
 * // Use in component:
 * {!isLoading && permissions.canCreate && <Button onClick={onCreate}>Create</Button>}
 * {!isLoading && permissions.canEdit && <Button onClick={onEdit}>Edit</Button>}
 */
export function useActionPermissions(menuCode: string) {
  const menus = useMenuStore((state) => state.menus);
  const isLoading = useMenuStore((state) => state.isLoading);
  
  const canView = usePermission(menuCode, ActionCodes.VIEW);
  const canCreate = usePermission(menuCode, ActionCodes.CREATE);
  const canEdit = usePermission(menuCode, ActionCodes.EDIT);
  const canDelete = usePermission(menuCode, ActionCodes.DELETE);
  const canDetail = usePermission(menuCode, ActionCodes.DETAIL);
  const canExport = usePermission(menuCode, ActionCodes.EXPORT);
  const canImport = usePermission(menuCode, ActionCodes.IMPORT);

  // Check if menus are loaded
  const menusLoaded = menus.length > 0;

  // Debug logging
  useEffect(() => {
    // Keep minimal debug to avoid noisy logs and rerenders
    console.log('[useActionPermissions]', { menuCode, menusCount: menus.length, isLoading });
  }, [menuCode, menus.length, isLoading]);

  const memoPermissions = useMemo(() => ({
    canView,
    canCreate,
    canEdit,
    canDelete,
    canDetail,
    canExport,
    canImport,
  }), [canView, canCreate, canEdit, canDelete, canDetail, canExport, canImport]);

  return {
  permissions: memoPermissions,
    isLoading: isLoading || !menusLoaded,
  };
}

/**
 * Type for action permissions object
 */
export interface ActionPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDetail: boolean;
  canExport: boolean;
  canImport: boolean;
}

/**
 * Type for the return value of useActionPermissions hook
 */
export interface UseActionPermissionsReturn {
  permissions: ActionPermissions;
  isLoading: boolean;
}
