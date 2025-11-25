import apiClient from '../apiClient';

/**
 * Seller Settings API
 * Handles store settings management endpoints
 */

export interface SellerSettings {
  id: number;
  sellerId: number;
  pickupAddress: any | null;
  taxEnabled: boolean;
  defaultTaxRate: string | null;
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  storeDescription: string | null;
  storeLogo: string | null;
  storeBanner: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data: SellerSettings;
}

export interface UpdateSettingsRequest {
  storeDescription?: string;
  storeLogo?: string | null;
  storeBanner?: string | null;
  taxEnabled?: boolean;
  defaultTaxRate?: string | null;
  emailNotifications?: boolean;
  orderNotifications?: boolean;
  lowStockAlerts?: boolean;
}

export interface PickupAddress {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

/**
 * Get seller settings
 */
export const getSettings = async (): Promise<SettingsResponse> => {
  const response = await apiClient.get('/seller/settings');
  return response.data;
};

/**
 * Update seller settings
 */
export const updateSettings = async (data: UpdateSettingsRequest): Promise<SettingsResponse> => {
  const response = await apiClient.put('/seller/settings', data);
  return response.data;
};

/**
 * Update pickup address (one-time only)
 */
export const updatePickupAddress = async (address: PickupAddress): Promise<SettingsResponse> => {
  const response = await apiClient.put('/seller/settings/pickup-address', address);
  return response.data;
};
