'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMenu } from '../hooks/use-menu';
import { CreateMenuRequest, UpdateMenuRequest } from '../types/menu-type';
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
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { IconPicker } from '@/components/ui/icon-picker';

import { SidePanelLayout } from '@/components/ui';

interface MenuFormProps {
  token: string;
  menuId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MenuForm({ token, menuId, onSuccess, onCancel }: MenuFormProps) {
  const { t } = useLanguage();
  const {
    selectedMenu,
    availableParentMenus,
    isLoading,
    fetchMenuById,
    fetchMenuAddData,
    createMenu,
    updateMenu,
  } = useMenu(token);

  const form = useForm<CreateMenuRequest>({
    defaultValues: {
      name: '',
      code: '',
      url_path: '',
      icon: '',
      order_no: 1,
      is_active: true,
      parent_id: null,
    },
  });

  useEffect(() => {
    fetchMenuAddData();

    if (menuId) {
      fetchMenuById(menuId);
    }
  }, [menuId, fetchMenuAddData, fetchMenuById]);

  useEffect(() => {
    if (selectedMenu && menuId) {
      form.reset({
        name: selectedMenu.name,
        code: selectedMenu.code,
        url_path: selectedMenu.url_path,
        icon: selectedMenu.icon,
        order_no: selectedMenu.order_no,
        is_active: selectedMenu.is_active,
        parent_id: selectedMenu.parent_id,
      });
    }
  }, [selectedMenu, menuId, form]);

  const onSubmit = async (data: CreateMenuRequest) => {
    try {
      const payload: CreateMenuRequest | UpdateMenuRequest = {
        name: data.name,
        code: data.code,
        url_path: data.url_path,
        icon: data.icon,
        order_no: data.order_no,
        is_active: data.is_active,
        parent_id: data.parent_id === 0 ? null : data.parent_id,
      };

      if (menuId) {
        await updateMenu(menuId, payload as UpdateMenuRequest);
        GlobalErrorHandler.showSuccess(t('user_mgmt.menus.update_success'));
      } else {
        await createMenu(payload as CreateMenuRequest);
        GlobalErrorHandler.showSuccess(t('user_mgmt.menus.create_success'));
      }

      onSuccess?.();
    } catch (err) {
      // Error handling is done automatically by GlobalErrorHandler
    }
  };

  if (isLoading && availableParentMenus.length === 0) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <SidePanelLayout
        asForm
        onSubmit={form.handleSubmit(onSubmit)}
        id="menu-form"
        footer={(
          <>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving') : menuId ? t('user_mgmt.menus.edit_menu') : t('user_mgmt.menus.create_menu')}
            </Button>
          </>
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            rules={{ required: t('user_mgmt.menus.validation.name_required') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('user_mgmt.menus.name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('user_mgmt.menus.name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Code */}
          <FormField
            control={form.control}
            name="code"
            rules={{ required: t('user_mgmt.menus.validation.code_required') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('user_mgmt.menus.code')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('user_mgmt.menus.code')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* URL Path */}
          <FormField
            control={form.control}
            name="url_path"
            rules={{ required: t('user_mgmt.menus.validation.url_required') }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>{t('user_mgmt.menus.url_path')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('user_mgmt.menus.url_path')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Icon */}
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('user_mgmt.menus.icon')}</FormLabel>
                <FormControl>
                  <IconPicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('user_mgmt.menus.select_icon')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Parent Menu */}
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('user_mgmt.menus.parent')}</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'none' ? null : parseInt(value))}
                  value={field.value === null ? 'none' : field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('user_mgmt.menus.select_parent')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{t('user_mgmt.menus.root_menu')}</SelectItem>
                    {availableParentMenus
                      .filter((menu) => menu.id !== menuId) // Prevent selecting itself as parent
                      .map((menu) => (
                        <SelectItem key={menu.id} value={menu.id.toString()}>
                          {menu.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('user_mgmt.menus.top_level_help')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Order Number */}
          <FormField
            control={form.control}
            name="order_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('user_mgmt.menus.order')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('user_mgmt.menus.order')}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  {t('user_mgmt.menus.order_help')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Is Active */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {t('common.active')}
                </FormLabel>
                <FormDescription>
                  {t('user_mgmt.menus.active_help')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </SidePanelLayout>
    </Form>
  );
}
