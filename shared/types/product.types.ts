import { z } from 'zod';
import { products } from '@server/db/schema';

// TypeScript types
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.number().int().positive(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  discount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Product listing and filtering schemas
export const listProductsSchema = z.object({
  // Filters
  category: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  inStock: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  search: z.string().optional(),
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(20),
  // Sorting
  sortBy: z.enum(['price', 'rating', 'createdAt', 'name']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsInput = z.infer<typeof listProductsSchema>;

// Paginated response type
export interface PaginatedProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
