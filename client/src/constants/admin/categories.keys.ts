/**
 * Admin Category Query Keys
 * For TanStack Query cache management
 */

export const adminCategoryKeys = {
  all: ['admin', 'categories'] as const,
  lists: () => [...adminCategoryKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...adminCategoryKeys.lists(), filters] as const,
  details: () => [...adminCategoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminCategoryKeys.details(), id] as const,
};

export const adminSubcategoryKeys = {
  all: ['admin', 'subcategories'] as const,
  lists: () => [...adminSubcategoryKeys.all, 'list'] as const,
  list: (categoryId?: number) => [...adminSubcategoryKeys.lists(), { categoryId }] as const,
  details: () => [...adminSubcategoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminSubcategoryKeys.details(), id] as const,
};
