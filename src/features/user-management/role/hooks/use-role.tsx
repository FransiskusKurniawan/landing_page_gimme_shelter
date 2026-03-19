import { useCallback } from 'react';
import { roleService } from '../services';
import { useRoleStore } from '../stores/role-store';
import {
  RoleListParams,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '../types/role-type';
import { GlobalErrorHandler } from '@/lib/errors';

export const useRole = (token: string) => {
  const {
    roles,
    selectedRole,
    isLoading,
    error,
    pagination,
    setRoles,
    setSelectedRole,
    setLoading,
    setError,
    setPagination,
    clearError,
  } = useRoleStore();

  const fetchRoles = useCallback(
    async (params: RoleListParams = {}) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await roleService.getRoles(params, token);
        setRoles(response.data);
        setPagination(response.meta.pagination);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch roles';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setRoles, setPagination, setLoading, setError, clearError]
  );

  const fetchRoleById = useCallback(
    async (id: number) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await roleService.getRoleById(id, token);
        setSelectedRole(response.data);
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch role details';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setSelectedRole, setLoading, setError, clearError]
  );

  const createRole = useCallback(
    async (data: CreateRoleRequest) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await roleService.createRole(data, token);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create role';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  const updateRole = useCallback(
    async (id: number, data: UpdateRoleRequest) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await roleService.updateRole(id, data, token);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update role';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  const deleteRole = useCallback(
    async (id: number) => {
      if (!token) {
        setError('No authentication token available');
        return;
      }

      setLoading(true);
      clearError();

      try {
        const response = await roleService.deleteRole(id, token);
        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete role';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, setLoading, setError, clearError]
  );

  return {
    roles,
    selectedRole,
    isLoading,
    error,
    pagination,
    fetchRoles,
    fetchRoleById,
    createRole,
    updateRole,
    deleteRole,
    clearError,
  };
};
