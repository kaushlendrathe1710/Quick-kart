import apiClient from '../apiClient';
import type { Product, PaginatedProductsResponse, ListProductsInput } from '@shared/types';

// Extended product type with variants for details page
export interface ProductWithVariants extends Product {
  variants?: Array<{
    id: number;
    productId: number;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    price: number;
    mrp?: number | null;
    stock: number;
    images?: string | null;
    createdAt: Date;
  }>;
}

/**
 * Products API - Public product browsing
 */

export const productsApi = {
  /**
   * List products with filters and pagination
   */
  /**
   * List products with filters and pagination
   */
  listProducts: async (params: ListProductsInput): Promise<PaginatedProductsResponse> => {
    const response = await apiClient.get('/products', { params });
    return response.data.data; // Unwrap nested data structure
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id: number): Promise<ProductWithVariants> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data; // Unwrap nested data structure
  },

  /**
   * Get product reviews
   */
  getProductReviews: async (id: number, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/products/${id}/reviews`, { params });
    return response.data;
  },

  /**
   * Get product rating summary
   */
  getProductRating: async (id: number) => {
    const response = await apiClient.get(`/products/${id}/rating`);
    return response.data;
  },

  /**
   * Create a review for a product
   */
  createReview: async (
    productId: number,
    data: { rating: number; comment?: string; title?: string }
  ) => {
    const response = await apiClient.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  /**
   * Update a review
   */
  updateReview: async (
    reviewId: number,
    data: { rating?: number; comment?: string; title?: string }
  ) => {
    const response = await apiClient.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: number) => {
    const response = await apiClient.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Mark review as helpful
   */
  markReviewHelpful: async (reviewId: number) => {
    const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  /**
   * Unmark review as helpful
   */
  unmarkReviewHelpful: async (reviewId: number) => {
    const response = await apiClient.delete(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  /**
   * Check if user marked review as helpful
   */
  checkReviewHelpful: async (reviewId: number) => {
    const response = await apiClient.get(`/reviews/${reviewId}/helpful/check`);
    return response.data;
  },
};
