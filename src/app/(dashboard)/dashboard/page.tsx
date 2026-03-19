'use client';

import { useLanguage } from "@/components/providers/language-provider";

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('dashboard.total_devices')}</p>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('dashboard.active_users')}</p>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{t('dashboard.alerts')}</p>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4">
        <h2 className="text-lg font-semibold mb-4">{t('dashboard.recent_activity')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.description')}
        </p>
      </div>
    </>
  )
}
