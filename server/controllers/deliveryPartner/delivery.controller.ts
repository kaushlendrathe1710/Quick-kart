import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryService, deliveryRatingService } from '@server/db/services';
import { getPaginationParams, createPaginatedResponse } from '@server/utils/pagination.utils';

/**
 * Delivery Partner Delivery Controller
 * Handles delivery operations for delivery partners
 */
export class DeliveryPartnerDeliveryController {
  /**
   * Get delivery by ID
   * GET /api/deliveryPartner/delivery/:id
   */
  static async getDeliveryById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const delivery = await deliveryService.getDeliveryById(id);

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      // Check if user is the assigned delivery partner
      if (delivery.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this delivery',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Delivery retrieved successfully',
        data: delivery,
      });
    } catch (error) {
      console.error('Get delivery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve delivery',
      });
    }
  }

  /**
   * Get deliveries for current delivery partner with pagination
   * GET /api/deliveryPartner/delivery/my-deliveries?page=1&limit=20
   */
  static async getMyDeliveries(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { page, limit, offset } = getPaginationParams(req);

      const result = await deliveryService.getDeliveriesByPartnerId(userId, { limit, offset });

      // If service returns paginated data
      if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
        return res.status(200).json({
          success: true,
          message: 'Deliveries retrieved successfully',
          ...createPaginatedResponse(result.data, page, limit, result.total),
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Deliveries retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Get my deliveries error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve deliveries',
      });
    }
  }

  /**
   * Get delivery statistics for current partner
   * GET /api/deliveryPartner/delivery/my-stats
   */
  static async getMyStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const stats = await deliveryService.getPartnerStats(userId);
      const ratingStats = await deliveryRatingService.getPartnerRatingStats(userId);

      return res.status(200).json({
        success: true,
        message: 'Statistics retrieved successfully',
        data: {
          ...stats,
          ratings: ratingStats,
        },
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve statistics',
      });
    }
  }

  /**
   * Update delivery status
   * PATCH /api/deliveryPartner/delivery/:id/status
   */
  static async updateDeliveryStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const { status } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing delivery
      const existingDelivery = await deliveryService.getDeliveryById(id);
      if (!existingDelivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      // Check if user is the assigned delivery partner
      if (existingDelivery.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this delivery',
        });
      }

      // Update delivery status
      const updatedDelivery = await deliveryService.updateDeliveryStatus(id, status);

      return res.status(200).json({
        success: true,
        message: 'Delivery status updated successfully',
        data: updatedDelivery,
      });
    } catch (error) {
      console.error('Update delivery status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update delivery status',
      });
    }
  }
}
