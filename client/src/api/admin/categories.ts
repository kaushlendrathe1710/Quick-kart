import apiClient from '../apiClient';

/**
 * Admin Categories API
 * Handles admin category and subcategory management endpoints
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  categoryId: number;
  parentId: number | null;
  displayOrder: number;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CreateSubcategoryRequest {
  name: string;
  categoryId: number;
  description?: string;
  image?: string;
  active?: boolean;
}

export interface UpdateSubcategoryRequest {
  name?: string;
  categoryId?: number;
  description?: string;
  image?: string;
  displayOrder?: number;
  active?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  category: Category;
}

export interface SubcategoryResponse {
  success: boolean;
  message: string;
  subcategory: Subcategory;
}

/**
 * Create new category
 */
export const createCategory = async (data: CreateCategoryRequest): Promise<CategoryResponse> => {
  const response = await apiClient.post('/admin/categories', data);
  return response.data;
};

/**
 * Update category
 */
export const updateCategory = async (
  id: number,
  data: UpdateCategoryRequest
): Promise<CategoryResponse> => {
  const response = await apiClient.put(`/admin/categories/${id}`, data);
  return response.data;
};

/**
 * Delete category
 */
export const deleteCategory = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/admin/categories/${id}`);
  return response.data;
};

export interface SubcategoryListResponse {
  subcategories: Subcategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetSubcategoriesParams {
  categoryId?: number;
  page?: number;
  limit?: number;
}

/**
 * Get all subcategories with pagination (optionally filtered by categoryId)
 */
export const getAllSubcategories = async (
  params?: GetSubcategoriesParams
): Promise<SubcategoryListResponse> => {
  const response = await apiClient.get('/admin/subcategories', {
    params: {
      categoryId: params?.categoryId,
      page: params?.page || 1,
      limit: params?.limit || 10,
    },
  });
  return response.data;
};

/**
 * Create new subcategory
 */
export const createSubcategory = async (
  data: CreateSubcategoryRequest
): Promise<SubcategoryResponse> => {
  const response = await apiClient.post('/admin/subcategories', data);
  return response.data;
};

/**
 * Update subcategory
 */
export const updateSubcategory = async (
  id: number,
  data: UpdateSubcategoryRequest
): Promise<SubcategoryResponse> => {
  const response = await apiClient.put(`/admin/subcategories/${id}`, data);
  return response.data;
};

/**
 * Delete subcategory
 */
export const deleteSubcategory = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/admin/subcategories/${id}`);
  return response.data;
};

/**
 * Upload category icon image
 */
export const uploadCategoryIcon = async (
  file: File
): Promise<{ success: boolean; message: string; imageUrl: string }> => {
  const formData = new FormData();
  formData.append('icon', file);

  const response = await apiClient.post('/admin/categories/upload-icon', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Upload subcategory image
 */
export const uploadSubcategoryImage = async (
  file: File
): Promise<{ success: boolean; message: string; imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post('/admin/subcategories/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
