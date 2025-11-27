/**
 * Admin Tickets Query Keys
 * Centralized query keys for admin ticket operations
 */

export const adminTicketKeys = {
  all: ['admin', 'tickets'] as const,
  lists: () => [...adminTicketKeys.all, 'list'] as const,
  list: (filters: {
    page?: number;
    limit?: number;
    status?: string;
    issueType?: string;
    deliveryPartnerId?: number;
    sellerId?: number;
  }) => [...adminTicketKeys.lists(), filters] as const,
  details: () => [...adminTicketKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminTicketKeys.details(), id] as const,
  open: () => [...adminTicketKeys.all, 'open'] as const,
} as const;
