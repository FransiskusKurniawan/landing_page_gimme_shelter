import { Separator } from '@/components/ui/separator';
import type { Role } from '../types/role-type';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { useLanguage } from '@/components/providers/language-provider';
import { SidePanelLayout } from '@/components/ui';

interface RoleDetailContentProps {
  role: Role | null;
}

export function RoleDetailContent({ role }: RoleDetailContentProps) {
  const { t } = useLanguage();
  if (!role) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.language.english') === 'English' ? 'en-US' : 'id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      {/* Basic Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <div className="text-xs text-muted-foreground">{t('common.id')}</div>
          <div className="font-medium text-base">{role.id}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('user_mgmt.roles.name')}</div>
          <div className="font-semibold text-base">{role.name}</div>
        </div>
      </div>
      <Separator />
      {/* Description */}
      <div>
        <div className="text-xs text-muted-foreground mb-1">{t('user_mgmt.roles.description')}</div>
        <div className="text-base">{role.description}</div>
      </div>
      <Separator />
      {/* Timestamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <div className="text-xs text-muted-foreground">{t('common.created_at')}</div>
          <div className="text-base">{formatDate(role.created_at)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('common.updated_at')}</div>
          <div className="text-base">{formatDate(role.updated_at)}</div>
        </div>
      </div>
    </SidePanelLayout>
  );
}
