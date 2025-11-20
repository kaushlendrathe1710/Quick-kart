import apiClient from '../apiClient';
import type { WishlistItemWithProduct, AddToWishlistInput } from '@shared/types';

/**
 * Wishlist API - Wishlist management
 */

export interface WishlistCountResponse {
  count: number;
}

export interface CheckWishlistResponse {
  inWishlist: boolean;
}

export const wishlistApi = {
  /**
   * Get user's wishlist with product details
   */
  getWishlist: async (): Promise<any> => {
    const response = await apiClient.get('/wishlist', {
      params: { page: 1, limit: 100 },
    });
    return response.data;
  },

  /**
   * Get wishlist items count
   */
  getWishlistCount: async (): Promise<WishlistCountResponse> => {
    const response = await apiClient.get('/wishlist/count');
    return response.data;
  },

  /**
   * Check if product is in wishlist
   */
  checkWishlist: async (productId: number): Promise<CheckWishlistResponse> => {
    const response = await apiClient.get(`/wishlist/check/${productId}`);
    return response.data;
  },

  /**
   * Add product to wishlist
   */
  addToWishlist: async (
    data: AddToWishlistInput
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/wishlist', data);
    return response.data;
  },

  /**
   * Remove product from wishlist
   */
  removeFromWishlist: async (productId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data;
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/wishlist');
    return response.data;
  },
};
