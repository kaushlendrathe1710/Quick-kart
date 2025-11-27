import apiClient from '../apiClient';

/**
 * Admin Banners API
 * Handles admin banner management endpoints
 */

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  category?: string | null;
  subcategory?: string | null;
  badgeText?: string | null;
  productId?: number | null;
  active: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannersListResponse {
  data: Banner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BannerResponse {
  success: boolean;
  message: string;
  banner: Banner;
}

export interface CreateBannerRequest {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  category?: string;
  subcategory?: string;
  badgeText?: string;
  productId?: number;
  active?: boolean;
  position?: number;
}

export interface UpdateBannerRequest {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  buttonText?: string;
  category?: string;
  subcategory?: string;
  badgeText?: string;
  productId?: number;
  active?: boolean;
  position?: number;
}

/**
 * Get all banners with pagination
 */
export const getAllBanners = async (page = 1, limit = 20): Promise<BannersListResponse> => {
  const response = await apiClient.get('/admin/banners', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Create new banner
 */
export const createBanner = async (data: CreateBannerRequest): Promise<BannerResponse> => {
  const response = await apiClient.post('/admin/banners', data);
  return response.data;
};

/**
 * Update banner
 */
export const updateBanner = async (
  id: number,
  data: UpdateBannerRequest
): Promise<BannerResponse> => {
  const response = await apiClient.put(`/admin/banners/${id}`, data);
  return response.data;
};

/**
 * Delete banner
 */
export const deleteBanner = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/admin/banners/${id}`);
  return response.data;
};

/**
 * Update banner position
 */
export const updateBannerPosition = async (
  id: number,
  position: number
): Promise<BannerResponse> => {
  const response = await apiClient.patch(`/admin/banners/${id}/position`, { position });
  return response.data;
};

/**
 * Toggle banner active status
 */
export const toggleBannerActive = async (id: number): Promise<BannerResponse> => {
  const response = await apiClient.patch(`/admin/banners/${id}/toggle-active`);
  return response.data;
};

/**
 * Upload banner image
 */
export const uploadBannerImage = async (
  file: File
): Promise<{ success: boolean; message: string; imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/admin/banners/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
