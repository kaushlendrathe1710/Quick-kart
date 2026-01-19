/**
 * Admin Users Query Keys
 * Centralized query keys for admin user management operations
 */

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters: {
    page?: number;
    limit?: number;
    role?: string;
    isApproved?: boolean;
    search?: string;
  }) => [...adminUserKeys.lists(), filters] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminUserKeys.details(), id] as const,
  stats: () => [...adminUserKeys.all, 'stats'] as const,
} as const;
