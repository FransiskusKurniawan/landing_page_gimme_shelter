'use client';

import { useState } from 'react';
import { User, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PersonalInformationForm } from './personal-information-form';
import { ChangePasswordSection } from './change-password-section';
import { useLanguage } from '@/components/providers/language-provider';

type ProfileSection = 'personal' | 'security';

interface ProfileMenuItem {
  id: ProfileSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface ProfilePageProps {
  token: string;
}

export function ProfilePage({ token }: ProfilePageProps) {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');

  const profileMenuItems: ProfileMenuItem[] = [
    {
      id: 'personal',
      label: t('profile.personal_info.title'),
      icon: User,
      description: t('profile.personal_info.description'),
    },
    {
      id: 'security',
      label: t('profile.security.title'),
      icon: Shield,
      description: t('profile.security.description'),
    },
  ];

  const activeMenuItem = profileMenuItems.find(
    (item) => item.id === activeSection
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('profile.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('profile.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                        isActive &&
                        'bg-primary/10 text-primary border-r-2 border-primary'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'font-medium text-sm',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {item.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isActive
                            ? 'text-primary rotate-90'
                            : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeMenuItem && (
                  <>
                    <activeMenuItem.icon className="h-5 w-5" />
                    {activeMenuItem.label}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />

              {/* Render active section content */}
              {activeSection === 'personal' && (
                <PersonalInformationForm token={token} />
              )}

              {activeSection === 'security' && (
                <ChangePasswordSection token={token} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
