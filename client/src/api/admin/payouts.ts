import apiClient from '../apiClient';

/**
 * Admin Payouts API
 * Handles admin payout management endpoints
 */

export interface Payout {
  id: number;
  walletId: number;
  deliveryPartnerId?: number;
  amount: string;
  status: 'applied' | 'processing' | 'paid' | 'rejected';
  appliedAt: string;
  processedAt?: string | null;
  paidAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deliveryPartner?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PayoutsListResponse {
  success: boolean;
  message: string;
  data: Payout[];
}

export interface PayoutDetailResponse {
  success: boolean;
  message: string;
  data: Payout;
}

export interface PayoutsListFilters {
  page?: number;
  limit?: number;
  status?: string;
  deliveryPartnerId?: number;
}

export interface UpdatePayoutStatusRequest {
  status: 'processing' | 'paid' | 'rejected';
  rejectionReason?: string;
}

/**
 * Get all payouts (admin view)
 */
export const getAllPayouts = async (
  filters: PayoutsListFilters = {}
): Promise<PayoutsListResponse> => {
  const response = await apiClient.get('/admin/payout', {
    params: filters,
  });
  return response.data;
};

/**
 * Get pending payouts only
 */
export const getPendingPayouts = async (): Promise<PayoutsListResponse> => {
  const response = await apiClient.get('/admin/payout/pending');
  return response.data;
};

/**
 * Get wallet by ID
 */
export const getWalletById = async (id: number): Promise<any> => {
  const response = await apiClient.get(`/admin/wallet/${id}`);
  return response.data;
};

/**
 * Update payout status (admin)
 */
export const updatePayoutStatus = async (
  id: number,
  data: UpdatePayoutStatusRequest
): Promise<PayoutDetailResponse> => {
  const response = await apiClient.patch(`/admin/payout/${id}/status`, data);
  return response.data;
};
