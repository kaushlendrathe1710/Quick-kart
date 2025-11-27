import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminTicketKeys } from '@/constants/admin';
import * as ticketsApi from '@/api/admin/tickets';
import { toast } from 'sonner';

/**
 * Custom hooks for admin ticket operations
 */

/**
 * Get all tickets list (with filters)
 */
export const useAllTickets = (filters: ticketsApi.TicketsListFilters = {}) => {
  return useQuery({
    queryKey: adminTicketKeys.list(filters),
    queryFn: () => ticketsApi.getAllTickets(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get open tickets only
 */
export const useOpenTickets = () => {
  return useQuery({
    queryKey: adminTicketKeys.open(),
    queryFn: () => ticketsApi.getOpenTickets(),
    staleTime: 1000 * 60 * 1, // 1 minute (refresh more frequently for open tickets)
  });
};

/**
 * Get single ticket by ID
 */
export const useTicket = (id: number, enabled = true) => {
  return useQuery({
    queryKey: adminTicketKeys.detail(id),
    queryFn: () => ticketsApi.getTicketById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Update ticket mutation
 */
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ticketsApi.UpdateTicketRequest }) =>
      ticketsApi.updateTicket(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.open() });
      toast.success(data.message || 'Ticket updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update ticket');
    },
  });
};

/**
 * Add admin response mutation
 */
export const useAddAdminResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ticketsApi.AddAdminResponseRequest }) =>
      ticketsApi.addAdminResponse(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.open() });
      toast.success(data.message || 'Response added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to add response');
    },
  });
};

/**
 * Resolve ticket mutation
 */
export const useResolveTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketsApi.resolveTicket(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.open() });
      toast.success(data.message || 'Ticket resolved successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to resolve ticket');
    },
  });
};

/**
 * Close ticket mutation
 */
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketsApi.closeTicket(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.open() });
      toast.success(data.message || 'Ticket closed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to close ticket');
    },
  });
};

/**
 * Delete ticket mutation
 */
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ticketsApi.deleteTicket(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminTicketKeys.open() });
      toast.success(data.message || 'Ticket deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete ticket');
    },
  });
};
