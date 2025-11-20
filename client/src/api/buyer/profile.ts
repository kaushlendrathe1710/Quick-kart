import apiClient from '../apiClient';
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
  UpdateProfileRequest,
  User,
} from '@shared/types';

/**
 * Profile API - User profile and address management
 */

export const profileApi = {
  /**
   * Update user profile
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<{ success: boolean; message: string; user: User }> => {
    const response = await apiClient.patch('/auth/me', data);
    return response.data;
  },

  /**
   * Get all addresses for authenticated user
   */
  getAllAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get('/addresses');
    return response.data.data;
  },

  /**
   * Get a single address by ID
   */
  getAddress: async (id: number): Promise<Address> => {
    const response = await apiClient.get(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Create a new address
   */
  createAddress: async (
    data: CreateAddressInput
  ): Promise<{ success: boolean; message: string; address: Address }> => {
    const response = await apiClient.post('/addresses', data);
    return response.data;
  },

  /**
   * Update an existing address
   */
  updateAddress: async (
    id: number,
    data: UpdateAddressInput
  ): Promise<{ success: boolean; message: string; address: Address }> => {
    const response = await apiClient.put(`/addresses/${id}`, data);
    return response.data;
  },

  /**
   * Delete an address
   */
  deleteAddress: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/addresses/${id}`);
    return response.data;
  },

  /**
   * Set an address as default
   */
  setDefaultAddress: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(`/addresses/${id}/default`);
    return response.data;
  },

  /**
   * Get all payment methods
   */
  getAllPaymentMethods: async () => {
    const response = await apiClient.get('/payment-methods');
    return response.data;
  },

  /**
   * Get a single payment method by ID
   */
  getPaymentMethod: async (id: number) => {
    const response = await apiClient.get(`/payment-methods/${id}`);
    return response.data;
  },

  /**
   * Create a new payment method
   */
  createPaymentMethod: async (data: any) => {
    const response = await apiClient.post('/payment-methods', data);
    return response.data;
  },

  /**
   * Update an existing payment method
   */
  updatePaymentMethod: async (id: number, data: any) => {
    const response = await apiClient.put(`/payment-methods/${id}`, data);
    return response.data;
  },

  /**
   * Delete a payment method
   */
  deletePaymentMethod: async (id: number) => {
    const response = await apiClient.delete(`/payment-methods/${id}`);
    return response.data;
  },

  /**
   * Set a payment method as default
   */
  setDefaultPaymentMethod: async (id: number) => {
    const response = await apiClient.patch(`/payment-methods/${id}/default`);
    return response.data;
  },
};
