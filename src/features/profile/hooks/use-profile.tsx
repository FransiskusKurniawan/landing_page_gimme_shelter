import { useCallback } from 'react';
import { profileService } from '../services';
import { useProfileStore } from '../stores/profile-store';
import { UpdateProfileRequest } from '../types/profile-type';
import { ApiError } from '@/lib/errors/api-error-handler';

export const useProfile = (token: string) => {
  const {
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
  } = useProfileStore();

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await profileService.updateProfile(data, token);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : 'Failed to update profile';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  return {
    isLoading,
    error,
    updateProfile,
    clearError,
  };
};

