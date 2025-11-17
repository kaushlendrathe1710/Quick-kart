import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { ReviewService } from '@server/db/services/review.service';
import { z } from 'zod';
import { getPaginationParams, createPaginatedResponse } from '@server/utils/pagination.utils';

/**
 * Review Controller for Buyers
 * Handles review operations matching LeleKart structure
 */

// Validation schemas
const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  orderId: z.number().int().positive().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  review: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  review: z.string().max(2000).optional(),
});

export class ReviewController {
  /**
   * Get reviews for a product with pagination
   * GET /api/products/:id/reviews?page=1&limit=20
   */
  static async getProductReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.id);
      const { page, limit, offset } = getPaginationParams(req);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      const result = await ReviewService.getProductReviews(productId, limit, offset);

      // If service returns {reviews, total}, create paginated response
      if (result && typeof result === 'object' && 'reviews' in result && 'total' in result) {
        return res.status(200).json({
          success: true,
          message: 'Reviews retrieved successfully',
          ...createPaginatedResponse(result.reviews, page, limit, result.total),
        });
      }

      // Fallback for non-paginated service
      return res.status(200).json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error getting product reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get product rating summary
   * GET /api/products/:id/rating
   */
  static async getProductRating(req: AuthenticatedRequest, res: Response) {
    try {
      const productId = parseInt(req.params.id);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      const ratingSummary = await ReviewService.getProductRatingSummary(productId);

      return res.status(200).json({
        success: true,
        message: 'Rating summary retrieved successfully',
        data: ratingSummary,
      });
    } catch (error) {
      console.error('Error getting product rating:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve rating summary',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get user's reviews with pagination
   * GET /api/user/reviews?page=1&limit=20
   */
  static async getUserReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { page, limit, offset } = getPaginationParams(req);

      const result = await ReviewService.getUserReviews(userId, limit, offset);

      // If service returns {reviews, total}, create paginated response
      if (result && typeof result === 'object' && 'reviews' in result && 'total' in result) {
        return res.status(200).json({
          success: true,
          message: 'User reviews retrieved successfully',
          ...createPaginatedResponse(result.reviews, page, limit, result.total),
        });
      }

      // Fallback for non-paginated service
      return res.status(200).json({
        success: true,
        message: 'User reviews retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error getting user reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user reviews',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create a review
   * POST /api/products/:id/reviews
   */
  static async createReview(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.id);

      if (isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      // Check if user is buyer (not seller or admin)
      if (req.user!.role !== 'buyer') {
        return res.status(403).json({
          success: false,
          message: 'Only buyers can write reviews',
        });
      }

      // Validate review data
      const validatedData = createReviewSchema.parse({
        ...req.body,
        productId,
      });

      // Check if user purchased the product
      const verifiedPurchase = await ReviewService.hasUserPurchasedProduct(userId, productId);

      // Create review
      const review = await ReviewService.createReview({
        userId,
        productId: validatedData.productId,
        orderId: validatedData.orderId,
        rating: validatedData.rating,
        title: validatedData.title,
        review: validatedData.review,
        verifiedPurchase,
      });

      // Add images if provided
      if (validatedData.images && validatedData.images.length > 0) {
        await ReviewService.addReviewImages(review.id, validatedData.images);
      }

      // Get complete review with relations
      const completeReview = await ReviewService.getReviewById(review.id);

      return res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: completeReview,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error creating review:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update a review
   * PUT /api/reviews/:id
   */
  static async updateReview(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID',
        });
      }

      // Check if review exists and belongs to user
      const review = await ReviewService.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      if (review.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this review',
        });
      }

      // Validate update data
      const validatedData = updateReviewSchema.parse(req.body);

      // Update review
      const updatedReview = await ReviewService.updateReview(reviewId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: updatedReview,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error updating review:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update review',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete a review
   * DELETE /api/reviews/:id
   */
  static async deleteReview(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID',
        });
      }

      // Check if review exists and belongs to user
      const review = await ReviewService.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      if (review.userId !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this review',
        });
      }

      // Delete review
      await ReviewService.deleteReview(reviewId);

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Mark review as helpful
   * POST /api/reviews/:id/helpful
   */
  static async markHelpful(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID',
        });
      }

      // Check if review exists
      const review = await ReviewService.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      // Mark as helpful
      await ReviewService.markReviewHelpful(reviewId, userId);

      return res.status(200).json({
        success: true,
        message: 'Review marked as helpful',
      });
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mark review as helpful',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Unmark review as helpful
   * DELETE /api/reviews/:id/helpful
   */
  static async unmarkHelpful(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID',
        });
      }

      // Unmark as helpful
      await ReviewService.unmarkReviewHelpful(reviewId, userId);

      return res.status(200).json({
        success: true,
        message: 'Review unmarked as helpful',
      });
    } catch (error) {
      console.error('Error unmarking review as helpful:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to unmark review as helpful',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check if user marked review as helpful
   * GET /api/reviews/:id/helpful/check
   */
  static async checkHelpful(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID',
        });
      }

      const isHelpful = await ReviewService.isReviewHelpfulByUser(reviewId, userId);

      return res.status(200).json({
        success: true,
        data: { isHelpful },
      });
    } catch (error) {
      console.error('Error checking helpful status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check helpful status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get review replies
   * GET /api/reviews/:id/replies
   */
  static async getReviewReplies(req: AuthenticatedRequest, res: Response) {
    try {
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID',
        });
      }

      const replies = await ReviewService.getReviewReplies(reviewId);

      return res.status(200).json({
        success: true,
        message: 'Review replies retrieved successfully',
        data: replies,
      });
    } catch (error) {
      console.error('Error getting review replies:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve review replies',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
