/**
 * Query keys for seller wallet operations
 * Used with TanStack Query for caching and invalidation
 */

export const sellerWalletKeys = {
  all: ['seller', 'wallet'] as const,
  wallet: () => [...sellerWalletKeys.all] as const,
  transactions: () => [...sellerWalletKeys.all, 'transactions'] as const,
  transactionList: (page: number, limit: number, filters?: Record<string, any>) =>
    [...sellerWalletKeys.transactions(), { page, limit, ...filters }] as const,
  withdrawals: () => [...sellerWalletKeys.all, 'withdrawals'] as const,
  withdrawalList: (page: number, limit: number, status?: string) =>
    [...sellerWalletKeys.withdrawals(), { page, limit, status }] as const,
  withdrawal: (id: number) => [...sellerWalletKeys.withdrawals(), id] as const,
} as const;
