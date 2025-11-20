import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerOrderKeys } from '@/constants/seller';
import * as ordersApi from '@/api/seller/orders';
import { toast } from 'sonner';

/**
 * Custom hooks for seller order operations
 */

/**
 * Get seller orders list
 */
export const useSellerOrders = (filters: ordersApi.OrdersListFilters = {}) => {
  return useQuery({
    queryKey: sellerOrderKeys.list(filters),
    queryFn: () => ordersApi.getOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get single order
 */
export const useSellerOrder = (id: number, enabled = true) => {
  return useQuery({
    queryKey: sellerOrderKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get order invoice HTML
 */
export const useOrderInvoice = (id: number, enabled = false) => {
  return useQuery({
    queryKey: sellerOrderKeys.invoice(id),
    queryFn: () => ordersApi.generateInvoice(id),
    enabled: enabled && !!id,
    staleTime: Infinity, // Invoices don't change
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Get order shipping label HTML
 */
export const useOrderShippingLabel = (id: number, enabled = false) => {
  return useQuery({
    queryKey: sellerOrderKeys.shippingLabel(id),
    queryFn: () => ordersApi.generateShippingLabel(id),
    enabled: enabled && !!id,
    staleTime: Infinity, // Labels don't change
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Update order status mutation
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ordersApi.UpdateOrderStatusRequest }) =>
      ordersApi.updateOrderStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: sellerOrderKeys.detail(variables.id),
      });
      toast.success(data.message || 'Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update order status');
    },
  });
};
