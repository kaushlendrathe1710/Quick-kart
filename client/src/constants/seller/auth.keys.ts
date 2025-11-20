/**
 * Seller Auth Query Keys
 * Centralized query keys for seller authentication and authorization
 */

export const sellerAuthKeys = {
  all: ['seller', 'auth'] as const,
  profile: () => [...sellerAuthKeys.all, 'profile'] as const,
  status: () => [...sellerAuthKeys.all, 'status'] as const,
  approvalStatus: () => [...sellerAuthKeys.all, 'approval-status'] as const,
} as const;
