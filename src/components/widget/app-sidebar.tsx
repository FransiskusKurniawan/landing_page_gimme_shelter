'use client';

import {
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useMenuData } from "@/features/dashboard/hooks/use-menu"
import { useMenuStore } from "@/features/dashboard/stores/menu-store"
import { MenuItem } from "@/features/dashboard/types/menu-type"
import { getIconByName } from "@/lib/utils/icon-utils"
import { useLanguage } from "@/components/providers/language-provider"

export function AppSidebar() {
  const { menus, isLoading } = useMenuData();
  const pathname = usePathname();
  const { t } = useLanguage();
  const hasPermission = useMenuStore(state => state.hasPermission);
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMenu = (menuId: number) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const isActive = (urlPath: string) => {
    if (!isMounted) return false;
    return pathname === urlPath || pathname.startsWith(urlPath + '/');
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = getIconByName(item.icon);
    const hasChildren = item.children && item.children.length > 0;
    // Use centralized permission check so updates reflect immediately
    const hasViewPermission = hasPermission(item.code, 'VIEW');

    if (!hasViewPermission) {
      return null;
    }

    if (hasChildren) {
      const isMenuOpen = openMenus[item.id];

      return (
        <Collapsible
          key={item.id}
          open={isMenuOpen}
          onOpenChange={() => toggleMenu(item.id)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.name}
                isActive={isActive(item.url_path)}
              >
                <Icon />
                <span>{item.name}</span>
                <ChevronRight
                  className={`ml-auto transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''
                    }`}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.children?.map((child) => renderSubMenuItem(child))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton asChild tooltip={item.name} isActive={isActive(item.url_path)}>
          <Link href={item.url_path}>
            <Icon />
            <span>{item.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderSubMenuItem = (item: MenuItem) => {
    const Icon = getIconByName(item.icon);
    const hasViewPermission = hasPermission(item.code, 'VIEW');

    if (!hasViewPermission) {
      return null;
    }

    return (
      <SidebarMenuSubItem key={item.id}>
        <SidebarMenuSubButton asChild isActive={isActive(item.url_path)}>
          <Link href={item.url_path}>
            <Icon />
            <span>{item.name}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <Image
                  src="/logo.png"
                  alt="Agrisense AI Logo"
                  width={40}
                  height={40}
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Agrisense AI
                  </span>
                  <span className="truncate text-xs">{t('navigation.system_dashboard')}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {!isMounted || isLoading ? (
              <div className="px-2 py-4 text-sm text-muted-foreground">
                {t('navigation.loading_menus')}
              </div>
            ) : (
              <SidebarMenu>
                {menus.map((item) => renderMenuItem(item))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
