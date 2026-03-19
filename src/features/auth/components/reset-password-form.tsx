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
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/auth-service";
import { useLanguage } from "@/components/providers/language-provider";

export function ResetPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isValidating, setIsValidating] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const validateToken = useCallback(async () => {
        if (!token) {
            setError(t('auth.errors.token_missing'));
            setIsValidating(false);
            return;
        }

        try {
            const response = await authService.validateToken(token);
            if (response.data.valid) {
                setIsTokenValid(true);
                setEmail(response.data.email || "");
            } else {
                setError(t('auth.errors.token_invalid'));
            }
        } catch (err: any) {
            setError(err.message || t('auth.errors.generic'));
        } finally {
            setIsValidating(false);
        }
    }, [token]);

    useEffect(() => {
        validateToken();
    }, [validateToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('auth.errors.passwords_dont_match'));
            return;
        }

        setIsSubmitting(true);
        setMessage(null);
        setError(null);

        try {
            if (!token) throw new Error("Token is missing");
            const response = await authService.resetPassword({
                token,
                password,
                confirm_password: confirmPassword,
            });
            setMessage(response.message);
            // Automatically redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } catch (err: any) {
            setError(err.message || t('auth.errors.generic'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isValidating) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">{t('auth.validating_token')}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{t('auth.reset_password_title')}</CardTitle>
                    <CardDescription>
                        {isTokenValid
                            ? t('auth.reset_password_email_description').replace('{email}', email)
                            : t('auth.reset_password_description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isTokenValid ? (
                        <div className="flex flex-col gap-4 text-center">
                            <p className="text-sm font-medium text-destructive">
                                {error || t('auth.errors.token_invalid')}
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/auth/forgot-password">{t('auth.request_new_link')}</Link>
                            </Button>
                        </div>
                    ) : message ? (
                        <div className="flex flex-col gap-4 text-center">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                {message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('common.loading')}
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/auth/login">{t('auth.back_to_login')}</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="password" required>{t('auth.new_password')}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm-password" required>{t('auth.confirm_new_password')}</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? t('auth.resetting') : t('auth.reset_password')}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
