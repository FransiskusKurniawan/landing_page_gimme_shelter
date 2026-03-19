'use client';

import { useMenuStore } from '../stores/menu-store';

/**
 * Hook to check if the user has permission for a specific menu action
 * @param menuCode - The code of the menu (e.g., "USER", "ROLE", "BRAND")
 * @param actionCode - The action code (e.g., "VIEW", "CREATE", "EDIT", "DELETE")
 * @returns boolean indicating if the user has permission
 * 
 * @example
 * const canCreateUser = usePermission('USER', 'CREATE');
 * const canEditRole = usePermission('ROLE', 'EDIT');
 */
export function usePermission(menuCode: string, actionCode: string): boolean {
  const hasPermission = useMenuStore((state) => state.hasPermission);
  return hasPermission(menuCode, actionCode);
}

/**
 * Hook to check multiple permissions at once
 * @param permissions - Array of [menuCode, actionCode] tuples
 * @returns Object with permission results
 * 
 * @example
 * const { canView, canCreate, canEdit } = usePermissions({
 *   canView: ['USER', 'VIEW'],
 *   canCreate: ['USER', 'CREATE'],
 *   canEdit: ['USER', 'EDIT'],
 * });
 */
export function usePermissions<T extends Record<string, [string, string]>>(
  permissions: T
): Record<keyof T, boolean> {
  const hasPermission = useMenuStore((state) => state.hasPermission);
  
  const result = {} as Record<keyof T, boolean>;
  
  for (const [key, [menuCode, actionCode]] of Object.entries(permissions)) {
    result[key as keyof T] = hasPermission(menuCode, actionCode);
  }
  
  return result;
}
