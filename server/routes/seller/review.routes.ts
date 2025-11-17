import { Application } from 'express';
import { SellerReviewController } from '@server/controllers/seller/review.controller';
import { authenticate, isSeller } from '@server/middleware/auth.middleware';
import { requireSellerApproval } from '@server/middleware/sellerApproval.middleware';

/**
 * Seller Review Routes
 * All routes require authentication + seller role + approved status
 */
export function registerSellerReviewRoutes(app: Application) {
  const middleware = [authenticate, isSeller, requireSellerApproval];

  /**
   * @route   POST /api/seller/reviews/:id/reply
   * @desc    Add reply to a review
   * @access  Private (Seller - Approved)
   */
  app.post('/api/seller/reviews/:id/reply', ...middleware, SellerReviewController.addReply);

  /**
   * @route   PUT /api/seller/reviews/replies/:replyId
   * @desc    Update a reply
   * @access  Private (Seller - Approved)
   */
  app.put(
    '/api/seller/reviews/replies/:replyId',
    ...middleware,
    SellerReviewController.updateReply
  );

  /**
   * @route   DELETE /api/seller/reviews/replies/:replyId
   * @desc    Delete a reply
   * @access  Private (Seller - Approved)
   */
  app.delete(
    '/api/seller/reviews/replies/:replyId',
    ...middleware,
    SellerReviewController.deleteReply
  );
}
