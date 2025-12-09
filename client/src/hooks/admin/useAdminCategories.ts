import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCategoryKeys, adminSubcategoryKeys } from '@/constants/admin';
import * as categoriesApi from '@/api/admin/categories';
import { toast } from 'sonner';

/**
 * Custom hooks for admin category and subcategory operations
 */

// ============================================
// CATEGORY HOOKS
// ============================================

/**
 * Get all categories (uses public API with pagination)
 */
export const useCategories = () => {
  return useQuery({
    queryKey: adminCategoryKeys.lists(),
    queryFn: async () => {
      const response = await fetch('/api/categories?activeOnly=false');
      const data = await response.json();
      return data.data.categories;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Create category mutation
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: categoriesApi.CreateCategoryRequest) => categoriesApi.createCategory(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      toast.success(data.message || 'Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to create category');
    },
  });
};

/**
 * Update category mutation
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: categoriesApi.UpdateCategoryRequest }) =>
      categoriesApi.updateCategory(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.detail(variables.id) });
      toast.success(data.message || 'Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update category');
    },
  });
};

/**
 * Delete category mutation
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.deleteCategory(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      toast.success(data.message || 'Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete category');
    },
  });
};

// ============================================
// SUBCATEGORY HOOKS
// ============================================

/**
 * Get all subcategories with pagination (optionally filtered by categoryId)
 */
export const useSubcategories = (params?: categoriesApi.GetSubcategoriesParams) => {
  return useQuery({
    queryKey: [...adminSubcategoryKeys.list(params?.categoryId), params?.page, params?.limit],
    queryFn: () => categoriesApi.getAllSubcategories(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Create subcategory mutation
 */
export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: categoriesApi.CreateSubcategoryRequest) =>
      categoriesApi.createSubcategory(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminSubcategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminCategoryKeys.lists() });
      toast.success(data.message || 'Subcategory created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to create subcategory');
    },
  });
};

/**
 * Update subcategory mutation
 */
export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: categoriesApi.UpdateSubcategoryRequest }) =>
      categoriesApi.updateSubcategory(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSubcategoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminSubcategoryKeys.detail(variables.id) });
      toast.success(data.message || 'Subcategory updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to update subcategory');
    },
  });
};

/**
 * Delete subcategory mutation
 */
export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.deleteSubcategory(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminSubcategoryKeys.lists() });
      toast.success(data.message || 'Subcategory deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete subcategory');
    },
  });
};
