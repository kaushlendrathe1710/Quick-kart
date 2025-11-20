import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as storeApi from '@/api/seller/store';
import { toast } from 'sonner';

/**
 * Custom hooks for seller store operations
 */

const STORE_KEYS = {
  all: ['seller', 'store'] as const,
  details: () => [...STORE_KEYS.all, 'details'] as const,
};

/**
 * Get store details
 */
export const useStoreDetails = (enabled = true) => {
  return useQuery({
    queryKey: STORE_KEYS.details(),
    queryFn: storeApi.getStoreDetails,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Update store details mutation
 */
export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeApi.updateStoreDetails,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STORE_KEYS.details() });
      toast.success(data.message || 'Store updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update store');
    },
  });
};

/**
 * Upload store logo mutation
 */
export const useUploadStoreLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeApi.uploadStoreLogo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STORE_KEYS.details() });
      toast.success(data.message || 'Logo uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload logo');
    },
  });
};

/**
 * Upload store banner mutation
 */
export const useUploadStoreBanner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeApi.uploadStoreBanner,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: STORE_KEYS.details() });
      toast.success(data.message || 'Banner uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload banner');
    },
  });
};
