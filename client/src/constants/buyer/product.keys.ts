/**
 * Product Query Keys for TanStack Query
 * Used for caching and invalidating product-related queries
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  reviews: (id: number) => [...productKeys.detail(id), 'reviews'] as const,
  rating: (id: number) => [...productKeys.detail(id), 'rating'] as const,
} as const;
