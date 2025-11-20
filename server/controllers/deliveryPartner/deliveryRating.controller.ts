import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryRatingService } from '@server/db/services';

/**
 * Delivery Partner Rating Controller
 * Handles delivery rating operations for delivery partners (viewing their ratings)
 */
export class DeliveryPartnerRatingController {
  /**
   * Get ratings for current delivery partner
   * GET /api/deliveryPartner/delivery-rating/my-ratings
   */
  static async getMyRatings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const ratings = await deliveryRatingService.getRatingsByPartnerId(userId, { limit, offset });
      const stats = await deliveryRatingService.getPartnerRatingStats(userId);

      return res.status(200).json({
        success: true,
        message: 'Ratings retrieved successfully',
        data: {
          ratings,
          stats,
        },
      });
    } catch (error) {
      console.error('Get my ratings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ratings',
      });
    }
  }
}
