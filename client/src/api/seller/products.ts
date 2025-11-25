import apiClient from '../apiClient';

/**
 * Seller Products API
 * Handles seller product management endpoints
 */

export interface ProductVariant {
  id: number;
  productId: number;
  color?: string | null;
  size?: string | null;
  sku?: string | null;
  price?: number | null;
  mrp?: number | null;
  stock: number;
  images?: string | null; // JSON string
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  specifications?: string | null;
  sku?: string | null;
  mrp?: number | null;
  purchasePrice?: number | null;
  price: number;
  category: string;
  categoryId?: number | null;
  subcategoryId?: number | null;
  subcategory1?: string | null;
  subcategory2?: string | null;
  color?: string | null;
  size?: string | null;
  thumbnail?: string | null;
  imageUrls?: string | null;
  stock: number;
  gstRate?: string | null;
  weight?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  warranty?: number | null;
  returnPolicy?: string | null;
  isDraft: boolean;
  approved: boolean;
  rejected: boolean;
  deleted: boolean;
  sellerId?: number | null;
  deliveryCharges: number;
  variants?: string | null; // JSON string
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  specifications?: string;
  sku?: string;
  mrp?: number;
  purchasePrice?: number;
  price: number;
  category: string;
  categoryId?: number;
  subcategoryId?: number | null;
  subcategory1?: string;
  subcategory2?: string;
  color?: string;
  size?: string;
  thumbnail?: string;
  imageUrls?: string;
  stock: number;
  gstRate?: string;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  warranty?: number;
  returnPolicy?: string;
  isDraft?: boolean;
  deliveryCharges?: number;
  variants?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductsListResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

export interface ProductVariantsResponse {
  success: boolean;
  message: string;
  data: ProductVariant[];
}

export interface CreateVariantRequest {
  color?: string;
  size?: string;
  sku?: string;
  price?: number;
  mrp?: number;
  stock: number;
  images?: string;
}

export interface UpdateVariantRequest extends Partial<CreateVariantRequest> {}

export interface ProductMediaResponse {
  success: boolean;
  message: string;
  data: {
    thumbnail?: string | null;
    imageUrls?: string | null;
    maxImages: number;
    currentImageCount: number;
  };
}

export interface ProductsListFilters {
  page?: number;
  limit?: number;
  isDraft?: boolean;
  approved?: boolean;
  category?: string;
}

/**
 * Get seller's products
 */
export const getProducts = async (
  filters: ProductsListFilters = {}
): Promise<ProductsListResponse> => {
  const response = await apiClient.get('/seller/products', {
    params: filters,
  });
  return response.data;
};

/**
 * Get single product
 */
export const getProduct = async (id: number): Promise<ProductResponse> => {
  const response = await apiClient.get(`/seller/products/${id}`);
  return response.data;
};

/**
 * Create new product
 */
export const createProduct = async (data: CreateProductRequest): Promise<ProductResponse> => {
  const response = await apiClient.post('/seller/products', data);
  return response.data;
};

/**
 * Update product
 */
export const updateProduct = async (
  id: number,
  data: UpdateProductRequest
): Promise<ProductResponse> => {
  const response = await apiClient.put(`/seller/products/${id}`, data);
  return response.data;
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/seller/products/${id}`);
  return response.data;
};

/**
 * Get product variants
 */
export const getProductVariants = async (productId: number): Promise<ProductVariantsResponse> => {
  const response = await apiClient.get(`/seller/products/${productId}/variants`);
  return response.data;
};

/**
 * Create or update product variants (bulk)
 */
export const createOrUpdateVariants = async (
  productId: number,
  variants: CreateVariantRequest[]
): Promise<ProductVariantsResponse> => {
  const response = await apiClient.post(`/seller/products/${productId}/variants`, variants);
  return response.data;
};

/**
 * Update single variant
 */
export const updateVariant = async (
  productId: number,
  variantId: number,
  data: UpdateVariantRequest
): Promise<{ success: boolean; message: string; data: ProductVariant }> => {
  const response = await apiClient.patch(
    `/seller/products/${productId}/variants/${variantId}`,
    data
  );
  return response.data;
};

/**
 * Get product media information
 */
export const getProductMedia = async (productId: number): Promise<ProductMediaResponse> => {
  const response = await apiClient.get(`/seller/products/${productId}/media`);
  return response.data;
};

/**
 * Update product stock
 */
export const updateProductStock = async (
  productId: number,
  stock: number
): Promise<{ success: boolean; message: string; data: Product }> => {
  const response = await apiClient.patch(`/seller/products/${productId}/stock`, { stock });
  return response.data;
};

/**
 * Upload product images
 */
export const uploadProductImages = async (
  productId: number,
  files: File[]
): Promise<{ success: boolean; message: string; data: { imageUrls: string[] } }> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const response = await apiClient.post(`/seller/products/${productId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Set product thumbnail
 */
export const setProductThumbnail = async (
  productId: number,
  file: File
): Promise<{ success: boolean; message: string; data: { thumbnail: string } }> => {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const response = await apiClient.post(`/seller/products/${productId}/thumbnail`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete product image
 */
export const deleteProductImage = async (
  productId: number,
  imageUrl: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/seller/products/${productId}/images`, {
    data: { imageUrl },
  });
  return response.data;
};
