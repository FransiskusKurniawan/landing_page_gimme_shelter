import { create } from 'zustand';
import { Role } from '../types/role-type';

interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  setRoles: (roles: Role[]) => void;
  setSelectedRole: (role: Role | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: { total: number; page: number; limit: number }) => void;
  clearError: () => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  roles: [],
  selectedRole: null,
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
  setRoles: (roles) => set({ roles }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  clearError: () => set({ error: null }),
}));
