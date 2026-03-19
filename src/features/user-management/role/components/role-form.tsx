'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRole } from '../hooks/use-role';
import { CreateRoleRequest, UpdateRoleRequest } from '../types/role-type';
import { GlobalErrorHandler } from '@/lib/errors';
import { useLanguage } from '@/components/providers/language-provider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleFormProps {
  token: string;
  roleId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RoleForm({ token, roleId, onSuccess, onCancel }: RoleFormProps) {
  const { t } = useLanguage();
  const {
    selectedRole,
    isLoading,
    fetchRoleById,
    createRole,
    updateRole,
  } = useRole(token);

  const form = useForm<CreateRoleRequest>({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (roleId) {
      fetchRoleById(roleId);
    }
  }, [roleId, fetchRoleById]);

  useEffect(() => {
    if (selectedRole && roleId) {
      form.reset({
        name: selectedRole.name,
        description: selectedRole.description,
      });
    }
  }, [selectedRole, roleId, form]);

  const onSubmit = async (data: CreateRoleRequest) => {
    try {
      const payload: CreateRoleRequest | UpdateRoleRequest = {
        name: data.name,
        description: data.description,
      };

      if (roleId) {
        await updateRole(roleId, payload as UpdateRoleRequest);
        GlobalErrorHandler.showSuccess(t('user_mgmt.roles.update_success'));
      } else {
        await createRole(payload as CreateRoleRequest);
        GlobalErrorHandler.showSuccess(t('user_mgmt.roles.create_success'));
      }

      onSuccess?.();
    } catch (err) {
      // Error handling is done automatically by GlobalErrorHandler
    }
  };

  if (isLoading && roleId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form id="role-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: t('user_mgmt.roles.validation.name_required') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('common.name_label')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('user_mgmt.roles.search_placeholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('user_mgmt.roles.form.name_help')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            rules={{ required: t('user_mgmt.roles.validation.description_required') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('common.description_label')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('user_mgmt.roles.form.description_help')}
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t('user_mgmt.roles.form.description_help')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fixed footer */}
        <div className="border-t p-4 bg-background flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.saving') : roleId ? t('user_mgmt.roles.edit_role') : t('user_mgmt.roles.create_role')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
