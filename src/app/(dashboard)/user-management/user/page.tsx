'use client';

import { useState } from 'react';
import { UserList, UserForm } from '@/features/user-management/users';
import { UserDetailContent } from '@/features/user-management/users/components/user-detail-content';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { userService } from '@/features/user-management/users/services';
import { useMenuStore } from '@/features/dashboard/stores/menu-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/features/user-management/users/types/user-type';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLanguage } from '@/components/providers/language-provider';

export default function UserManagementPage() {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const hasPermission = useMenuStore((state) => state.hasPermission);
  const canCreate = hasPermission('USER', 'CREATE');

  const handleCreate = () => {
    setSelectedUserId(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (userId: number) => {
    setSelectedUserId(userId);
    setDialogOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    if (!token) return;

    try {
      await userService.deleteUser(userId, token);
      toast.success(t('user_mgmt.users.delete_success'));
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('user_mgmt.users.delete_failed'));
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setSelectedUserId(undefined);
    // Trigger refresh of the user list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setSelectedUserId(undefined);
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
            <CardTitle>{t('user_mgmt.users.title')}</CardTitle>
            <CardDescription>
              {t('user_mgmt.description')}
            </CardDescription>
          </div>
          {canCreate && (
            <Button onClick={handleCreate} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              {t('user_mgmt.users.create_user')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <UserList
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
          title={selectedUserId ? t('user_mgmt.users.edit_user') : t('user_mgmt.users.create_user')}
        >
          <UserForm
            token={token}
            userId={selectedUserId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          variant="right-panel"
          title={t('user_mgmt.users.user_details')}
        >
          <UserDetailContent user={selectedUser} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
