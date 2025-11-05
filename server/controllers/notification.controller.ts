import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@server/types';
import { idSchema, paginationSchema } from '@server/utils/validation';
import {
  getUserNotifications,
  getUnreadNotificationsCount,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
} from '@server/db/services/notification.service';

/**
 * Notification Controller
 * Handles operations for user notifications
 */
export class NotificationController {
  /**
   * Get all notifications for the authenticated user
   * GET /api/notifications
   */
  static async getAllNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { limit, offset } = paginationSchema.parse(req.query);

      const notifications = await getUserNotifications(userId, limit, offset);
      const unreadCount = await getUnreadNotificationsCount(userId);

      return res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications,
          unreadCount,
          total: notifications.length,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Get notifications error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
      });
    }
  }

  /**
   * Get unread notifications count
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const unreadCount = await getUnreadNotificationsCount(userId);

      return res.status(200).json({
        success: true,
        message: 'Unread count retrieved successfully',
        data: { unreadCount },
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve unread count',
      });
    }
  }

  /**
   * Get a single notification by ID
   * GET /api/notifications/:id
   */
  static async getNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const notification = await getNotificationById(id, userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification retrieved successfully',
        data: notification,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Get notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification',
      });
    }
  }

  /**
   * Mark a notification as read
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const notification = await markNotificationAsRead(id, userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Mark as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
      });
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/mark-all-read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const count = await markAllNotificationsAsRead(userId);

      return res.status(200).json({
        success: true,
        message: `${count} notifications marked as read`,
        data: { count },
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
      });
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  static async deleteNotification(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const deleted = await deleteNotification(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Delete notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
      });
    }
  }

  /**
   * Delete all read notifications
   * DELETE /api/notifications/read
   */
  static async deleteReadNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const count = await deleteReadNotifications(userId);

      return res.status(200).json({
        success: true,
        message: `${count} read notifications deleted`,
        data: { count },
      });
    } catch (error) {
      console.error('Delete read notifications error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete read notifications',
      });
    }
  }
}
