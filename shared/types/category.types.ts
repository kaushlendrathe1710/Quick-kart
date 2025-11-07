import { z } from 'zod';
import { categories } from '@server/db/schema';

// TypeScript types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Category listing schema with pagination
export const listCategoriesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).default(10),
  search: z.string().optional(),
  activeOnly: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default('true'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesInput = z.infer<typeof listCategoriesSchema>;

// Paginated response type
export interface PaginatedCategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
