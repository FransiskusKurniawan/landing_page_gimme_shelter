'use client';

import { useMenuStore } from '../stores/menu-store';
import { MenuItem } from '../types/menu-type';

export function useMenuData() {
  const { menus, isLoading, error, hasPermission } = useMenuStore();

  // Helper: check menu visibility by permission
  const canViewMenu = (item: MenuItem) => hasPermission(item.code, 'VIEW');

  // Get active menus only and filter by view permission
  const activeMenus = menus.filter((menu) => menu.is_active && canViewMenu(menu));

  // Sort menus by order_no
  const sortedMenus = [...activeMenus].sort((a, b) => a.order_no - b.order_no);

  // Recursive function to sort children
  const sortChildren = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => item.is_active && canViewMenu(item))
      .sort((a, b) => a.order_no - b.order_no)
      .map((item) => ({
        ...item,
        children: item.children ? sortChildren(item.children) : undefined,
      }));
  };

  const menusWithSortedChildren = sortedMenus.map((menu) => ({
    ...menu,
    children: menu.children ? sortChildren(menu.children) : undefined,
  }));

  return {
    menus: menusWithSortedChildren,
    isLoading,
    error,
    hasPermission,
  };
}
