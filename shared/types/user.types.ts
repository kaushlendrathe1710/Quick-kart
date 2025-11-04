import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users, userRoleEnum } from '@server/db/schema';

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  avatar: true,
  role: true,
  isapproved: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserRole = (typeof userRoleEnum.enumValues)[number];

// Profile update validation schema
export const updateProfileSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
