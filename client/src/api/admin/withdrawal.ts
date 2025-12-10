import apiClient from '../apiClient';
import type {
  WithdrawalRequest,
  Wallet,
  WithdrawalListResponse,
  ApproveWithdrawalInput,
  RejectWithdrawalInput,
} from '@shared/types';

/**
 * Admin Withdrawal API - Withdrawal management
 */

export interface WithdrawalDetailResponse {
  withdrawalRequest: WithdrawalRequest;
  wallet: Wallet;
}

export const adminWithdrawalApi = {
  /**
   * Get all withdrawal requests with filtering
   */
  getAllWithdrawals: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    userType?: string;
  }): Promise<WithdrawalListResponse> => {
    const response = await apiClient.get('/admin/withdrawals', { params });
    return response.data.data;
  },

  /**
   * Get single withdrawal request with wallet details
   */
  getWithdrawal: async (id: number): Promise<WithdrawalDetailResponse> => {
    const response = await apiClient.get(`/admin/withdrawals/${id}`);
    return response.data.data;
  },

  /**
   * Approve withdrawal request
   */
  approveWithdrawal: async (id: number, data?: ApproveWithdrawalInput): Promise<void> => {
    const response = await apiClient.put(`/admin/withdrawals/${id}/approve`, data || {});
    return response.data;
  },

  /**
   * Complete withdrawal (mark as paid and debit wallet)
   */
  completeWithdrawal: async (id: number, data: ApproveWithdrawalInput): Promise<void> => {
    const response = await apiClient.put(`/admin/withdrawals/${id}/complete`, data);
    return response.data;
  },

  /**
   * Reject withdrawal request
   */
  rejectWithdrawal: async (id: number, data: RejectWithdrawalInput): Promise<void> => {
    const response = await apiClient.put(`/admin/withdrawals/${id}/reject`, data);
    return response.data;
  },
};
