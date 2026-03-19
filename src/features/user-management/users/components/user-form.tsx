'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '../hooks/use-user';
import { CreateUserRequest, UpdateUserRequest } from '../types/user-type';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/utils';
import { useLanguage } from '@/components/providers/language-provider';

interface UserFormProps {
  token: string;
  userId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ token, userId, onSuccess, onCancel }: UserFormProps) {
  const { t } = useLanguage();
  const {
    selectedUser,
    availableRoles,
    isLoading,
    fetchUserById,
    fetchUserAddData,
    createUser,
    updateUser,
  } = useUser(token);

  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<CreateUserRequest>({
    defaultValues: {
      username: '',
      name: '',
      email: '',
      password: '',
      role_ids: [],
    },
  });

  useEffect(() => {
    fetchUserAddData();

    if (userId) {
      fetchUserById(userId);
    }
  }, [userId, fetchUserAddData, fetchUserById]);

  useEffect(() => {
    if (selectedUser && userId) {
      form.reset({
        username: selectedUser.username,
        name: selectedUser.name,
        email: selectedUser.email,
        password: '',
        role_ids: selectedUser.roles.map((role) => role.id),
      });

      if (selectedUser.photo_profile) {
        setPhotoPreview(getImageUrl(selectedUser.photo_profile));
      }
    }
  }, [selectedUser, userId, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      const payload: CreateUserRequest | UpdateUserRequest = {
        username: data.username,
        name: data.name,
        email: data.email,
        role_ids: data.role_ids,
        ...(data.password && { password: data.password }),
        ...(selectedFile && { photo_profile: selectedFile }),
      };

      if (userId) {
        await updateUser(userId, payload as UpdateUserRequest);
        toast.success(t('user_mgmt.users.update_success'));
      } else {
        await createUser(payload as CreateUserRequest);
        toast.success(t('user_mgmt.users.create_success'));
      }

      onSuccess?.();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  if (isLoading && availableRoles.length === 0) {
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
      <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Photo Profile */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview} />
              <AvatarFallback>
                {form.watch('name')?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('photo')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t('user_mgmt.users.form.upload_photo')}
              </Button>
            </div>
          </div>

          {/* Username */}
          <FormField
            control={form.control}
            name="username"
            rules={{ required: t('user_mgmt.users.validation.username_required') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('user_mgmt.users.username')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('auth.username_placeholder')}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.replace(/\s/g, ''))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: t('user_mgmt.users.validation.name_required') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('user_mgmt.users.name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('user_mgmt.users.name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: t('user_mgmt.users.validation.email_required'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t('user_mgmt.users.validation.email_invalid')
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('user_mgmt.users.email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('auth.email_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            rules={
              !userId
                ? { required: t('user_mgmt.users.validation.password_required') }
                : undefined
            }
            render={({ field }) => (
              <FormItem>
                <FormLabel required={!userId}>
                  {t('auth.password')} {userId && `(${t('user_mgmt.users.form.password_help')})`}
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t('auth.password')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Roles */}
          <FormField
            control={form.control}
            name="role_ids"
            rules={{ required: t('user_mgmt.users.validation.role_required') }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel required>{t('user_mgmt.users.roles')}</FormLabel>
                <FormControl>
                  <Dropdown
                    placeholder={
                      field.value?.length > 0
                        ? t('user_mgmt.users.form.roles_selected').replace('{count}', field.value.length.toString())
                        : t('user_mgmt.users.form.select_roles')
                    }
                    items={availableRoles.map((role) => ({
                      id: role.id.toString(),
                      label: role.description ? `${role.name} - ${role.description}` : role.name,
                      checked: field.value?.includes(role.id),
                    }))}
                    onItemChange={(id, checked) => {
                      const roleId = parseInt(id);
                      const newValue = checked
                        ? [...(field.value || []), roleId]
                        : field.value?.filter((v) => v !== roleId) || [];
                      field.onChange(newValue);
                    }}
                    showBadge={true}
                    className="w-full"
                  />
                </FormControl>
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
            {isLoading ? t('common.saving') : userId ? t('user_mgmt.users.update_success') : t('user_mgmt.users.create_user')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
