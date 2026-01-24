import apiClient from '../apiClient';
import type { SellerIssueType, TicketStatus } from '@shared/types';

/**
 * Admin Seller Tickets API
 * Handles admin seller ticket management endpoints
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
  issueType?: string;
}

export interface UpdateSellerTicketRequest {
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
 * Get all seller tickets (admin view)
 */
export const getAllSellerTickets = async (
  filters: SellerTicketsListFilters = {}
): Promise<SellerTicketsListResponse> => {
  const response = await apiClient.get('/admin/seller-ticket', {
    params: filters,
  });
  return response.data;
};

/**
 * Get open seller tickets only
 */
export const getOpenSellerTickets = async (): Promise<SellerTicketsListResponse> => {
  const response = await apiClient.get('/admin/seller-ticket/open');
  return response.data;
};

/**
 * Get specific seller ticket by ID
 */
export const getSellerTicketById = async (id: number): Promise<SellerTicketDetailResponse> => {
  const response = await apiClient.get(`/admin/seller-ticket/${id}`);
  return response.data;
};

/**
 * Update seller ticket (admin)
 */
export const updateSellerTicket = async (
  id: number,
  data: UpdateSellerTicketRequest
): Promise<SellerTicketDetailResponse> => {
  const response = await apiClient.patch(`/admin/seller-ticket/${id}`, data);
  return response.data;
};

/**
 * Add admin response to seller ticket
 */
export const addAdminResponse = async (
  id: number,
  data: AddAdminResponseRequest
): Promise<SellerTicketDetailResponse> => {
  const response = await apiClient.post(`/admin/seller-ticket/${id}/response`, data);
  return response.data;
};

/**
 * Resolve seller ticket
 */
export const resolveSellerTicket = async (id: number): Promise<SellerTicketDetailResponse> => {
  const response = await apiClient.post(`/admin/seller-ticket/${id}/resolve`);
  return response.data;
};

/**
 * Close seller ticket
 */
export const closeSellerTicket = async (id: number): Promise<SellerTicketDetailResponse> => {
  const response = await apiClient.post(`/admin/seller-ticket/${id}/close`);
  return response.data;
};

/**
 * Delete seller ticket
 */
export const deleteSellerTicket = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/admin/seller-ticket/${id}`);
  return response.data;
};
