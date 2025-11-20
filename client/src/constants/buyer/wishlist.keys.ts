/**
 * Wishlist Query Keys for TanStack Query
 * Used for caching and invalidating wishlist-related queries
 */
export const wishlistKeys = {
  all: ['wishlist'] as const,
  detail: () => [...wishlistKeys.all, 'detail'] as const,
  count: () => [...wishlistKeys.all, 'count'] as const,
  check: (productId: number) => [...wishlistKeys.all, 'check', productId] as const,
} as const;
