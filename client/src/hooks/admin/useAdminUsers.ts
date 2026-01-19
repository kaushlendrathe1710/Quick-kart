import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserKeys } from '@/constants/admin';
import * as usersApi from '@/api/admin/users';
import { toast } from 'sonner';

/**
 * Custom hooks for admin user management operations
 */

/**
 * Get all users with filters and pagination
 */
export const useAllUsers = (filters: usersApi.UsersListFilters = {}) => {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => usersApi.getAllUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get buyers list
 */
export const useBuyers = (filters: Omit<usersApi.UsersListFilters, 'role'> = {}) => {
  return useQuery({
    queryKey: adminUserKeys.list({ ...filters, role: 'user' }),
    queryFn: () => usersApi.getBuyers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get sellers list
 */
export const useSellers = (filters: Omit<usersApi.UsersListFilters, 'role'> = {}) => {
  return useQuery({
    queryKey: adminUserKeys.list({ ...filters, role: 'seller' }),
    queryFn: () => usersApi.getSellers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get delivery partners list
 */
export const useDeliveryPartners = (filters: Omit<usersApi.UsersListFilters, 'role'> = {}) => {
  return useQuery({
    queryKey: adminUserKeys.list({ ...filters, role: 'deliveryPartner' }),
    queryFn: () => usersApi.getDeliveryPartners(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get user statistics
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: adminUserKeys.stats(),
    queryFn: () => usersApi.getUserStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get single user by ID
 */
export const useUserDetail = (id: number) => {
  return useQuery({
    queryKey: adminUserKeys.detail(id),
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Update user mutation
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: usersApi.UpdateUserRequest }) =>
      usersApi.updateUser(id, data),
    onSuccess: (response, variables) => {
      toast.success('User updated successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });
};

/**
 * Update user role mutation
 */
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: usersApi.UpdateUserRoleRequest }) =>
      usersApi.updateUserRole(id, data),
    onSuccess: (response, variables) => {
      toast.success('User role updated successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    },
  });
};

/**
 * Delete user mutation (soft delete)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: (response, id) => {
      toast.success('User deleted successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
};

/**
 * Recover user mutation
 */
export const useRecoverUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.recoverUser(id),
    onSuccess: (response, id) => {
      toast.success('User recovered successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to recover user');
    },
  });
};
