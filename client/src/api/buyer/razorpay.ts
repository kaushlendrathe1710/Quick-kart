import apiClient from '../apiClient';
import type {
  CreateRazorpayOrderRequest,
  CreateRazorpayOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from '@shared/types';

/**
 * Razorpay API - Payment processing
 */

export const razorpayApi = {
  /**
   * Get Razorpay public key
   */
  getRazorpayKey: async (): Promise<{ keyId: string }> => {
    const response = await apiClient.get('/razorpay/key');
    return response.data.data;
  },

  /**
   * Create Razorpay order from cart
   */
  createOrder: async (data: CreateRazorpayOrderRequest): Promise<CreateRazorpayOrderResponse> => {
    const response = await apiClient.post('/razorpay/create-order', data);
    return response.data.data;
  },

  /**
   * Verify Razorpay payment and credit wallets
   */
  verifyPayment: async (data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> => {
    const response = await apiClient.post('/razorpay/verify-payment', data);
    return response.data.data;
  },
};
