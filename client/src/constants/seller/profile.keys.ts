/**
 * Seller Profile Query Keys
 * Centralized query keys for seller profile and settings
 */

export const sellerProfileKeys = {
  all: ['seller', 'profile'] as const,
  info: () => [...sellerProfileKeys.all, 'info'] as const,
  business: () => [...sellerProfileKeys.all, 'business-details'] as const,
  banking: () => [...sellerProfileKeys.all, 'banking-information'] as const,
  payments: (page?: number, limit?: number, status?: string) =>
    [...sellerProfileKeys.all, 'payments', { page, limit, status }] as const,
  paymentsSummary: () => [...sellerProfileKeys.all, 'payments-summary'] as const,
} as const;
