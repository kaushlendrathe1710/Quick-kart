import apiClient from '../apiClient';

/**
 * Admin Tickets API
 * Handles admin ticket management endpoints
 */

export interface Ticket {
  id: number;
  deliveryPartnerId?: number | null;
  sellerId?: number | null;
  issueType:
    | 'account_related'
    | 'payment_issue'
    | 'vehicle_issue'
    | 'delivery_issue'
    | 'technical_problem'
    | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminResponse?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TicketsListResponse {
  success: boolean;
  message: string;
  data: Ticket[];
}

export interface TicketDetailResponse {
  success: boolean;
  message: string;
  data: Ticket;
}

export interface TicketsListFilters {
  page?: number;
  limit?: number;
  status?: string;
  issueType?: string;
  deliveryPartnerId?: number;
  sellerId?: number;
}

export interface UpdateTicketRequest {
  issueType?: string;
  subject?: string;
  description?: string;
  status?: string;
}

export interface AddAdminResponseRequest {
  adminResponse: string;
  status?: string;
}

/**
 * Get all tickets (admin view)
 */
export const getAllTickets = async (
  filters: TicketsListFilters = {}
): Promise<TicketsListResponse> => {
  const response = await apiClient.get('/admin/ticket', {
    params: filters,
  });
  return response.data;
};

/**
 * Get open tickets only
 */
export const getOpenTickets = async (): Promise<TicketsListResponse> => {
  const response = await apiClient.get('/admin/ticket/open');
  return response.data;
};

/**
 * Get specific ticket by ID
 */
export const getTicketById = async (id: number): Promise<TicketDetailResponse> => {
  const response = await apiClient.get(`/admin/ticket/${id}`);
  return response.data;
};

/**
 * Update ticket (admin)
 */
export const updateTicket = async (
  id: number,
  data: UpdateTicketRequest
): Promise<TicketDetailResponse> => {
  const response = await apiClient.patch(`/admin/ticket/${id}`, data);
  return response.data;
};

/**
 * Add admin response to ticket
 */
export const addAdminResponse = async (
  id: number,
  data: AddAdminResponseRequest
): Promise<TicketDetailResponse> => {
  const response = await apiClient.post(`/admin/ticket/${id}/response`, data);
  return response.data;
};

/**
 * Resolve ticket
 */
export const resolveTicket = async (id: number): Promise<TicketDetailResponse> => {
  const response = await apiClient.post(`/admin/ticket/${id}/resolve`);
  return response.data;
};

/**
 * Close ticket
 */
export const closeTicket = async (id: number): Promise<TicketDetailResponse> => {
  const response = await apiClient.post(`/admin/ticket/${id}/close`);
  return response.data;
};

/**
 * Delete ticket
 */
export const deleteTicket = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/admin/ticket/${id}`);
  return response.data;
};
