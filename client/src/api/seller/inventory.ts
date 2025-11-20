import apiClient from '../apiClient';
import { Product } from './products';

/**
 * Seller Inventory API
 * Handles seller inventory management endpoints
 */

export interface InventoryItem extends Product {
  stockLevel: 'low' | 'medium' | 'high' | 'out';
  lastRestocked?: string | null;
}

export interface InventoryListResponse {
  success: boolean;
  message: string;
  data: InventoryItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface UpdateStockRequest {
  stock: number;
  notes?: string;
}

export interface InventoryListFilters {
  page?: number;
  limit?: number;
  lowStock?: boolean;
}

/**
 * Get inventory (reuses products endpoint with filters)
 */
export const getInventory = async (
  filters: InventoryListFilters = {}
): Promise<InventoryListResponse> => {
  // Use products endpoint since inventory is essentially product list
  const response = await apiClient.get('/seller/products', {
    params: filters,
  });
  return response.data;
};

/**
 * Get low stock alerts
 */
export const getLowStockAlerts = async (threshold = 10): Promise<InventoryListResponse> => {
  const response = await apiClient.get('/seller/dashboard/low-stock', {
    params: { threshold },
  });
  return response.data;
};

/**
 * Update product stock
 */
export const updateStock = async (
  productId: number,
  data: UpdateStockRequest
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.patch(`/seller/products/${productId}`, {
    stock: data.stock,
  });
  return response.data;
};

/**
 * Bulk update stock
 */
export const bulkUpdateStock = async (
  updates: Array<{ productId: number; stock: number }>
): Promise<{ success: boolean; message: string; updated: number }> => {
  // This would need a bulk endpoint on backend
  // For now, we'll do sequential updates
  let updated = 0;
  for (const update of updates) {
    try {
      await updateStock(update.productId, { stock: update.stock });
      updated++;
    } catch (error) {
      console.error(`Failed to update stock for product ${update.productId}:`, error);
    }
  }
  return {
    success: true,
    message: `Updated stock for ${updated} products`,
    updated,
  };
};
