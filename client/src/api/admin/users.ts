import apiClient from '../apiClient';

/**
 * Admin Users API
 * Handles admin user management endpoints (buyer, seller, deliveryPartner)
 */

export interface User {
  id: number;
  name: string;
  email: string;
  contactNumber?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'seller' | 'deliveryPartner';
  isApproved: boolean;
  rejected?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserStats {
  success: boolean;
  data: {
    total: number;
    buyers: number;
    sellers: number;
    deliveryPartners: number;
    approvedSellers: number;
    pendingSellers: number;
    approvedDeliveryPartners: number;
    pendingDeliveryPartners: number;
  };
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserDetailResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UsersListFilters {
  page?: number;
  limit?: number;
  role?: string;
  isApproved?: boolean;
  search?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  contactNumber?: string;
  role?: 'user' | 'admin' | 'seller' | 'deliveryPartner';
  isApproved?: boolean;
}

export interface UpdateUserRoleRequest {
  role: 'user' | 'admin' | 'seller' | 'deliveryPartner';
}

/**
 * Get all users with filters and pagination
 */
export const getAllUsers = async (filters: UsersListFilters = {}): Promise<UsersListResponse> => {
  const response = await apiClient.get('/admin/users', {
    params: filters,
  });
  return response.data;
};

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  const response = await apiClient.get('/admin/users/stats');
  return response.data;
};

/**
 * Get single user by ID
 */
export const getUserById = async (id: number): Promise<UserDetailResponse> => {
  const response = await apiClient.get(`/admin/users/${id}`);
  return response.data;
};

/**
 * Update user details
 */
export const updateUser = async (
  id: number,
  data: UpdateUserRequest
): Promise<UserDetailResponse> => {
  const response = await apiClient.put(`/admin/users/${id}`, data);
  return response.data;
};

/**
 * Update user role
 */
export const updateUserRole = async (
  id: number,
  data: UpdateUserRoleRequest
): Promise<UserDetailResponse> => {
  const response = await apiClient.put(`/admin/users/${id}/role`, data);
  return response.data;
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (id: number): Promise<UserDetailResponse> => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};

/**
 * Recover deleted user
 */
export const recoverUser = async (id: number): Promise<UserDetailResponse> => {
  const response = await apiClient.post(`/admin/users/${id}/recover`);
  return response.data;
};

/**
 * Get users by role (convenience method)
 */
export const getUsersByRole = async (
  role: 'user' | 'seller' | 'deliveryPartner',
  filters: Omit<UsersListFilters, 'role'> = {}
): Promise<UsersListResponse> => {
  return getAllUsers({ ...filters, role });
};

/**
 * Get buyers
 */
export const getBuyers = async (
  filters: Omit<UsersListFilters, 'role'> = {}
): Promise<UsersListResponse> => {
  return getUsersByRole('user', filters);
};

/**
 * Get sellers
 */
export const getSellers = async (
  filters: Omit<UsersListFilters, 'role'> = {}
): Promise<UsersListResponse> => {
  return getUsersByRole('seller', filters);
};

/**
 * Get delivery partners
 */
export const getDeliveryPartners = async (
  filters: Omit<UsersListFilters, 'role'> = {}
): Promise<UsersListResponse> => {
  return getUsersByRole('deliveryPartner', filters);
};
