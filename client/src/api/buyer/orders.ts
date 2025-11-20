import apiClient from '../apiClient';
import type { Order, CreateOrderInput } from '@shared/types';

/**
 * Orders API - Order management
 */

export interface UserOrdersResponse {
  orders: Order[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export const ordersApi = {
  /**
   * Create order from cart
   */
  createOrder: async (
    data: CreateOrderInput
  ): Promise<{ success: boolean; message: string; order: Order }> => {
    const response = await apiClient.post('/orders', data);
    return response.data;
  },

  /**
   * Get all orders for user
   */
  getUserOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<UserOrdersResponse> => {
    const response = await apiClient.get('/orders', { params });
    return response.data.data;
  },

  /**
   * Get specific order by ID
   */
  getOrderById: async (orderId: number): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (
    orderId: number,
    reason?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },
};
