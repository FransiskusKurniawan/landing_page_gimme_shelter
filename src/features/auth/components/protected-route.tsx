'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/providers/language-provider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Ensure the first render (SSR + pre-hydration) matches between server and client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  // Stable fallback during SSR and before mount to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // If authenticated after mount, render protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // When unauthenticated, render nothing while redirecting
  return null;
}
