/**
 * Query keys for Razorpay payment operations
 * Used with TanStack Query for caching and invalidation
 */

export const razorpayKeys = {
  all: ['razorpay'] as const,
  key: () => [...razorpayKeys.all, 'key'] as const,
  orders: () => [...razorpayKeys.all, 'orders'] as const,
  order: (orderId: number) => [...razorpayKeys.orders(), orderId] as const,
  payment: (paymentId: string) => [...razorpayKeys.all, 'payment', paymentId] as const,
} as const;
