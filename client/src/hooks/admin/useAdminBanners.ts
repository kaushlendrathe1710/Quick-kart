import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminBannerKeys } from '@/constants/admin';
import * as bannersApi from '@/api/admin/banners';
import { toast } from 'sonner';

/**
 * Custom hooks for admin banner operations
 */

/**
 * Get all banners list (with pagination)
 */
export const useAllBanners = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: adminBannerKeys.list(page, limit),
    queryFn: () => bannersApi.getAllBanners(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Create banner mutation
 */
export const useCreateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: bannersApi.CreateBannerRequest) => bannersApi.createBanner(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.lists() });
      toast.success(data.message || 'Banner created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create banner');
    },
  });
};

/**
 * Update banner mutation
 */
export const useUpdateBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: bannersApi.UpdateBannerRequest }) =>
      bannersApi.updateBanner(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.detail(variables.id) });
      toast.success(data.message || 'Banner updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update banner');
    },
  });
};

/**
 * Delete banner mutation
 */
export const useDeleteBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bannersApi.deleteBanner(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.lists() });
      toast.success(data.message || 'Banner deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete banner');
    },
  });
};

/**
 * Update banner position mutation
 */
export const useUpdateBannerPosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, position }: { id: number; position: number }) =>
      bannersApi.updateBannerPosition(id, position),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.detail(variables.id) });
      toast.success(data.message || 'Banner position updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update banner position');
    },
  });
};

/**
 * Toggle banner active status mutation
 */
export const useToggleBannerActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bannersApi.toggleBannerActive(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.detail(id) });
      toast.success(data.message || 'Banner status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to toggle banner status');
    },
  });
};
