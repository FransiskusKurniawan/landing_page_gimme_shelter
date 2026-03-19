import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Menu } from '../types/menu-type';
import { useLanguage } from '@/components/providers/language-provider';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { SidePanelLayout } from '@/components/ui';

interface MenuDetailContentProps {
  menu: Menu | null;
}

export function MenuDetailContent({ menu }: MenuDetailContentProps) {
  const { t } = useLanguage();
  if (!menu) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.language.english') === 'English' ? 'en-US' : 'id-ID', {
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
      {/* Status & ID */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
        <div>
          <div className="text-xs text-muted-foreground">{t('common.id')}</div>
          <div className="font-medium text-base">{menu.id}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('common.status')}</div>
          <Badge variant={menu.is_active ? 'default' : 'destructive'}>
            {menu.is_active ? t('common.active') : t('common.inactive')}
          </Badge>
        </div>
      </div>
      <Separator />
      {/* Menu Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <div className="text-xs text-muted-foreground">{t('user_mgmt.menus.name')}</div>
          <div className="font-semibold text-base">{menu.name}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('user_mgmt.menus.code')}</div>
          <Badge variant="outline">{menu.code}</Badge>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('user_mgmt.menus.url_path')}</div>
          <div className="text-base text-muted-foreground">{menu.url_path}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('user_mgmt.menus.icon')}</div>
          <Badge variant="secondary">{menu.icon}</Badge>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('user_mgmt.menus.order')}</div>
          <div className="text-base">{menu.order_no}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('user_mgmt.menus.parent')}</div>
          <div className="text-base">{menu.parent_id ?? t('user_mgmt.menus.root_menu')}</div>
        </div>
      </div>
      <Separator />
      {/* Timestamps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <div className="text-xs text-muted-foreground">{t('common.created_at')}</div>
          <div className="text-base">{formatDate(menu.created_at)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('common.updated_at')}</div>
          <div className="text-base">{formatDate(menu.updated_at)}</div>
        </div>
      </div>
    </SidePanelLayout>
  );
}
