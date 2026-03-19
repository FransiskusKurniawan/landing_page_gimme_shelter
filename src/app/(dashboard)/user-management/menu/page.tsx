'use client';

import { useState } from 'react';
import { MenuList, MenuForm } from '@/features/user-management/menu';
import { MenuDetailContent } from '@/features/user-management/menu/components/menu-detail-content';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { menuService } from '@/features/user-management/menu/services';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Menu } from '@/features/user-management/menu/types/menu-type';
import { useLanguage } from '@/components/providers/language-provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MenuManagementPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<number | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const hasPermission = useMenuStore((state) => state.hasPermission);
  const canCreate = hasPermission('MENU', 'CREATE');

  const handleCreate = () => {
    setSelectedMenuId(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (menuId: number) => {
    setSelectedMenuId(menuId);
    setDialogOpen(true);
  };

  const handleView = (menu: Menu) => {
    setSelectedMenu(menu);
    setDetailDialogOpen(true);
  };

  const handleDelete = async (menuId: number) => {
    if (!token) return;

    try {
      await menuService.deleteMenu(menuId, token);
      toast.success(t('user_mgmt.menus.delete_success'));
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error(t('user_mgmt.menus.delete_failed'));
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setSelectedMenuId(undefined);
    // Trigger refresh of the menu list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedMenuId(undefined);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please login to continue</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle>{t('user_mgmt.menus.title')}</CardTitle>
            <CardDescription>
              {t('user_mgmt.menus.description')}
            </CardDescription>
          </div>
          {canCreate && (
            <Button onClick={handleCreate} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              {t('user_mgmt.menus.create_menu')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <MenuList
            token={token}
            onView={handleView}
            onEdit={handleEdit}
            onCreate={handleCreate}
            onDelete={handleDelete}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          variant="right-panel"
          title={selectedMenuId ? t('user_mgmt.menus.edit_menu') : t('user_mgmt.menus.create_menu')}
        >
          <MenuForm
            token={token}
            menuId={selectedMenuId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          variant="right-panel"
          title={t('user_mgmt.menus.menu_details')}
        >
          <MenuDetailContent menu={selectedMenu} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
