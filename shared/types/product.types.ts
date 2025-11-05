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

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
