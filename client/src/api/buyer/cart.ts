import apiClient from '../apiClient';
import type { CartWithItems, AddToCartInput, UpdateCartItemInput } from '@shared/types';

/**
 * Cart API - Shopping cart management
 */

export interface CartCountResponse {
  count: number;
}

export const cartApi = {
  /**
   * Get user's cart with items
   */
  getCart: async (): Promise<CartWithItems> => {
    const response = await apiClient.get('/cart');
    return response.data.data; // Unwrap nested data
  },

  /**
   * Get cart items count
   */
  getCartCount: async (): Promise<CartCountResponse> => {
    const response = await apiClient.get('/cart/count');
    return response.data.data;
  },

  /**
   * Add product to cart
   */
  addToCart: async (data: AddToCartInput): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/cart', data);
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (
    productId: number,
    data: UpdateCartItemInput
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(`/cart/${productId}`, data);
    return response.data;
  },

  /**
   * Remove product from cart
   */
  removeFromCart: async (productId: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/cart/${productId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },

  /**
   * Sync guest cart with database cart
   */
  syncCart: async (
    guestItems: Array<{
      productId: number;
      variantId?: number | null;
      quantity: number;
    }>
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/cart/sync', { items: guestItems });
    return response.data;
  },
};
