import apiClient from '../apiClient';

/**
 * Seller Auth API
 * Handles seller authentication and authorization endpoints
 */

export interface SellerProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    email: string;
    name?: string | null;
    role: string;
    avatar?: string | null;
    isApproved: boolean;
    businessName?: string | null;
    gstNumber?: string | null;
    panNumber?: string | null;
    businessType?: string | null;
    accountHolderName?: string | null;
    accountNumber?: string | null;
    bankName?: string | null;
    ifscCode?: string | null;
    createdAt: string;
  };
}

export interface SellerApprovalStatusResponse {
  success: boolean;
  message: string;
  data: {
    isApproved: boolean;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string | null;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface UpdateBankingRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

/**
 * Get seller profile
 */
export const getSellerProfile = async (): Promise<SellerProfileResponse> => {
  const response = await apiClient.get('/seller/profile');
  return response.data;
};

/**
 * Update seller profile
 */
export const updateSellerProfile = async (
  data: UpdateProfileRequest
): Promise<SellerProfileResponse> => {
  const response = await apiClient.put('/seller/profile', data);
  return response.data;
};

/**
 * Update banking information
 */
export const updateBankingInfo = async (
  data: UpdateBankingRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.put('/seller/profile/banking', data);
  return response.data;
};

/**
 * Get seller approval status
 */
export const getSellerApprovalStatus = async (): Promise<SellerApprovalStatusResponse> => {
  const response = await apiClient.get('/seller/profile/status');
  return response.data;
};
