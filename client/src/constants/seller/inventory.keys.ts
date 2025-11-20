/**
 * Seller Inventory Query Keys
 * Centralized query keys for seller inventory operations
 */

export const sellerInventoryKeys = {
  all: ['seller', 'inventory'] as const,
  lists: () => [...sellerInventoryKeys.all, 'list'] as const,
  list: (filters: { lowStock?: boolean; page?: number; limit?: number }) =>
    [...sellerInventoryKeys.lists(), filters] as const,
  stockAlert: (threshold?: number) =>
    [...sellerInventoryKeys.all, 'stock-alert', { threshold }] as const,
} as const;
