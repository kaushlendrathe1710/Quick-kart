import { Request, Response } from 'express';
import { deliveryRatingService } from '@server/db/services';

/**
 * Public Delivery Rating Controller
 * Handles public delivery rating operations (no authentication required)
 */
export class PublicDeliveryRatingController {
  /**
   * Get rating by ID
   * GET /api/public/delivery-rating/:id
   */
  static async getRatingById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const rating = await deliveryRatingService.getRatingById(id);

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Rating retrieved successfully',
        data: rating,
      });
    } catch (error) {
      console.error('Get rating error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve rating',
      });
    }
  }

  /**
   * Get ratings by delivery partner ID
   * GET /api/public/delivery-rating/partner/:partnerId
   */
  static async getRatingsByPartnerId(req: Request, res: Response) {
    try {
      const partnerId = parseInt(req.params.partnerId);
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const ratings = await deliveryRatingService.getRatingsByPartnerId(partnerId, {
        limit,
        offset,
      });
      const stats = await deliveryRatingService.getPartnerRatingStats(partnerId);

      return res.status(200).json({
        success: true,
        message: 'Ratings retrieved successfully',
        data: {
          ratings,
          stats,
        },
      });
    } catch (error) {
      console.error('Get ratings by partner error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ratings',
      });
    }
  }
}
