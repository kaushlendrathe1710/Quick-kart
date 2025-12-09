/**
 * Query keys for admin withdrawal management
 * Used with TanStack Query for caching and invalidation
 */

export const adminWithdrawalKeys = {
  all: ['admin', 'withdrawals'] as const,
  lists: () => [...adminWithdrawalKeys.all, 'list'] as const,
  list: (page: number, limit: number, filters?: { status?: string; userType?: string }) =>
    [...adminWithdrawalKeys.lists(), { page, limit, ...filters }] as const,
  detail: (id: number) => [...adminWithdrawalKeys.all, 'detail', id] as const,
  pending: () => [...adminWithdrawalKeys.all, 'pending'] as const,
  stats: () => [...adminWithdrawalKeys.all, 'stats'] as const,
} as const;
