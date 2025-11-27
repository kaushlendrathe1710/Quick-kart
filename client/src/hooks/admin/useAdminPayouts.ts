import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminPayoutKeys } from '@/constants/admin';
import * as payoutsApi from '@/api/admin/payouts';
import { toast } from 'sonner';

/**
 * Custom hooks for admin payout operations
 */

/**
 * Get all payouts list (with filters)
 */
export const useAllPayouts = (filters: payoutsApi.PayoutsListFilters = {}) => {
  return useQuery({
    queryKey: adminPayoutKeys.list(filters),
    queryFn: () => payoutsApi.getAllPayouts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get pending payouts only
 */
export const usePendingPayouts = () => {
  return useQuery({
    queryKey: adminPayoutKeys.pending(),
    queryFn: () => payoutsApi.getPendingPayouts(),
    staleTime: 1000 * 60 * 1, // 1 minute (refresh more frequently for pending payouts)
  });
};

/**
 * Get wallet by ID
 */
export const useWallet = (id: number, enabled = true) => {
  return useQuery({
    queryKey: adminPayoutKeys.wallet(id),
    queryFn: () => payoutsApi.getWalletById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Update payout status mutation
 */
export const useUpdatePayoutStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: payoutsApi.UpdatePayoutStatusRequest }) =>
      payoutsApi.updatePayoutStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminPayoutKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminPayoutKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminPayoutKeys.pending() });
      toast.success(data.message || 'Payout status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update payout status');
    },
  });
};
