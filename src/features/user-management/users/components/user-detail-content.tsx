import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getImageUrl } from '@/lib/utils/utils';
import { useLanguage } from '@/components/providers/language-provider';
import type { User as UserType } from '../types/user-type';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { SidePanelLayout } from '@/components/ui';

interface UserDetailContentProps {
  user: UserType | null;
}

export function UserDetailContent({ user }: UserDetailContentProps) {
  const { t } = useLanguage();
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.language.english') === 'English' ? 'en-US' : 'id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SidePanelLayout
      footer={(
        <DialogClose asChild>
          <Button type="button" variant="outline">
            {t('common.close')}
          </Button>
        </DialogClose>
      )}
    >
      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={getImageUrl(user.photo_profile)} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-2xl font-semibold">{user.name}</h3>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      <Separator />
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">{t('common.details')}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('common.id')}</p>
            <p className="font-medium">#{user.id}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('user_mgmt.users.username')}</p>
            <p className="font-medium">{user.username}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t('user_mgmt.users.name')}</p>
            <p className="font-medium">{user.name}</p>
          </div>
        </div>
      </div>
      <Separator />
      {/* Status & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('user_mgmt.users.roles')}</p>
          <Badge variant="outline">
            {user.roles && user.roles.length > 0 ? user.roles[0].name : t('user_mgmt.users.no_roles')}
          </Badge>
        </div>
      </div>
      <Separator />
      {/* Timestamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{t('common.created_at')}</p>
          <p className="text-base">{formatDate(user.created_at)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t('common.updated_at')}</p>
          <p className="text-base">{formatDate(user.updated_at)}</p>
        </div>
      </div>
    </SidePanelLayout>
  );
}
