/**
 * Action Service Types
 * Defines types for dynamic actions based on menu permissions
 */

export interface ActionData {
  id?: string | number;
  [key: string]: unknown;
}

export interface ActionConfig<T = ActionData> {
  code: string;
  label: string;
  icon?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showInHeader?: boolean;
  showInTable?: boolean;
  showInDropdown?: boolean;
  requiresConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
  showCondition?: (data?: T) => boolean;
  disabled?: boolean | ((data?: T) => boolean);
  onClick: (data?: T) => void;
}

export interface ActionGroup<T = ActionData> {
  header: string;
  actions: ActionConfig<T>[];
}

export interface ActionServiceConfig {
  currentPath: string;
  actions: ActionConfig[];
  groups?: ActionGroup[];
}

/**
 * Action Service Class
 */
export class ActionService {
  private static instance: ActionService;
  private readonly actionConfigs: Map<string, ActionConfig[]> = new Map();
  private readonly permissionUpdateListeners: Set<() => void> = new Set();

  static getInstance(): ActionService {
    if (!ActionService.instance) {
      ActionService.instance = new ActionService();
    }
    return ActionService.instance;
  }

  /**
   * Add a listener for permission updates
   */
  addPermissionUpdateListener(listener: () => void): () => void {
    this.permissionUpdateListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.permissionUpdateListeners.delete(listener);
    };
  }

  /**
   * Register actions for a specific path
   */
  registerActions(path: string, actions: ActionConfig[]): void {
    this.actionConfigs.set(path, actions);
  }

  /**
   * Get actions for a specific path
   */
  getActionsForPath(path: string): ActionConfig[] {
    return this.actionConfigs.get(path) || [];
  }

  /**
   * Clear actions for a specific path
   */
  clearActions(path: string): void {
    this.actionConfigs.delete(path);
  }

  /**
   * Clear all actions
   */
  clearAllActions(): void {
    this.actionConfigs.clear();
  }

  /**
   * Filter actions based on permissions
   */
  filterActionsByPermissions<T = ActionData>(
    actions: ActionConfig<T>[],
    hasPermission: (code: string) => boolean
  ): ActionConfig<T>[] {
    return actions.filter(action => {
      // Check if user has permission for this action
      return hasPermission(action.code);
    });
  }
}

// Export singleton instance
export const actionService = ActionService.getInstance();
