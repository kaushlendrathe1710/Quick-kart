import { db } from '@server/db/connect';
import { eq, and, desc } from 'drizzle-orm';
import { notifications } from '@server/db/schema';
import type { Notification, CreateNotificationInput } from '@shared/types';

/**
 * Notification Service
 * Handles all database operations for notifications
 */

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<Notification[]> {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get unread notifications count for a user
 */
export async function getUnreadNotificationsCount(userId: number): Promise<number> {
  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return result.length;
}

/**
 * Get a single notification by ID
 */
export async function getNotificationById(
  notificationId: number,
  userId: number
): Promise<Notification | undefined> {
  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

  return result[0];
}

/**
 * Create a new notification
 */
export async function createNotification(data: CreateNotificationInput): Promise<Notification> {
  const [newNotification] = await db.insert(notifications).values(data).returning();

  return newNotification;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<Notification | undefined> {
  const [updatedNotification] = await db
    .update(notifications)
    .set({ isRead: true, updatedAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  return updatedNotification;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: number): Promise<number> {
  const result = await db
    .update(notifications)
    .set({ isRead: true, updatedAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .returning();

  return result.length;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: number, userId: number): Promise<boolean> {
  const result = await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  return result.length > 0;
}

/**
 * Delete all read notifications for a user
 */
export async function deleteReadNotifications(userId: number): Promise<number> {
  const result = await db
    .delete(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, true)))
    .returning();

  return result.length;
}
