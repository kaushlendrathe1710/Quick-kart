/**
 * Admin Banners Query Keys
 * Centralized query keys for admin banner operations
 */

export const adminBannerKeys = {
  all: ['admin', 'banners'] as const,
  lists: () => [...adminBannerKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...adminBannerKeys.lists(), { page, limit }] as const,
  details: () => [...adminBannerKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminBannerKeys.details(), id] as const,
} as const;
