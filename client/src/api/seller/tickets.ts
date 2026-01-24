import apiClient from '../apiClient';
import type { SellerIssueType, TicketStatus } from '@shared/types';

/**
 * Seller Tickets API
 * Handles seller ticket management endpoints
 */

export interface SellerTicket {
  id: number;
  sellerId: number;
  issueType: SellerIssueType;
  subject: string;
  description: string;
  status: TicketStatus;
  adminResponse?: string | null;
  adminId?: number | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SellerTicketsListResponse {
  success: boolean;
  message: string;
  data: SellerTicket[];
}

export interface SellerTicketDetailResponse {
  success: boolean;
  message: string;
  data: SellerTicket;
}

export interface SellerTicketsListFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateSellerTicketRequest {
  issueType: SellerIssueType;
  subject: string;
  description: string;
}

/**
 * Get all tickets for current seller
 */
export const getMyTickets = async (
  filters: SellerTicketsListFilters = {}
): Promise<SellerTicketsListResponse> => {
  const response = await apiClient.get('/seller/ticket', {
    params: filters,
  });
  return response.data;
};

/**
 * Get specific ticket by ID
 */
export const getTicketById = async (id: number): Promise<SellerTicketDetailResponse> => {
  const response = await apiClient.get(`/seller/ticket/${id}`);
  return response.data;
};

/**
 * Create a new ticket
 */
export const createTicket = async (
  data: CreateSellerTicketRequest
): Promise<SellerTicketDetailResponse> => {
  const response = await apiClient.post('/seller/ticket', data);
  return response.data;
};
