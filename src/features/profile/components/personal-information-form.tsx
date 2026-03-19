'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, User } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { profileService } from '../services/profile-service';
import { ApiError } from '@/lib/errors/api-error-handler';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { useLanguage } from '@/components/providers/language-provider';

interface PersonalInformationFormProps {
  token: string;
}

export function PersonalInformationForm({ token }: PersonalInformationFormProps) {
  const { user, setUser } = useAuthStore();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Validation schema
  const personalInfoSchema = z.object({
    name: z.string().min(1, t('profile.personal_info.validation.name_required')),
    photo_profile: z.any().optional(),
  });

  type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: user?.name || '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('profile.personal_info.validation.invalid_image'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('profile.personal_info.validation.image_too_large'));
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: PersonalInfoFormValues) => {
    if (!token) {
      toast.error(t('profile.errors.token_not_found'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await profileService.updateProfile(
        {
          name: data.name,
          photo_profile: selectedFile || undefined,
        },
        token
      );

      // Update user in store
      if (response.data.user) {
        setUser(response.data.user);
      }

      toast.success(t('profile.personal_info.update_success'));

      // Clear preview and file
      setPhotoPreview(null);
      setSelectedFile(null);
    } catch (error: unknown) {
      console.error('Update profile error:', error);

      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          toast.error(t('profile.errors.auth_failed'));
        } else if (error.statusCode === 400) {
          toast.error(error.message || t('profile.errors.invalid_details'));
        } else {
          toast.error(error.message || t('profile.errors.update_failed'));
        }
      } else {
        toast.error(t('profile.errors.generic'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPhotoUrl = () => {
    if (photoPreview) return photoPreview;
    if (user?.photo_profile) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/profiles/${user.photo_profile}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('profile.personal_info.title')}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t('profile.personal_info.description')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
              {getPhotoUrl() ? (
                <img
                  src={getPhotoUrl()!}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={isSubmitting}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {t('profile.personal_info.upload_photo')}
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('profile.personal_info.photo_help')}
              </p>
            </div>
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('profile.personal_info.name')} *</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('profile.personal_info.name_placeholder')}
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
