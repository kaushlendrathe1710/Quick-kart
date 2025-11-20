/**
 * Cart Query Keys for TanStack Query
 * Used for caching and invalidating cart-related queries
 */
export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
  count: () => [...cartKeys.all, 'count'] as const,
} as const;
