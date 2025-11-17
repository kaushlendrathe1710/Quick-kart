import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryRatingService, deliveryService } from '@server/db/services';

/**
 * Buyer Delivery Rating Controller
 * Handles delivery rating operations for buyers (customers)
 */
export class BuyerDeliveryRatingController {
  /**
   * Create rating for a delivery
   * POST /api/buyer/delivery-rating
   */
  static async createRating(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { deliveryId, deliveryPartnerId, rating, feedback } = req.body;

      // Check if delivery exists
      const delivery = await deliveryService.getDeliveryById(deliveryId);
      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      // Check if delivery is completed
      if (delivery.status !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Can only rate completed deliveries',
        });
      }

      // Check if user is the buyer
      if (delivery.buyerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to rate this delivery',
        });
      }

      // Check if rating already exists
      const existingRating = await deliveryRatingService.ratingExistsForDelivery(deliveryId);
      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'Rating already exists for this delivery',
        });
      }

      // Create rating
      const newRating = await deliveryRatingService.createRating({
        deliveryId,
        deliveryPartnerId,
        buyerId: userId,
        rating,
        feedback,
      });

      // Update delivery with rating ID
      await deliveryService.updateDelivery(deliveryId, { ratingId: newRating.id });

      return res.status(201).json({
        success: true,
        message: 'Rating created successfully',
        data: newRating,
      });
    } catch (error) {
      console.error('Create rating error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create rating',
      });
    }
  }

  /**
   * Update rating
   * PATCH /api/buyer/delivery-rating/:id
   */
  static async updateRating(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing rating
      const existingRating = await deliveryRatingService.getRatingById(id);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found',
        });
      }

      // Check if user is the buyer who created the rating
      if (existingRating.buyerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this rating',
        });
      }

      const { rating, feedback } = req.body;

      const updateData: any = {};
      if (rating !== undefined) updateData.rating = rating;
      if (feedback !== undefined) updateData.feedback = feedback;

      // Update rating
      const updatedRating = await deliveryRatingService.updateRating(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Rating updated successfully',
        data: updatedRating,
      });
    } catch (error) {
      console.error('Update rating error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update rating',
      });
    }
  }

  /**
   * Delete rating
   * DELETE /api/buyer/delivery-rating/:id
   */
  static async deleteRating(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing rating
      const existingRating = await deliveryRatingService.getRatingById(id);
      if (!existingRating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found',
        });
      }

      // Check if user is the buyer who created the rating
      if (existingRating.buyerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this rating',
        });
      }

      // Delete rating
      await deliveryRatingService.deleteRating(id);

      // Remove rating ID from delivery
      await deliveryService.updateDelivery(existingRating.deliveryId, { ratingId: null });

      return res.status(200).json({
        success: true,
        message: 'Rating deleted successfully',
      });
    } catch (error) {
      console.error('Delete rating error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete rating',
      });
    }
  }

  /**
   * Get buyer's own ratings
   * GET /api/buyer/delivery-rating/my-ratings
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

      const ratings = await deliveryRatingService.getRatingsByBuyerId(userId, { limit, offset });

      return res.status(200).json({
        success: true,
        message: 'Ratings retrieved successfully',
        data: ratings,
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
