import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminWithdrawalApi } from '@/api/admin';
import { adminWithdrawalKeys } from '@/constants/admin';
import type { ApproveWithdrawalInput, RejectWithdrawalInput } from '@shared/types';

/**
 * Custom hook for admin withdrawal management
 * Handles withdrawal request approval, rejection, and completion
 */
export function useAdminWithdrawals() {
  const queryClient = useQueryClient();

  /**
   * Fetch all withdrawal requests with filtering
   */
  const useWithdrawalList = (
    page: number = 1,
    limit: number = 50,
    filters?: { status?: string; userType?: string }
  ) => {
    return useQuery({
      queryKey: adminWithdrawalKeys.list(page, limit, filters),
      queryFn: () => adminWithdrawalApi.getAllWithdrawals({ page, limit, ...filters }),
      staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    });
  };

  /**
   * Fetch single withdrawal request with details
   */
  const useWithdrawalDetail = (id: number) => {
    return useQuery({
      queryKey: adminWithdrawalKeys.detail(id),
      queryFn: () => adminWithdrawalApi.getWithdrawal(id),
      enabled: !!id,
    });
  };

  /**
   * Approve withdrawal mutation
   */
  const approveWithdrawalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data?: ApproveWithdrawalInput }) =>
      adminWithdrawalApi.approveWithdrawal(id, data),
    onSuccess: (_, variables) => {
      toast.success('Withdrawal request approved successfully!');
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.all });
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve withdrawal request');
    },
  });

  /**
   * Complete withdrawal mutation
   */
  const completeWithdrawalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveWithdrawalInput }) =>
      adminWithdrawalApi.completeWithdrawal(id, data),
    onSuccess: (_, variables) => {
      toast.success('Withdrawal completed successfully!');
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.all });
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete withdrawal');
    },
  });

  /**
   * Reject withdrawal mutation
   */
  const rejectWithdrawalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectWithdrawalInput }) =>
      adminWithdrawalApi.rejectWithdrawal(id, data),
    onSuccess: (_, variables) => {
      toast.success('Withdrawal request rejected');
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.all });
      queryClient.invalidateQueries({ queryKey: adminWithdrawalKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject withdrawal request');
    },
  });

  return {
    // Query hooks
    useWithdrawalList,
    useWithdrawalDetail,

    // Mutations
    approveWithdrawal: approveWithdrawalMutation.mutate,
    approveWithdrawalAsync: approveWithdrawalMutation.mutateAsync,
    isApprovingWithdrawal: approveWithdrawalMutation.isPending,

    completeWithdrawal: completeWithdrawalMutation.mutate,
    completeWithdrawalAsync: completeWithdrawalMutation.mutateAsync,
    isCompletingWithdrawal: completeWithdrawalMutation.isPending,

    rejectWithdrawal: rejectWithdrawalMutation.mutate,
    rejectWithdrawalAsync: rejectWithdrawalMutation.mutateAsync,
    isRejectingWithdrawal: rejectWithdrawalMutation.isPending,
  };
}
