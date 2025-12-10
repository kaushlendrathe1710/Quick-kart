import apiClient from '../apiClient';
import type { Order, OrderWithDetails } from '@shared/types';

/**
 * Orders API - Order management
 */

export interface CreateOrderFromCartInput {
  addressId: number;
  notes?: string;
}

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
    data: CreateOrderFromCartInput
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
  getOrderById: async (orderId: number): Promise<OrderWithDetails> => {
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
