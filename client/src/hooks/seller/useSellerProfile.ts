import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerAuthKeys, sellerProfileKeys } from '@/constants/seller';
import * as authApi from '@/api/seller/auth';
import * as profileApi from '@/api/seller/profile';
import { toast } from 'sonner';

/**
 * Custom hooks for seller profile and auth operations
 */

/**
 * Get seller profile
 * Returns seller-specific data (business info, banking, etc.)
 * Core user auth data comes from /api/auth/me and is stored in Redux
 */
export const useSellerProfile = (enabled = true) => {
  const query = useQuery({
    queryKey: sellerAuthKeys.profile(),
    queryFn: authApi.getSellerProfile,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return query;
};

/**
 * Get seller approval status
 */
export const useSellerApprovalStatus = (enabled = true) => {
  const query = useQuery({
    queryKey: sellerAuthKeys.approvalStatus(),
    queryFn: authApi.getSellerApprovalStatus,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Note: The approval status is already part of the user object in Redux
  // This query is just for checking the latest status if needed

  return query;
};

/**
 * Update seller profile mutation
 */
export const useUpdateSellerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateSellerProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellerAuthKeys.profile() });
      // Invalidate auth/me to refetch updated user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success(data.message || 'Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update profile');
    },
  });
};

/**
 * Update banking information mutation
 */
export const useUpdateBankingInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateBankingInfo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellerAuthKeys.profile() });
      queryClient.invalidateQueries({ queryKey: sellerProfileKeys.banking() });
      toast.success(data.message || 'Banking information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update banking information');
    },
  });
};

/**
 * Get business details
 */
export const useBusinessDetails = (enabled = true) => {
  return useQuery({
    queryKey: sellerProfileKeys.business(),
    queryFn: profileApi.getBusinessDetails,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Update business details mutation
 */
export const useUpdateBusinessDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateBusinessDetails,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellerProfileKeys.business() });
      queryClient.invalidateQueries({ queryKey: sellerAuthKeys.profile() });
      toast.success(data.message || 'Business details updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update business details');
    },
  });
};

/**
 * Get banking information
 */
export const useBankingInformation = (enabled = true) => {
  return useQuery({
    queryKey: sellerProfileKeys.banking(),
    queryFn: profileApi.getBankingInformation,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Update banking information mutation
 */
export const useUpdateBankingInformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateBankingInformation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellerProfileKeys.banking() });
      toast.success(data.message || 'Banking information updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update banking information');
    },
  });
};

/**
 * Get payment history
 */
export const usePayments = (page = 1, limit = 10, status?: string) => {
  return useQuery({
    queryKey: sellerProfileKeys.payments(page, limit, status),
    queryFn: () => profileApi.getPayments(page, limit, status),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get payment summary
 */
export const usePaymentSummary = () => {
  return useQuery({
    queryKey: sellerProfileKeys.paymentsSummary(),
    queryFn: profileApi.getPaymentSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Request payment mutation
 */
export const useRequestPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.requestPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellerProfileKeys.all });
      toast.success(data.message || 'Payment request submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to request payment');
    },
  });
};
