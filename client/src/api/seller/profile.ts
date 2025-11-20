import apiClient from '../apiClient';

/**
 * Seller Profile & Business API
 * Handles seller profile, business details, and payment endpoints
 */

export interface BusinessDetails {
  businessName?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  businessType?: string | null;
}

export interface BankingInformation {
  accountHolderName?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
}

export interface UpdateBusinessDetailsRequest {
  businessName?: string;
  gstNumber?: string;
  panNumber?: string;
  businessType?: string;
}

export interface UpdateBankingInformationRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface Payment {
  id: number;
  sellerId: number;
  amount: string;
  status: string;
  requestedAt: string;
  processedAt?: string | null;
  notes?: string | null;
}

export interface PaymentSummary {
  totalEarnings: number;
  pendingPayments: number;
  completedPayments: number;
  availableBalance: number;
}

export interface BusinessDetailsResponse {
  success: boolean;
  message: string;
  data: BusinessDetails;
}

export interface BankingInformationResponse {
  success: boolean;
  message: string;
  data: BankingInformation;
}

export interface PaymentsListResponse {
  success: boolean;
  message: string;
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentSummaryResponse {
  success: boolean;
  message: string;
  data: PaymentSummary;
}

export interface RequestPaymentRequest {
  amount: number;
  notes?: string;
}

/**
 * Get business details
 */
export const getBusinessDetails = async (): Promise<BusinessDetailsResponse> => {
  const response = await apiClient.get('/seller/business-details');
  return response.data;
};

/**
 * Update business details
 */
export const updateBusinessDetails = async (
  data: UpdateBusinessDetailsRequest
): Promise<BusinessDetailsResponse> => {
  const response = await apiClient.put('/seller/business-details', data);
  return response.data;
};

/**
 * Get banking information
 */
export const getBankingInformation = async (): Promise<BankingInformationResponse> => {
  const response = await apiClient.get('/seller/banking-information');
  return response.data;
};

/**
 * Update banking information
 */
export const updateBankingInformation = async (
  data: UpdateBankingInformationRequest
): Promise<BankingInformationResponse> => {
  const response = await apiClient.put('/seller/banking-information', data);
  return response.data;
};

/**
 * Get payment history
 */
export const getPayments = async (
  page = 1,
  limit = 10,
  status?: string
): Promise<PaymentsListResponse> => {
  const response = await apiClient.get('/seller/payments', {
    params: { page, limit, status },
  });
  return response.data;
};

/**
 * Get single payment
 */
export const getPayment = async (
  id: number
): Promise<{ success: boolean; message: string; data: Payment }> => {
  const response = await apiClient.get(`/seller/payments/${id}`);
  return response.data;
};

/**
 * Request payment/withdrawal
 */
export const requestPayment = async (
  data: RequestPaymentRequest
): Promise<{ success: boolean; message: string; data: Payment }> => {
  const response = await apiClient.post('/seller/payments/request', data);
  return response.data;
};

/**
 * Get payment summary
 */
export const getPaymentSummary = async (): Promise<PaymentSummaryResponse> => {
  const response = await apiClient.get('/seller/payments-summary');
  return response.data;
};
