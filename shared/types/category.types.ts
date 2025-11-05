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

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
