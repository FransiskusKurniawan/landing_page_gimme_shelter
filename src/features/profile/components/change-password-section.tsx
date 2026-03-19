'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';
import { profileService } from '../services/profile-service';
import { ApiError } from '@/lib/errors/api-error-handler';
import { useLanguage } from '@/components/providers/language-provider';

interface ChangePasswordSectionProps {
  token: string;
}

export function ChangePasswordSection({ token }: ChangePasswordSectionProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Validation schema
  const changePasswordSchema = z
    .object({
      old_password: z
        .string()
        .min(1, t('profile.security.validation.current_password_required'))
        .min(6, t('profile.security.validation.current_password_length')),
      new_password: z
        .string()
        .min(1, t('profile.security.validation.new_password_required'))
        .min(6, t('profile.security.validation.new_password_length')),
      confirm_password: z.string().min(1, t('profile.security.validation.confirm_password_required')),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t('profile.security.validation.passwords_dont_match'),
      path: ['confirm_password'],
    })
    .refine((data) => data.new_password !== data.old_password, {
      message: t('profile.security.validation.password_same_as_current'),
      path: ['new_password'],
    });

  type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    if (!token) {
      toast.error(t('profile.errors.token_not_found'));
      return;
    }

    setIsSubmitting(true);

    try {
      await profileService.changePassword(
        {
          old_password: data.old_password,
          new_password: data.new_password,
        },
        token
      );

      toast.success(t('profile.security.update_success'));

      // Reset form
      form.reset();
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        // Handle specific error codes
        if (error.statusCode === 401) {
          toast.error(t('profile.errors.auth_failed'));
        } else if (error.statusCode === 400) {
          // Server validation errors - show the actual error message
          toast.error(error.message || t('profile.errors.invalid_details'));
        } else if (error.statusCode === 404) {
          toast.error(t('profile.errors.user_not_found'));
        } else {
          toast.error(error.message || t('profile.errors.change_password_failed'));
        }
      } else {
        toast.error(t('profile.errors.generic'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Wrap the submit handler to prevent errors from bubbling to React
  const handleFormSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {

    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {t('profile.security.change_password')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('profile.security.change_password_desc')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Current Password */}
          <FormField
            control={form.control}
            name="old_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.security.current_password')}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t('profile.security.current_password_placeholder')}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* New Password */}
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.security.new_password')}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t('profile.security.new_password_placeholder')}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm New Password */}
          <FormField
            control={form.control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.security.confirm_password')}</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder={t('profile.security.confirm_password_placeholder')}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              <p>{t('profile.security.password_requirements')}</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>{t('profile.security.min_characters')}</li>
                <li>{t('profile.security.different_from_current')}</li>
              </ul>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('profile.security.change_password')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
