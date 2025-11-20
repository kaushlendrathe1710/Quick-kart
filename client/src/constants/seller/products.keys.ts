/**
 * Seller Products Query Keys
 * Centralized query keys for seller product operations
 */

export const sellerProductKeys = {
  all: ['seller', 'products'] as const,
  lists: () => [...sellerProductKeys.all, 'list'] as const,
  list: (filters: {
    page?: number;
    limit?: number;
    isDraft?: boolean;
    approved?: boolean;
    category?: string;
  }) => [...sellerProductKeys.lists(), filters] as const,
  details: () => [...sellerProductKeys.all, 'detail'] as const,
  detail: (id: number) => [...sellerProductKeys.details(), id] as const,
  variants: (productId: number) => [...sellerProductKeys.all, 'variants', productId] as const,
  media: (productId: number) => [...sellerProductKeys.all, 'media', productId] as const,
} as const;
