/**
 * Seller Dashboard Query Keys
 * Centralized query keys for seller dashboard data
 */

export const sellerDashboardKeys = {
  all: ['seller', 'dashboard'] as const,
  overview: () => [...sellerDashboardKeys.all, 'overview'] as const,
  recentOrders: (page?: number, limit?: number) =>
    [...sellerDashboardKeys.all, 'recent-orders', { page, limit }] as const,
  topProducts: (limit?: number) => [...sellerDashboardKeys.all, 'top-products', { limit }] as const,
  lowStock: (threshold?: number) =>
    [...sellerDashboardKeys.all, 'low-stock', { threshold }] as const,
} as const;
