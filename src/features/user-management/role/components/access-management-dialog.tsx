'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { GlobalErrorHandler } from '@/lib/errors';
import { roleService } from '../services';
import type { MenuWithAccess, MenuAction } from '../types/role-type';
import { ChevronRight, ChevronDown, Search, Shield, CheckSquare2, Square } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';

interface AccessManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: number;
  roleName: string;
  token: string;
}

export function AccessManagementSheet({
  open,
  onOpenChange,
  roleId,
  roleName,
  token,
}: AccessManagementSheetProps) {
  const { t } = useLanguage();
  const [menus, setMenus] = useState<MenuWithAccess[]>([]);
  const [selectedActionIds, setSelectedActionIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open && roleId) {
      fetchAccessManagement();
    }
  }, [open, roleId]);

  const fetchAccessManagement = async () => {
    setIsLoading(true);
    try {
      const response = await roleService.getAccessManagement(roleId, token);
      setMenus(response.data);

      // Pre-select allowed actions
      const allowedIds = new Set<number>();
      response.data.forEach((menu) => {
        processMenuActions(menu, allowedIds);
      });
      setSelectedActionIds(allowedIds);

      // By default if that menu have child the dropdown is closed
      // So we don't auto-expand any menus initially
      setExpandedMenus(new Set());
    } catch (error) {
      console.error('Failed to load access management data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMenuActions = (menu: MenuWithAccess, allowedIds: Set<number>) => {
    menu.actions.forEach((action) => {
      if (action.allowed && action.is_active) {
        allowedIds.add(action.id);
      }
    });
    if (menu.children) {
      menu.children.forEach((child) => processMenuActions(child, allowedIds));
    }
  };

  const toggleAction = (actionId: number) => {
    const newSelected = new Set(selectedActionIds);
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId);
    } else {
      newSelected.add(actionId);
    }
    setSelectedActionIds(newSelected);
  };

  const toggleMenuExpand = (menuId: number) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const toggleAllActionsForMenu = (menuId: number, checked: boolean) => {
    const newSelected = new Set(selectedActionIds);

    const findMenuAndToggle = (m: MenuWithAccess): boolean => {
      if (m.id === menuId) {
        m.actions.filter(a => a.is_active).forEach(a => {
          if (checked) newSelected.add(a.id);
          else newSelected.delete(a.id);
        });
        return true;
      }
      if (m.children) {
        return m.children.some(child => findMenuAndToggle(child));
      }
      return false;
    };

    menus.some(menu => findMenuAndToggle(menu));
    setSelectedActionIds(newSelected);
  };

  const areAllActionsSelected = (menu: MenuWithAccess): boolean => {
    const activeActions = menu.actions.filter((action) => action.is_active);
    return activeActions.length > 0 && activeActions.every((action) => selectedActionIds.has(action.id));
  };

  const areSomeActionsSelected = (menu: MenuWithAccess): boolean => {
    const activeActions = menu.actions.filter((action) => action.is_active);
    const selectedCount = activeActions.filter((action) => selectedActionIds.has(action.id)).length;
    return selectedCount > 0 && selectedCount < activeActions.length;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await roleService.updateAccessManagement(
        {
          role_id: roleId,
          menu_action_ids: Array.from(selectedActionIds),
        },
        token
      );
      GlobalErrorHandler.showSuccess(t('user_mgmt.roles.access.update_success'));
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update access permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMenus = useMemo(() => {
    if (!searchQuery.trim()) return menus;

    const filterFn = (menu: MenuWithAccess): MenuWithAccess | null => {
      const matchesName = menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menu.code.toLowerCase().includes(searchQuery.toLowerCase());

      const filteredChildren = menu.children
        ? menu.children.map(filterFn).filter((c): c is MenuWithAccess => c !== null)
        : [];

      const matchesActions = menu.actions.some(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.action_type.code.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchesName || matchesActions || filteredChildren.length > 0) {
        return {
          ...menu,
          children: filteredChildren.length > 0 ? filteredChildren : menu.children
        };
      }
      return null;
    };

    return menus.map(filterFn).filter((m): m is MenuWithAccess => m !== null);
  }, [menus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const countAll = (mList: MenuWithAccess[]) => {
      let mCount = 0;
      let aCount = 0;
      let sCount = 0;

      mList.forEach(m => {
        mCount++;
        m.actions.filter(a => a.is_active).forEach(a => {
          aCount++;
          if (selectedActionIds.has(a.id)) sCount++;
        });
        if (m.children) {
          const childStats = countAll(m.children);
          mCount += childStats.mCount;
          aCount += childStats.aCount;
          sCount += childStats.sCount;
        }
      });

      return { mCount, aCount, sCount };
    };

    return countAll(menus);
  }, [menus, selectedActionIds]);

  const renderAction = (action: MenuAction) => {
    if (!action.is_active) return null;
    const isSelected = selectedActionIds.has(action.id);

    return (
      <Badge
        key={action.id}
        variant={isSelected ? 'default' : 'outline'}
        className={`cursor-pointer text-[10px] font-semibold transition-all duration-200 select-none px-2.5 py-1 uppercase tracking-wider ${isSelected
          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
          : 'bg-background hover:bg-muted hover:text-foreground border-muted-foreground/20'
          }`}
        onClick={() => toggleAction(action.id)}
      >
        {action.action_type.code}
      </Badge>
    );
  };

  const renderMenu = (menu: MenuWithAccess, level: number = 0) => {
    const isExpanded = expandedMenus.has(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;
    const activeActions = menu.actions.filter((a) => a.is_active);
    const hasActions = activeActions.length > 0;
    const allSelected = areAllActionsSelected(menu);

    return (
      <div key={menu.id} className="mb-3">
        <div
          className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${level > 0 ? 'ml-6' : ''
            } ${isExpanded ? 'bg-muted/30 border-primary/20 shadow-sm' : 'bg-card hover:bg-muted/10 hover:border-muted-foreground/30'}`}
        >
          <div className="flex items-center gap-2 shrink-0">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full transition-transform duration-200 ${isExpanded ? 'bg-primary/10 text-primary rotate-0' : 'hover:bg-muted'}`}
                onClick={() => toggleMenuExpand(menu.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-8 flex justify-center">
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0" onClick={() => hasChildren && toggleMenuExpand(menu.id)}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-sm tracking-tight ${isExpanded ? 'text-primary' : 'text-foreground'}`}>{menu.name}</span>
              <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0 h-4 bg-muted/50 border-none opacity-70">
                {menu.code}
              </Badge>
              {allSelected && (
                <Badge variant="default" className="text-[9px] px-1.5 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 font-bold uppercase tracking-wider">
                  {t('user_mgmt.roles.manage_access')}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5 opacity-60">
              {menu.url_path}
            </p>
          </div>

          {hasActions && (
            <div className="flex items-center gap-1.5 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 text-[10px] px-2.5 font-bold uppercase tracking-tighter"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAllActionsForMenu(menu.id, true);
                }}
              >
                <CheckSquare2 className="h-3 w-3 mr-1" />
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-2.5 font-bold uppercase tracking-tighter text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAllActionsForMenu(menu.id, false);
                }}
              >
                <Square className="h-3 w-3 mr-1" />
                None
              </Button>
            </div>
          )}
        </div>

        {hasActions && (
          <div className={`mt-3 flex flex-wrap gap-2 ${level > 0 ? 'ml-14' : 'ml-12'}`}>
            {activeActions.map((action) => renderAction(action))}
          </div>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-3 space-y-3 relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent ml-[3px]" />
            {menu.children!.map((child) => renderMenu(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black tracking-tight">{t('user_mgmt.roles.access.title')}</SheetTitle>
              <p className="text-sm text-muted-foreground font-medium opacity-80">
                {t('user_mgmt.roles.access.description').replace('{name}', roleName)}
              </p>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        {/* Statistics Bar */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/40 p-3 rounded-2xl border border-border/50 flex flex-col items-center justify-center group hover:bg-muted/60 transition-colors duration-200">
              <div className="text-2xl font-black tracking-tight group-hover:scale-110 transition-transform duration-200">{stats.mCount}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1 opacity-70 italic">{t('user_mgmt.menus.title')}</div>
            </div>
            <div className="bg-muted/40 p-3 rounded-2xl border border-border/50 flex flex-col items-center justify-center group hover:bg-muted/60 transition-colors duration-200">
              <div className="text-2xl font-black tracking-tight group-hover:scale-110 transition-transform duration-200">{stats.aCount}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-1 opacity-70 italic">{t('user_mgmt.roles.access.actions_column')}</div>
            </div>
            <div className="bg-primary/5 p-3 rounded-2xl border border-primary/20 flex flex-col items-center justify-center group hover:bg-primary/10 transition-colors duration-200">
              <div className="text-2xl font-black tracking-tight text-primary group-hover:scale-110 transition-transform duration-200">{stats.sCount}</div>
              <div className="text-[9px] text-primary/70 uppercase tracking-widest font-bold mt-1 italic">{t('common.details')}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              placeholder={t('user_mgmt.roles.access.actions_column')}
              className="pl-11 h-12 bg-muted/20 border-border/50 rounded-2xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search terms
              </p>
              {searchQuery && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="pt-2">
              {filteredMenus.map((menu) => renderMenu(menu))}
            </div>
          )}
        </div>

        <Separator />

        <SheetFooter className="p-6 px-8 bg-background border-t">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-70">
                <span className="font-black text-foreground">{selectedActionIds.size}</span> {t('common.items')} selected
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 sm:flex-none h-11 px-6 font-bold uppercase tracking-wider text-xs hover:bg-muted"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                className="flex-1 sm:flex-none h-11 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                onClick={handleSave}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t('common.saving')}
                  </div>
                ) : t('common.save')}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
