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
import { useState } from "react";
import { authService } from "../services/auth-service";
import { useLanguage } from "@/components/providers/language-provider";

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await authService.forgotPassword({ email });
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || t('auth.errors.generic'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{t('auth.forgot_password_title')}</CardTitle>
                    <CardDescription>
                        {t('auth.forgot_password_description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {message ? (
                        <div className="flex flex-col gap-4 text-center">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                {message}
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/auth/login">{t('auth.back_to_login')}</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" required>{t('auth.email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t('auth.email_placeholder')}
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? t('auth.sending_link') : t('auth.send_reset_link')}
                                </Button>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                {t('auth.already_have_account')}{" "}
                                <Link
                                    href="/auth/login"
                                    className="underline underline-offset-4 hover:text-primary"
                                >
                                    {t('auth.login')}
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
