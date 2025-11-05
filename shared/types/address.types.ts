import { z } from 'zod';
import { addresses } from '@server/db/schema';

// TypeScript types
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

// Validation schemas
export const createAddressSchema = z.object({
  addressType: z.string().min(1).max(50), // Flexible string for any address type
  addressLine: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  postalCode: z.string().min(4).max(20),
  country: z.string().min(2).max(100).default('India'),
  landmark: z.string().optional(),
  contactNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
