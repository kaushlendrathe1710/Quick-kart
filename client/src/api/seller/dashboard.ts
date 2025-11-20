import apiClient from '../apiClient';

/**
 * Seller Dashboard API
 * Handles seller dashboard data endpoints
 */

export interface DashboardAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  averageOrderValue: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
}

export interface DashboardOrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  product: {
    name: string;
    thumbnail?: string | null;
    imageUrls?: string | null;
  };
}

export interface DashboardOrder {
  id: number;
  userId: number;
  sellerId?: number | null;
  status: string;
  totalAmount: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  orderItems: DashboardOrderItem[];
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    analytics: DashboardAnalytics;
    pendingProductsCount: number;
    recentOrders: DashboardOrder[];
  };
}

export interface TopProduct {
  id: number;
  name: string;
  thumbnail?: string | null;
  imageUrls?: string | null;
  price: number;
  stock: number;
  totalSold: number;
  revenue: number;
}

export interface TopProductsResponse {
  success: boolean;
  message: string;
  data: TopProduct[];
}

export interface LowStockProduct {
  id: number;
  name: string;
  thumbnail?: string | null;
  imageUrls?: string | null;
  stock: number;
  price: number;
  sku?: string | null;
}

export interface LowStockResponse {
  success: boolean;
  message: string;
  data: LowStockProduct[];
}

export interface RecentOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: DashboardOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Get dashboard overview
 */
export const getDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
  const response = await apiClient.get('/seller/dashboard');
  return response.data;
};

/**
 * Get recent orders with pagination
 */
export const getRecentOrders = async (page = 1, limit = 10): Promise<RecentOrdersResponse> => {
  const response = await apiClient.get('/seller/dashboard/orders', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Get top performing products
 */
export const getTopProducts = async (limit = 5): Promise<TopProductsResponse> => {
  const response = await apiClient.get('/seller/dashboard/top-products', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (threshold = 10): Promise<LowStockResponse> => {
  const response = await apiClient.get('/seller/dashboard/low-stock', {
    params: { threshold },
  });
  return response.data;
};
