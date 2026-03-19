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

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();
  const { register, isLoading, error: authError, clearError, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError(t('auth.errors.passwords_dont_match'));
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setLocalError(t('auth.errors.password_length'));
      return;
    }

    // Validate username
    if (username.length < 3) {
      setLocalError(t('auth.errors.username_length'));
      return;
    }

    await register({ username, name, password });
  };

  // Redirect when authenticated (registration successful)
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const displayError = localError || authError;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('auth.register_title')}</CardTitle>
          <CardDescription>
            {t('auth.register_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
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
                <Label htmlFor="name" required>{t('auth.full_name')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.full_name_placeholder')}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" required>{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" required>{t('auth.confirm_password')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {displayError && <p className="text-sm text-destructive">{displayError}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('auth.creating_account') : t('auth.register')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('auth.already_have_account')}{" "}
              <Link
                href="/auth/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                {t('auth.sign_in')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
