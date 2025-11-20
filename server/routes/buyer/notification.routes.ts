import type { Express } from 'express';
import { NotificationController } from '../../controllers/buyer/notification.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register notification routes
 * All routes require authentication
 */
export function registerNotificationRoutes(app: Express): void {
  // Get all notifications for authenticated user
  app.get('/api/notifications', authenticate, NotificationController.getAllNotifications);

  // Get unread notifications count
  app.get('/api/notifications/unread-count', authenticate, NotificationController.getUnreadCount);

  // Get a single notification by ID
  app.get('/api/notifications/:id', authenticate, NotificationController.getNotification);

  // Mark a notification as read
  app.patch('/api/notifications/:id/read', authenticate, NotificationController.markAsRead);

  // Mark all notifications as read
  app.patch('/api/notifications/mark-all-read', authenticate, NotificationController.markAllAsRead);

  // Delete all read notifications
  app.delete(
    '/api/notifications/read',
    authenticate,
    NotificationController.deleteReadNotifications
  );

  // Delete a notification
  app.delete('/api/notifications/:id', authenticate, NotificationController.deleteNotification);
}
