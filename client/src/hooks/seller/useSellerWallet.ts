import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sellerWalletApi } from '@/api/seller';
import { sellerWalletKeys } from '@/constants/seller';
import type { CreateWithdrawalRequestInput } from '@shared/types';

/**
 * Custom hook for seller wallet management
 * Handles wallet balance, transactions, and withdrawal requests
 */
export function useSellerWallet() {
  const queryClient = useQueryClient();

  /**
   * Fetch wallet balance and summary
   */
  const {
    data: wallet,
    isLoading: isLoadingWallet,
    error: walletError,
  } = useQuery({
    queryKey: sellerWalletKeys.wallet(),
    queryFn: sellerWalletApi.getWallet,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  /**
   * Fetch wallet transactions
   */
  const useTransactions = (page: number = 1, limit: number = 20) => {
    return useQuery({
      queryKey: sellerWalletKeys.transactionList(page, limit),
      queryFn: () => sellerWalletApi.getTransactions({ page, limit }),
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  };

  /**
   * Fetch withdrawal requests
   */
  const useWithdrawalRequests = (page: number = 1, limit: number = 20, status?: string) => {
    return useQuery({
      queryKey: sellerWalletKeys.withdrawalList(page, limit, status),
      queryFn: () => sellerWalletApi.getWithdrawalRequests({ page, limit, status }),
      staleTime: 1000 * 60 * 5,
    });
  };

  /**
   * Fetch single withdrawal request
   */
  const useWithdrawalRequest = (id: number) => {
    return useQuery({
      queryKey: sellerWalletKeys.withdrawal(id),
      queryFn: () => sellerWalletApi.getWithdrawalRequest(id),
      enabled: !!id,
    });
  };

  /**
   * Request withdrawal mutation
   */
  const requestWithdrawalMutation = useMutation({
    mutationFn: (data: CreateWithdrawalRequestInput) => sellerWalletApi.requestWithdrawal(data),
    onSuccess: () => {
      toast.success('Withdrawal request submitted successfully!');
      // Invalidate wallet and withdrawals to refetch updated data
      queryClient.invalidateQueries({ queryKey: sellerWalletKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: sellerWalletKeys.withdrawals() });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit withdrawal request');
    },
  });

  return {
    // Wallet data
    wallet,
    isLoadingWallet,
    walletError,

    // Transaction hooks
    useTransactions,

    // Withdrawal hooks
    useWithdrawalRequests,
    useWithdrawalRequest,

    // Mutations
    requestWithdrawal: requestWithdrawalMutation.mutate,
    requestWithdrawalAsync: requestWithdrawalMutation.mutateAsync,
    isRequestingWithdrawal: requestWithdrawalMutation.isPending,
    requestWithdrawalError: requestWithdrawalMutation.error,
  };
}
