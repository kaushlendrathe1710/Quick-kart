import apiClient from '../apiClient';
import type { User } from '@shared/types';

/**
 * Auth API - Buyer Authentication
 */

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
  user: User;
  requiresProfile: boolean;
}

export interface CompleteProfileRequest {
  username: string;
  bio?: string;
  avatar?: string;
}

export interface CompleteProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

export const authApi = {
  /**
   * Send OTP to email
   */
  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await apiClient.post('/auth/send-otp', data);
    return response.data;
  },

  /**
   * Verify OTP and get JWT token
   */
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  /**
   * Complete user profile (for new users)
   */
  completeProfile: async (data: CompleteProfileRequest): Promise<CompleteProfileResponse> => {
    const response = await apiClient.post('/auth/complete-profile', data);
    return response.data;
  },

  /**
   * Resend OTP
   */
  resendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await apiClient.post('/auth/resend-otp', data);
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data.user; // Extract user from { success, user } response
  },

  /**
   * Logout
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
