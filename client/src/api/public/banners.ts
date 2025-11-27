import apiClient from '../apiClient';

/**
 * Public Banners API
 * Fetch active banners for homepage
 */

export interface PublicBanner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  category?: string | null;
  subcategory?: string | null;
  badgeText?: string | null;
  productId?: number | null;
  position: number;
}

export interface ActiveBannersResponse {
  success: boolean;
  data: PublicBanner[];
}

/**
 * Get all active banners for homepage
 */
export const getActiveBanners = async (): Promise<ActiveBannersResponse> => {
  const response = await apiClient.get('/banners');
  return response.data;
};
