import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerProductKeys } from '@/constants/seller';
import * as productsApi from '@/api/seller/products';
import { toast } from 'sonner';

/**
 * Custom hooks for seller product operations
 */

/**
 * Get seller products list
 */
export const useSellerProducts = (filters: productsApi.ProductsListFilters = {}) => {
  return useQuery({
    queryKey: sellerProductKeys.list(filters),
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get single product
 */
export const useSellerProduct = (id: number, enabled = true) => {
  return useQuery({
    queryKey: sellerProductKeys.detail(id),
    queryFn: () => productsApi.getProduct(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get product variants
 */
export const useProductVariants = (productId: number, enabled = true) => {
  return useQuery({
    queryKey: sellerProductKeys.variants(productId),
    queryFn: () => productsApi.getProductVariants(productId),
    enabled: enabled && !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get product media
 */
export const useProductMedia = (productId: number, enabled = true) => {
  return useQuery({
    queryKey: sellerProductKeys.media(productId),
    queryFn: () => productsApi.getProductMedia(productId),
    enabled: enabled && !!productId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Create product mutation
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.lists() });
      toast.success(data.message || 'Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create product');
    },
  });
};

/**
 * Update product mutation
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: productsApi.UpdateProductRequest }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.detail(variables.id),
      });
      toast.success(data.message || 'Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update product');
    },
  });
};

/**
 * Delete product mutation
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: sellerProductKeys.lists() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueriesData({
        queryKey: sellerProductKeys.lists(),
      });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: sellerProductKeys.lists() }, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((p: any) => p.id !== productId),
        };
      });

      return { previousProducts };
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Product deleted successfully');
    },
    onError: (error: any, productId, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        context.previousProducts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error?.message || 'Failed to delete product');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.lists() });
    },
  });
};

/**
 * Create or update variants mutation
 */
export const useCreateOrUpdateVariants = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variants,
    }: {
      productId: number;
      variants: productsApi.CreateVariantRequest[];
    }) => productsApi.createOrUpdateVariants(productId, variants),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.variants(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.detail(variables.productId),
      });
      toast.success(data.message || 'Variants saved successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save variants');
    },
  });
};

/**
 * Update single variant mutation
 */
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: number;
      variantId: number;
      data: productsApi.UpdateVariantRequest;
    }) => productsApi.updateVariant(productId, variantId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.variants(variables.productId),
      });
      toast.success(data.message || 'Variant updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update variant');
    },
  });
};

/**
 * Upload product images mutation
 */
export const useUploadProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, files }: { productId: number; files: File[] }) =>
      productsApi.uploadProductImages(productId, files),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.media(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.detail(variables.productId),
      });
      toast.success(data.message || 'Images uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload images');
    },
  });
};

/**
 * Set product thumbnail mutation
 */
export const useSetProductThumbnail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, file }: { productId: number; file: File }) =>
      productsApi.setProductThumbnail(productId, file),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.media(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.detail(variables.productId),
      });
      toast.success(data.message || 'Thumbnail set successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to set thumbnail');
    },
  });
};

/**
 * Delete product image mutation
 */
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, imageUrl }: { productId: number; imageUrl: string }) =>
      productsApi.deleteProductImage(productId, imageUrl),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.media(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: sellerProductKeys.detail(variables.productId),
      });
      toast.success(data.message || 'Image deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete image');
    },
  });
};
