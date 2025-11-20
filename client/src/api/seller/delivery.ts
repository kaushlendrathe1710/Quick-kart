import apiClient from '../apiClient';

/**
 * Seller Delivery API
 * Handles delivery creation, assignment, and tracking
 */

export interface DeliveryLocation {
  address: string;
  lat: number;
  lng: number;
  contactName?: string;
  contactPhone?: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  deliveryPartnerId?: number | null;
  pickupLocation: string | DeliveryLocation;
  dropLocation: string | DeliveryLocation;
  buyerId: number;
  deliveryFee: string;
  tip: string;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'picked_up'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'failed';
  assignedAt?: string | null;
  pickedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  deliveryPartner?: {
    id: number;
    userId: number;
    contactNumber: string;
    vehicleType?: string;
    user: {
      name: string | null;
      email: string;
    };
  };
}

export interface CreateDeliveryRequest {
  orderId: number;
  pickupLocation: DeliveryLocation;
  dropLocation: DeliveryLocation;
  buyerId: number;
  deliveryFee: number;
}

export interface AssignDeliveryRequest {
  deliveryPartnerId: number;
}

export interface AvailableDeliveryPartner {
  id: number;
  userId: number;
  contactNumber: string;
  vehicleType?: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  user: {
    name: string | null;
    email: string;
  };
  rating?: number;
  completedDeliveries?: number;
}

/**
 * Get delivery by order ID
 */
export const getDeliveryByOrderId = async (
  orderId: number
): Promise<{ success: boolean; message: string; data: Delivery }> => {
  const response = await apiClient.get(`/seller/delivery/order/${orderId}`);
  return response.data;
};

/**
 * Get delivery by ID
 */
export const getDelivery = async (
  id: number
): Promise<{ success: boolean; message: string; data: Delivery }> => {
  const response = await apiClient.get(`/seller/delivery/${id}`);
  return response.data;
};

/**
 * Create delivery for an order
 */
export const createDelivery = async (
  data: CreateDeliveryRequest
): Promise<{ success: boolean; message: string; data: Delivery }> => {
  const response = await apiClient.post('/seller/delivery', data);
  return response.data;
};

/**
 * Assign delivery to a partner
 */
export const assignDelivery = async (
  id: number,
  data: AssignDeliveryRequest
): Promise<{ success: boolean; message: string; data: Delivery }> => {
  const response = await apiClient.post(`/seller/delivery/${id}/assign`, data);
  return response.data;
};

/**
 * Cancel delivery
 */
export const cancelDelivery = async (
  id: number,
  cancellationReason: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(`/seller/delivery/${id}/cancel`, {
    cancellationReason,
  });
  return response.data;
};

/**
 * Get available delivery partners
 * This would be called to show sellers who can accept the delivery
 */
export const getAvailableDeliveryPartners = async (): Promise<{
  success: boolean;
  message: string;
  data: AvailableDeliveryPartner[];
}> => {
  const response = await apiClient.get('/seller/delivery-partners/available');
  return response.data;
};

/**
 * Get all deliveries for seller
 */
export const getSellerDeliveries = async (filters?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{
  success: boolean;
  message: string;
  data: Delivery[];
  pagination?: any;
}> => {
  const response = await apiClient.get('/seller/deliveries', {
    params: filters,
  });
  return response.data;
};
