import apiClient from '../apiClient';

/**
 * Public Categories API
 * Handles category and subcategory fetching for product management
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
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

export interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface SubcategoriesResponse {
  success: boolean;
  message: string;
  data: Subcategory[];
}

export interface CategoryDetailResponse {
  success: boolean;
  message: string;
  data: Category;
}

/**
 * Get all active categories
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  const response = await apiClient.get('/categories');
  return response.data;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: number): Promise<CategoryDetailResponse> => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data;
};

/**
 * Get subcategories by category ID
 */
export const getSubcategoriesByCategoryId = async (
  categoryId: number
): Promise<SubcategoriesResponse> => {
  const response = await apiClient.get(`/categories/${categoryId}/subcategories`);
  return response.data;
};
