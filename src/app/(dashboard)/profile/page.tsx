'use client';

import { ProfilePage } from '@/features/profile/components';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLanguage } from '@/components/providers/language-provider';

export default function Profile() {
  const { token } = useAuth();
  const { t } = useLanguage();

  if (!token) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('profile.errors.auth_failed')}</p>
      </div>
    );
  }

  return <ProfilePage token={token} />;
}
