/**
 * useTableActions Hook
 * Provides dynamic actions based on menu permissions
 */

import React, { useMemo, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import {
  actionService,
  type ActionConfig,
  type ActionGroup,
  type ActionData,
} from '@/lib/services/action-service';

export interface UseTableActionsOptions<T = ActionData> {
  actions?: ActionConfig<T>[];
  groups?: ActionGroup<T>[];
  autoRegister?: boolean;
}

export interface UseTableActionsReturn<T = ActionData> {
  // Available actions
  availableActions: ActionConfig<T>[];
  headerActions: ActionConfig<T>[];
  tableActions: ActionConfig<T>[];
  dropdownActions: ActionConfig<T>[];
  actionGroups: ActionGroup<T>[];

  // Permission checks
  hasPermission: (actionCode: string) => boolean;
  canAccessAction: (actionCode: string) => boolean;

  // Action management
  registerActions: (actions: ActionConfig<T>[]) => void;
  clearActions: () => void;

  // Current state
  currentPath: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to manage table actions with permission checks
 */
export function useTableActions<T = ActionData>(
  actionConfigs: ActionConfig<T>[],
  options: UseTableActionsOptions<T> = {}
): UseTableActionsReturn<T> {
  const pathname = usePathname();
  const { hasPermission: menuHasPermission, isLoading: menuLoading, error: menuError } = useMenuStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permission check function that works with the menu store
  const hasPermission = React.useCallback(
    (actionCode: string) => {
      // Map action codes to menu permission format
      // The menu store expects (menuCode, actionCode) format
      // We need to determine the menu code from the current path
      
      // Extract menu code from pathname
      // For paths like '/user-management/roles' -> 'ROLE'
      // For paths like '/user-management/users' -> 'USER'  
      // For paths like '/user-management/menus' -> 'MENU'
      
      let menuCode = '';
      if (pathname.includes('/role')) {
        menuCode = 'ROLE';
      } else if (pathname.includes('/user')) {
        menuCode = 'USER';
      } else if (pathname.includes('/menu')) {
        menuCode = 'MENU';
      } else {
        // Default fallback - try to extract from pathname
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length - 1];
        menuCode = lastSegment.toUpperCase();
      }

      // Map action codes to menu action types
      let menuActionCode = actionCode;
      switch (actionCode) {
        case 'DETAIL':
          menuActionCode = 'DETAIL';
          break;
        case 'EDIT':
          menuActionCode = 'EDIT';
          break;
        case 'DELETE':
          menuActionCode = 'DELETE';
          break;
        case 'CREATE':
          menuActionCode = 'CREATE';
          break;
        default:
          menuActionCode = actionCode;
      }

      return menuHasPermission(menuCode, menuActionCode);
    },
    [pathname, menuHasPermission]
  );

  // Filter actions based on permissions
  const availableActions = useMemo(() => {
    return actionService.filterActionsByPermissions(actionConfigs, hasPermission);
  }, [actionConfigs, hasPermission]);

  // Separate actions by their intended display location
  const { headerActions, tableActions, dropdownActions } = useMemo(() => {
    return {
      headerActions: availableActions.filter(action => action.showInHeader !== false),
      tableActions: availableActions.filter(action => action.showInTable !== false),
      dropdownActions: availableActions.filter(action => action.showInDropdown !== false),
    };
  }, [availableActions]);

  // Action groups (if provided)
  const actionGroups = useMemo(() => {
    if (!options.groups) return [];
    
    return options.groups.map(group => ({
      ...group,
      actions: actionService.filterActionsByPermissions(group.actions, hasPermission),
    })).filter(group => group.actions.length > 0);
  }, [options.groups, hasPermission]);

  // Register actions if autoRegister is enabled
  useEffect(() => {
    if (options.autoRegister && actionConfigs.length > 0) {
      actionService.registerActions(pathname, actionConfigs as ActionConfig[]);
    }

    return () => {
      if (options.autoRegister) {
        actionService.clearActions(pathname);
      }
    };
  }, [pathname, actionConfigs, options.autoRegister]);

  // Action management functions
  const registerActions = React.useCallback(
    (actions: ActionConfig<T>[]) => {
      actionService.registerActions(pathname, actions as ActionConfig[]);
    },
    [pathname]
  );

  const clearActions = React.useCallback(() => {
    actionService.clearActions(pathname);
  }, [pathname]);

  // Alias for hasPermission for backward compatibility
  const canAccessAction = hasPermission;

  return {
    availableActions,
    headerActions,
    tableActions,
    dropdownActions,
    actionGroups,
    hasPermission,
    canAccessAction,
    registerActions,
    clearActions,
    currentPath: pathname,
    isLoading: isLoading || menuLoading,
    error: error || menuError,
  };
}
