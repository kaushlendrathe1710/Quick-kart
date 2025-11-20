import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerDashboardKeys } from '@/constants/seller';
import * as dashboardApi from '@/api/seller/dashboard';

/**
 * Custom hook for seller dashboard data
 */

/**
 * Get dashboard overview
 */
export const useSellerDashboard = () => {
  return useQuery({
    queryKey: sellerDashboardKeys.overview(),
    queryFn: dashboardApi.getDashboardOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Get recent orders
 */
export const useRecentOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: sellerDashboardKeys.recentOrders(page, limit),
    queryFn: () => dashboardApi.getRecentOrders(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get top products
 */
export const useTopProducts = (limit = 5) => {
  return useQuery({
    queryKey: sellerDashboardKeys.topProducts(limit),
    queryFn: () => dashboardApi.getTopProducts(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get low stock products
 */
export const useLowStockProducts = (threshold = 10) => {
  return useQuery({
    queryKey: sellerDashboardKeys.lowStock(threshold),
    queryFn: () => dashboardApi.getLowStockProducts(threshold),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
