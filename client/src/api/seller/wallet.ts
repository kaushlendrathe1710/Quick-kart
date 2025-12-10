import apiClient from '../apiClient';
import type {
  Wallet,
  WalletTransaction,
  WithdrawalRequest,
  CreateWithdrawalRequestInput,
  TransactionListResponse,
  WithdrawalListResponse,
} from '@shared/types';

/**
 * Seller Wallet API - Wallet management and withdrawals
 */

export const sellerWalletApi = {
  /**
   * Get seller wallet balance and summary
   */
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get('/seller/wallet');
    return response.data.data;
  },

  /**
   * Get wallet transactions with pagination
   */
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<TransactionListResponse> => {
    const response = await apiClient.get('/seller/wallet/transactions', { params });
    return response.data.data;
  },

  /**
   * Create withdrawal request
   */
  requestWithdrawal: async (data: CreateWithdrawalRequestInput): Promise<WithdrawalRequest> => {
    const response = await apiClient.post('/seller/wallet/withdraw', data);
    return response.data.data;
  },

  /**
   * Get all withdrawal requests
   */
  getWithdrawalRequests: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<WithdrawalListResponse> => {
    const response = await apiClient.get('/seller/wallet/withdrawals', { params });
    return response.data.data;
  },

  /**
   * Get single withdrawal request
   */
  getWithdrawalRequest: async (id: number): Promise<WithdrawalRequest> => {
    const response = await apiClient.get(`/seller/wallet/withdrawals/${id}`);
    return response.data.data;
  },
};
