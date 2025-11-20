import apiClient from '../apiClient';

/**
 * Seller Orders API
 * Handles seller order management endpoints
 */

export interface OrderAddress {
  id: number;
  userId: number;
  type: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId?: number | null;
  quantity: number;
  price: string;
  discount?: string | null;
  finalPrice: string;
  product: {
    name: string;
    thumbnail?: string | null;
    imageUrls?: string | null;
    sku?: string | null;
  };
}

export interface Order {
  id: number;
  userId: number;
  sellerId?: number | null;
  addressId: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  totalAmount: string;
  discount?: string | null;
  finalAmount: string;
  notes?: string | null;
  trackingNumber?: string | null;
  courierName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  buyer: {
    name: string | null;
    email: string;
    contactNumber?: string | null;
  };
  address: OrderAddress;
  orderItems: OrderItem[];
}

export interface OrdersListResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderDetailResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface UpdateOrderStatusRequest {
  status: string;
  trackingNumber?: string;
  courierName?: string;
}

export interface OrdersListFilters {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Get seller's orders
 */
export const getOrders = async (filters: OrdersListFilters = {}): Promise<OrdersListResponse> => {
  const response = await apiClient.get('/seller/orders', {
    params: filters,
  });
  return response.data;
};

/**
 * Get single order details
 */
export const getOrder = async (id: number): Promise<OrderDetailResponse> => {
  const response = await apiClient.get(`/seller/orders/${id}`);
  return response.data;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  id: number,
  data: UpdateOrderStatusRequest
): Promise<{ success: boolean; message: string; data: Order }> => {
  const response = await apiClient.patch(`/seller/orders/${id}/status`, data);
  return response.data;
};

/**
 * Generate invoice HTML
 */
export const generateInvoice = async (
  id: number
): Promise<{ success: boolean; message: string; data: { html: string } }> => {
  const response = await apiClient.get(`/seller/orders/${id}/invoice`);
  return response.data;
};

/**
 * Generate shipping label HTML
 */
export const generateShippingLabel = async (
  id: number
): Promise<{ success: boolean; message: string; data: { html: string } }> => {
  const response = await apiClient.get(`/seller/orders/${id}/shipping-label`);
  return response.data;
};
