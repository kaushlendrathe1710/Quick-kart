import { z } from 'zod';
import { notifications, notificationTypeEnum } from '@server/db/schema';

// TypeScript types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

// Validation schemas
export const createNotificationSchema = z.object({
  userId: z.number().int().positive(),
  type: z
    .enum(['order', 'payment', 'delivery', 'promotion', 'account', 'system'])
    .default('system'),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
});

export const markAsReadSchema = z.object({
  isRead: z.boolean(),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
