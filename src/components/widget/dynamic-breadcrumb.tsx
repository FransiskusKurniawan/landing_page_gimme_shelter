'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useMenuData } from '@/features/dashboard/hooks/use-menu';
import { MenuItem } from '@/features/dashboard/types/menu-type';
import { useLanguage } from '@/components/providers/language-provider';

interface BreadcrumbSegment {
  label: string;
  href: string;
  isActive: boolean;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const { menus } = useMenuData();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Function to find menu item and build breadcrumb path
  const findMenuPath = (
    items: MenuItem[],
    targetPath: string,
    currentPath: BreadcrumbSegment[] = []
  ): BreadcrumbSegment[] | null => {
    for (const item of items) {
      const newPath = [
        ...currentPath,
        {
          label: item.name,
          href: item.url_path,
          isActive: item.url_path === targetPath,
        },
      ];

      // If this is the target path, return the path
      if (item.url_path === targetPath) {
        return newPath;
      }

      // If the current pathname starts with this menu's path, it could be the parent
      if (targetPath.startsWith(item.url_path + '/')) {
        // Check children first
        if (item.children && item.children.length > 0) {
          const childPath = findMenuPath(item.children, targetPath, newPath);
          if (childPath) {
            return childPath;
          }
        }
        // If no matching child found but path starts with this menu, return this path
        return newPath;
      }

      // Search in children
      if (item.children && item.children.length > 0) {
        const childPath = findMenuPath(item.children, targetPath, newPath);
        if (childPath) {
          return childPath;
        }
      }
    }

    return null;
  };

  // Get breadcrumb segments
  const getBreadcrumbs = (): BreadcrumbSegment[] => {
    // 1. Try to find the current path in menus if mounted
    if (isMounted && menus.length > 0) {
      const menuPath = findMenuPath(menus, pathname);
      if (menuPath && menuPath.length > 0) {
        return menuPath;
      }
    }

    // 2. Fallback for Dashboard root if not in menus
    if (pathname === '/dashboard') {
      return [
        {
          label: t('common.dashboard'),
          href: '/dashboard',
          isActive: true,
        },
      ];
    }

    // 3. Fallback: generate breadcrumbs from URL path (excluding parent dashboard segment)
    const breadcrumbs: BreadcrumbSegment[] = [];
    const segments = pathname
      .split('/')
      .filter((segment) => segment && segment !== 'dashboard');

    segments.forEach((segment, index) => {
      const href = '/dashboard/' + segments.slice(0, index + 1).join('/');
      // Try to translate the segment name if it exists in a common location or dashboard
      // Otherwise fallback to title case
      let label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Mapping for common segments
      if (segment === 'user-management') label = t('sidebar.user-management');
      if (segment === 'user') label = t('user_mgmt.users.title');
      if (segment === 'role') label = t('user_mgmt.roles.title');
      if (segment === 'menu') label = t('user_mgmt.menus.title');
      if (segment === 'admin-system') label = t('sidebar.admin-system');
      if (segment === 'audit-log') label = t('admin_system.audit_log.title');
      if (segment === 'profile') label = t('common.profile');

      breadcrumbs.push({
        label,
        href,
        isActive: href === pathname,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={crumb.href}>
              <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className={index === 0 ? 'hidden md:block' : ''} />
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
