import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { ReviewService } from '@server/db/services/review.service';
import { db } from '@server/db/connect';
import { products, reviewReplies } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Seller Review Reply Controller
 * Handles seller responses to product reviews
 */

const replySchema = z.object({
  reply: z.string().min(1).max(1000),
});

export class SellerReviewController {
  /**
   * Add reply to a review
   * POST /api/seller/reviews/:id/reply
   */
  static async addReply(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const reviewId = parseInt(req.params.id);

      if (isNaN(reviewId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid review ID',
        });
      }

      // Get review to check product ownership
      const review = await ReviewService.getReviewById(reviewId);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found',
        });
      }

      // Verify seller owns the product
      const product = await db.query.products.findFirst({
        where: eq(products.id, review.productId),
      });

      if (!product || product.sellerId !== sellerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only reply to reviews of your own products',
        });
      }

      // Validate reply data
      const validatedData = replySchema.parse(req.body);

      // Add reply
      const reply = await ReviewService.addReviewReply(reviewId, sellerId, validatedData.reply);

      return res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: reply,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error adding review reply:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add reply',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update reply to a review
   * PUT /api/seller/reviews/replies/:id
   */
  static async updateReply(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const replyId = parseInt(req.params.id);

      if (isNaN(replyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reply ID',
        });
      }

      // Get reply to check ownership
      const reply = await db.query.reviewReplies.findFirst({
        where: eq(reviewReplies.id, replyId),
      });

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      if (reply.userId !== sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this reply',
        });
      }

      // Validate reply data
      const validatedData = replySchema.parse(req.body);

      // Update reply
      const updatedReply = await ReviewService.updateReviewReply(replyId, validatedData.reply);

      return res.status(200).json({
        success: true,
        message: 'Reply updated successfully',
        data: updatedReply,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error updating review reply:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update reply',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete reply to a review
   * DELETE /api/seller/reviews/replies/:id
   */
  static async deleteReply(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const replyId = parseInt(req.params.id);

      if (isNaN(replyId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reply ID',
        });
      }

      // Get reply to check ownership
      const reply = await db.query.reviewReplies.findFirst({
        where: eq(reviewReplies.id, replyId),
      });

      if (!reply) {
        return res.status(404).json({
          success: false,
          message: 'Reply not found',
        });
      }

      if (reply.userId !== sellerId && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this reply',
        });
      }

      // Delete reply
      await ReviewService.deleteReviewReply(replyId);

      return res.status(200).json({
        success: true,
        message: 'Reply deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting review reply:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete reply',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
