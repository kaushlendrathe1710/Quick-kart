import apiClient from '../apiClient';

/**
 * Seller Store API
 * Handles store management and settings
 */

export interface StoreDetails {
  id: number;
  sellerId: number;
  storeName: string;
  storeDescription?: string | null;
  logo?: string | null;
  banner?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdateStoreRequest {
  storeName?: string;
  storeDescription?: string;
  logo?: string;
  banner?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactNumber?: string;
  email?: string;
}

/**
 * Get store details
 */
export const getStoreDetails = async (): Promise<{
  success: boolean;
  message: string;
  data: StoreDetails;
}> => {
  const response = await apiClient.get('/seller/store');
  return response.data;
};

/**
 * Update store details
 */
export const updateStoreDetails = async (
  data: UpdateStoreRequest
): Promise<{
  success: boolean;
  message: string;
  data: StoreDetails;
}> => {
  const response = await apiClient.put('/seller/store', data);
  return response.data;
};

/**
 * Upload store logo
 */
export const uploadStoreLogo = async (
  file: File
): Promise<{
  success: boolean;
  message: string;
  data: { logo: string };
}> => {
  const formData = new FormData();
  formData.append('logo', file);

  const response = await apiClient.post('/seller/store/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Upload store banner
 */
export const uploadStoreBanner = async (
  file: File
): Promise<{
  success: boolean;
  message: string;
  data: { banner: string };
}> => {
  const formData = new FormData();
  formData.append('banner', file);

  const response = await apiClient.post('/seller/store/banner', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
