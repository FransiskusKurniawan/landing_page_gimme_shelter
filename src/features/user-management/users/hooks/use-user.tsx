import { useState, useCallback } from 'react';
import { userService } from '../services';
import { useUserStore } from '../stores/user-store';
import {
  UserListParams,
  CreateUserRequest,
  UpdateUserRequest,
  Role,
} from '../types/user-type';
import { ApiError } from '@/lib/errors/api-error-handler';

export const useUser = (token: string) => {
  const {
    users,
    selectedUser,
    isLoading,
    error,
    pagination,
    setUsers,
    setSelectedUser,
    setLoading,
    setError,
    setPagination,
    clearError,
  } = useUserStore();

  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);

  const fetchUsers = useCallback(
    async (params: UserListParams = {}) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await userService.getUsers(params, token);
        setUsers(response.data);
        setPagination(response.meta.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : 'Failed to fetch users';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setUsers, setPagination, setLoading, setError, clearError]
  );

  const fetchUserById = useCallback(
    async (id: number) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await userService.getUserById(id, token);
        setSelectedUser(response.data);
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : 'Failed to fetch user details';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setSelectedUser, setLoading, setError, clearError]
  );

  const fetchUserAddData = useCallback(async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    clearError();

    try {
      const response = await userService.getUserAddData(token);
      setAvailableRoles(response.data.roles);
      return response.data.roles;
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : 'Failed to fetch available roles';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, setLoading, setError, clearError]);

  const createUser = useCallback(
    async (data: CreateUserRequest) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await userService.createUser(data, token);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : 'Failed to create user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  const updateUser = useCallback(
    async (id: number, data: UpdateUserRequest) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await userService.updateUser(id, data, token);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : 'Failed to update user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  const deleteUser = useCallback(
    async (id: number) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await userService.deleteUser(id, token);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : 'Failed to delete user';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  return {
    users,
    selectedUser,
    isLoading,
    error,
    pagination,
    availableRoles,
    fetchUsers,
    fetchUserById,
    fetchUserAddData,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
};
