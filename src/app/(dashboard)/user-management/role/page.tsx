'use client';

import { useState } from 'react';
import { RoleList, RoleForm, AccessManagementSheet } from '@/features/user-management/role';
import { RoleDetailContent } from '@/features/user-management/role/components/role-detail-content';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { roleService } from '@/features/user-management/role/services';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Role } from '@/features/user-management/role/types/role-type';
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
import { useLanguage } from '@/components/providers/language-provider';

export default function RoleManagementPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [accessManagementOpen, setAccessManagementOpen] = useState(false);
  const [selectedRoleForAccess, setSelectedRoleForAccess] = useState<Role | null>(null);
  const hasPermission = useMenuStore((state) => state.hasPermission);
  const canCreate = hasPermission('ROLE', 'CREATE');

  const handleCreate = () => {
    setSelectedRoleId(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (roleId: number) => {
    setSelectedRoleId(roleId);
    setDialogOpen(true);
  };

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setDetailDialogOpen(true);
  };

  const handleManageAccess = (role: Role) => {
    setSelectedRoleForAccess(role);
    setAccessManagementOpen(true);
  };

  const handleDelete = async (roleId: number) => {
    if (!token) return;

    try {
      await roleService.deleteRole(roleId, token);
      toast.success(t('user_mgmt.roles.delete_success'));
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(t('user_mgmt.roles.delete_failed'));
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setSelectedRoleId(undefined);
    // Trigger refresh of the role list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedRoleId(undefined);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.back_to_login')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1">
            <CardTitle>{t('user_mgmt.roles.title')}</CardTitle>
            <CardDescription>
              {t('user_mgmt.roles.description')}
            </CardDescription>
          </div>
          {canCreate && (
            <Button onClick={handleCreate} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              {t('user_mgmt.roles.create_role')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <RoleList
            token={token}
            onView={handleView}
            onEdit={handleEdit}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onManageAccess={handleManageAccess}
            refreshTrigger={refreshTrigger}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          variant="right-panel"
          title={selectedRoleId ? t('user_mgmt.roles.edit_role') : t('user_mgmt.roles.create_role')}
        >
          <RoleForm
            token={token}
            roleId={selectedRoleId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          variant="right-panel"
          title={t('user_mgmt.roles.role_details')}
        >
          <RoleDetailContent role={selectedRole} />
        </DialogContent>
      </Dialog>

      {selectedRoleForAccess && token && (
        <AccessManagementSheet
          open={accessManagementOpen}
          onOpenChange={setAccessManagementOpen}
          roleId={selectedRoleForAccess.id}
          roleName={selectedRoleForAccess.name}
          token={token}
        />
      )}
    </div>
  );
}
