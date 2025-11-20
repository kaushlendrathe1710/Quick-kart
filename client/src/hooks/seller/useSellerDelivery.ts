import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as deliveryApi from '@/api/seller/delivery';
import { toast } from 'sonner';

/**
 * Custom hooks for seller delivery operations
 */

const DELIVERY_KEYS = {
  all: ['seller', 'deliveries'] as const,
  lists: () => [...DELIVERY_KEYS.all, 'list'] as const,
  list: (filters: any) => [...DELIVERY_KEYS.lists(), filters] as const,
  details: () => [...DELIVERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...DELIVERY_KEYS.details(), id] as const,
  byOrder: (orderId: number) => [...DELIVERY_KEYS.all, 'by-order', orderId] as const,
  availablePartners: () => [...DELIVERY_KEYS.all, 'available-partners'] as const,
};

/**
 * Get delivery by order ID
 */
export const useDeliveryByOrder = (orderId: number, enabled = true) => {
  return useQuery({
    queryKey: DELIVERY_KEYS.byOrder(orderId),
    queryFn: () => deliveryApi.getDeliveryByOrderId(orderId),
    enabled: enabled && !!orderId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Get delivery by ID
 */
export const useDelivery = (id: number, enabled = true) => {
  return useQuery({
    queryKey: DELIVERY_KEYS.detail(id),
    queryFn: () => deliveryApi.getDelivery(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Get all seller deliveries
 */
export const useSellerDeliveries = (filters: any = {}) => {
  return useQuery({
    queryKey: DELIVERY_KEYS.list(filters),
    queryFn: () => deliveryApi.getSellerDeliveries(filters),
    staleTime: 1000 * 60, // 1 minute
  });
};

/**
 * Get available delivery partners
 */
export const useAvailableDeliveryPartners = (enabled = false) => {
  return useQuery({
    queryKey: DELIVERY_KEYS.availablePartners(),
    queryFn: deliveryApi.getAvailableDeliveryPartners,
    enabled,
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Create delivery mutation
 */
export const useCreateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deliveryApi.createDelivery,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: DELIVERY_KEYS.byOrder(variables.orderId),
      });
      toast.success(data.message || 'Delivery created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create delivery');
    },
  });
};

/**
 * Assign delivery mutation
 */
export const useAssignDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: deliveryApi.AssignDeliveryRequest }) =>
      deliveryApi.assignDelivery(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: DELIVERY_KEYS.detail(variables.id),
      });
      toast.success(data.message || 'Delivery assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to assign delivery');
    },
  });
};

/**
 * Cancel delivery mutation
 */
export const useCancelDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      deliveryApi.cancelDelivery(id, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: DELIVERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: DELIVERY_KEYS.detail(variables.id),
      });
      toast.success(data.message || 'Delivery cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel delivery');
    },
  });
};
