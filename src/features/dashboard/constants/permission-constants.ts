/**
 * Common action type codes used throughout the application
 * These match the backend action_type codes
 */
export const ActionCodes = {
  VIEW: 'VIEW',
  CREATE: 'CREATE',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
  DETAIL: 'DETAIL',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
} as const;

/**
 * Common menu codes used throughout the application
 * These match the backend menu codes
 */
export const MenuCodes = {
  // User Management
  USER_MGMT: 'USER_MGMT',
  USER: 'USER',
  ROLE: 'ROLE',
  MENU: 'MENU',
  
  // Device Management
  DEVICE: 'DEVICE',
  BRAND: 'BRAND',
} as const;

export type ActionCode = typeof ActionCodes[keyof typeof ActionCodes];
export type MenuCode = typeof MenuCodes[keyof typeof MenuCodes];
