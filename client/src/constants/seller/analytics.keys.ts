/**
 * Seller Analytics Query Keys
 * Centralized query keys for seller analytics data
 */

export const sellerAnalyticsKeys = {
  all: ['seller', 'analytics'] as const,
  overview: (startDate?: string, endDate?: string) =>
    [...sellerAnalyticsKeys.all, 'overview', { startDate, endDate }] as const,
  summary: () => [...sellerAnalyticsKeys.all, 'summary'] as const,
  revenueChart: (period?: string) =>
    [...sellerAnalyticsKeys.all, 'revenue-chart', { period }] as const,
  productPerformance: (limit?: number) =>
    [...sellerAnalyticsKeys.all, 'product-performance', { limit }] as const,
  customerInsights: () => [...sellerAnalyticsKeys.all, 'customer-insights'] as const,
} as const;
