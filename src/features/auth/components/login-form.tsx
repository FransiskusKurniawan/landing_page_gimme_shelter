"use client";

import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useLanguage } from "@/components/providers/language-provider";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear any previous errors

    await login({ username, password });
  };

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('auth.login_title')}</CardTitle>
          <CardDescription>
            {t('auth.login_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username" required>{t('auth.username')}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('auth.username_placeholder')}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" required>{t('auth.password')}</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Link
                  href="/auth/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {t('auth.forgot_password_link')}
                </Link>
              </div>
              {authError && <p className="text-sm text-destructive">{authError}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('auth.logging_in') : t('auth.login')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('auth.dont_have_account')}{" "}
              <Link
                href="/auth/register"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('auth.sign_up')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
