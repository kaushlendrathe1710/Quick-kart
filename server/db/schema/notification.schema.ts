import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './user.schema';

/**
 * Notification Type Enum
 */
export const notificationTypeEnum = pgEnum('notification_type', [
  'order',
  'payment',
  'delivery',
  'promotion',
  'account',
  'system',
]);

/**
 * Notifications table
 * Stores user notifications
 */
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull().default('system'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
