/**
 * Admin Payouts Query Keys
 * Centralized query keys for admin payout operations
 */

export const adminPayoutKeys = {
  all: ['admin', 'payouts'] as const,
  lists: () => [...adminPayoutKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; status?: string; deliveryPartnerId?: number }) =>
    [...adminPayoutKeys.lists(), filters] as const,
  details: () => [...adminPayoutKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminPayoutKeys.details(), id] as const,
  pending: () => [...adminPayoutKeys.all, 'pending'] as const,
  wallet: (id: number) => [...adminPayoutKeys.all, 'wallet', id] as const,
} as const;
