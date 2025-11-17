import { Application } from 'express';
import { ReviewController } from '@server/controllers/buyer/review.controller';
import { authenticate } from '@server/middleware/auth.middleware';

/**
 * Product Review Routes for Buyers
 * Matches LeleKart review system structure
 */
export function registerBuyerReviewRoutes(app: Application) {
  // Public routes (no authentication required)

  /**
   * @route   GET /api/products/:id/reviews
   * @desc    Get all reviews for a product
   * @access  Public
   */
  app.get('/api/products/:id/reviews', ReviewController.getProductReviews);

  /**
   * @route   GET /api/products/:id/rating
   * @desc    Get product rating summary
   * @access  Public
   */
  app.get('/api/products/:id/rating', ReviewController.getProductRating);

  /**
   * @route   GET /api/reviews/:id/replies
   * @desc    Get replies for a review
   * @access  Public
   */
  app.get('/api/reviews/:id/replies', ReviewController.getReviewReplies);

  // Authenticated routes (buyer only)

  /**
   * @route   GET /api/user/reviews
   * @desc    Get current user's reviews
   * @access  Private (Buyer)
   */
  app.get('/api/buyer/reviews', authenticate, ReviewController.getUserReviews);

  /**
   * @route   POST /api/products/:id/reviews
   * @desc    Create a review for a product
   * @access  Private (Buyer)
   */
  app.post('/api/products/:id/reviews', authenticate, ReviewController.createReview);

  /**
   * @route   PUT /api/reviews/:id
   * @desc    Update a review
   * @access  Private (Buyer - own reviews only)
   */
  app.put('/api/reviews/:id', authenticate, ReviewController.updateReview);

  /**
   * @route   DELETE /api/reviews/:id
   * @desc    Delete a review
   * @access  Private (Buyer - own reviews only, or Admin)
   */
  app.delete('/api/reviews/:id', authenticate, ReviewController.deleteReview);

  /**
   * @route   POST /api/reviews/:id/helpful
   * @desc    Mark a review as helpful
   * @access  Private (Authenticated users)
   */
  app.post('/api/reviews/:id/helpful', authenticate, ReviewController.markHelpful);

  /**
   * @route   DELETE /api/reviews/:id/helpful
   * @desc    Unmark a review as helpful
   * @access  Private (Authenticated users)
   */
  app.delete('/api/reviews/:id/helpful', authenticate, ReviewController.unmarkHelpful);

  /**
   * @route   GET /api/reviews/:id/helpful/check
   * @desc    Check if user marked review as helpful
   * @access  Private (Authenticated users)
   */
  app.get('/api/reviews/:id/helpful/check', authenticate, ReviewController.checkHelpful);
}
