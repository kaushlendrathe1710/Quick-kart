import { useQuery } from '@tanstack/react-query';
import { sellerInventoryKeys } from '@/constants/seller';
import * as inventoryApi from '@/api/seller/inventory';
import { useUpdateProduct } from './useSellerProducts';

/**
 * Custom hooks for seller inventory operations
 */

/**
 * Get inventory list
 */
export const useSellerInventory = (filters: inventoryApi.InventoryListFilters = {}) => {
  return useQuery({
    queryKey: sellerInventoryKeys.list(filters),
    queryFn: () => inventoryApi.getInventory(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get low stock alerts
 */
export const useLowStockAlerts = (threshold = 10) => {
  return useQuery({
    queryKey: sellerInventoryKeys.stockAlert(threshold),
    queryFn: () => inventoryApi.getLowStockAlerts(threshold),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Update stock (reuses product update mutation)
 */
export const useUpdateStock = () => {
  const updateProductMutation = useUpdateProduct();

  return {
    ...updateProductMutation,
    mutate: (variables: { productId: number; stock: number }) => {
      updateProductMutation.mutate({
        id: variables.productId,
        data: { stock: variables.stock },
      });
    },
    mutateAsync: async (variables: { productId: number; stock: number }) => {
      return updateProductMutation.mutateAsync({
        id: variables.productId,
        data: { stock: variables.stock },
      });
    },
  };
};
