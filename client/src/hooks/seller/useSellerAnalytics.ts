import { useQuery } from '@tanstack/react-query';
import { sellerAnalyticsKeys } from '@/constants/seller';
import * as analyticsApi from '@/api/seller/analytics';

/**
 * Custom hooks for seller analytics operations
 */

/**
 * Get analytics overview
 */
export const useSellerAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: sellerAnalyticsKeys.overview(startDate, endDate),
    queryFn: () => analyticsApi.getAnalytics(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get analytics summary
 */
export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: sellerAnalyticsKeys.summary(),
    queryFn: analyticsApi.getAnalyticsSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get revenue chart data
 */
export const useRevenueChart = (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: sellerAnalyticsKeys.revenueChart(period),
    queryFn: () => analyticsApi.getRevenueChart(period),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Get product performance
 */
export const useProductPerformance = (limit = 10) => {
  return useQuery({
    queryKey: sellerAnalyticsKeys.productPerformance(limit),
    queryFn: () => analyticsApi.getProductPerformance(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Get customer insights
 */
export const useCustomerInsights = () => {
  return useQuery({
    queryKey: sellerAnalyticsKeys.customerInsights(),
    queryFn: analyticsApi.getCustomerInsights,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
