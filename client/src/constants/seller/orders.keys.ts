/**
 * Seller Orders Query Keys
 * Centralized query keys for seller order operations
 */

export const sellerOrderKeys = {
  all: ['seller', 'orders'] as const,
  lists: () => [...sellerOrderKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; status?: string }) =>
    [...sellerOrderKeys.lists(), filters] as const,
  details: () => [...sellerOrderKeys.all, 'detail'] as const,
  detail: (id: number) => [...sellerOrderKeys.details(), id] as const,
  invoice: (id: number) => [...sellerOrderKeys.all, 'invoice', id] as const,
  shippingLabel: (id: number) => [...sellerOrderKeys.all, 'shipping-label', id] as const,
} as const;
