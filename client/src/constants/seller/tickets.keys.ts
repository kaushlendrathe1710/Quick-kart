/**
 * Seller Tickets Query Keys
 * Centralized query keys for seller ticket operations
 */

export const sellerTicketKeys = {
  all: ['seller', 'tickets'] as const,
  lists: () => [...sellerTicketKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; status?: string }) =>
    [...sellerTicketKeys.lists(), filters] as const,
  details: () => [...sellerTicketKeys.all, 'detail'] as const,
  detail: (id: number) => [...sellerTicketKeys.details(), id] as const,
} as const;
