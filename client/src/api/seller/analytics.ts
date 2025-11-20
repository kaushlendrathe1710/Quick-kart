import apiClient from '../apiClient';

/**
 * Seller Analytics API
 * Handles seller analytics and reporting endpoints
 */

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topCategory?: string;
  conversionRate?: number;
}

export interface AnalyticsSummary {
  today: {
    revenue: number;
    orders: number;
    visitors?: number;
  };
  thisWeek: {
    revenue: number;
    orders: number;
    visitors?: number;
  };
  thisMonth: {
    revenue: number;
    orders: number;
    visitors?: number;
  };
  allTime: {
    revenue: number;
    orders: number;
    customers?: number;
  };
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductPerformance {
  productId: number;
  productName: string;
  thumbnail?: string | null;
  totalSold: number;
  revenue: number;
  averageRating?: number;
  views?: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  repeatCustomers: number;
  averageOrderValue: number;
  topCustomers: Array<{
    userId: number;
    userName: string | null;
    email: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface AnalyticsResponse {
  success: boolean;
  message: string;
  data: AnalyticsOverview;
}

export interface AnalyticsSummaryResponse {
  success: boolean;
  message: string;
  data: AnalyticsSummary;
}

export interface RevenueChartResponse {
  success: boolean;
  message: string;
  data: RevenueChartData[];
}

export interface ProductPerformanceResponse {
  success: boolean;
  message: string;
  data: ProductPerformance[];
}

export interface CustomerInsightsResponse {
  success: boolean;
  message: string;
  data: CustomerInsights;
}

/**
 * Get analytics overview
 */
export const getAnalytics = async (
  startDate?: string,
  endDate?: string
): Promise<AnalyticsResponse> => {
  const response = await apiClient.get('/seller/analytics', {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = async (): Promise<AnalyticsSummaryResponse> => {
  const response = await apiClient.get('/seller/analytics/summary');
  return response.data;
};

/**
 * Get revenue chart data
 */
export const getRevenueChart = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<RevenueChartResponse> => {
  const response = await apiClient.get('/seller/analytics/revenue-chart', {
    params: { period },
  });
  return response.data;
};

/**
 * Get product performance
 */
export const getProductPerformance = async (limit = 10): Promise<ProductPerformanceResponse> => {
  const response = await apiClient.get('/seller/analytics/product-performance', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get customer insights
 */
export const getCustomerInsights = async (): Promise<CustomerInsightsResponse> => {
  const response = await apiClient.get('/seller/analytics/customer-insights');
  return response.data;
};
