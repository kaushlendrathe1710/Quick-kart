import type { Express } from 'express';
import { WishlistController } from '../../controllers/buyer/wishlist.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register wishlist routes
 * All routes are protected - require authentication
 */
export function registerWishlistRoutes(app: Express): void {
  // Get user's wishlist
  app.get('/api/wishlist', authenticate, WishlistController.getWishlist);

  // Get wishlist items count
  app.get('/api/wishlist/count', authenticate, WishlistController.getWishlistCount);

  // Check if product is in wishlist (must be before /:productId routes)
  app.get('/api/wishlist/check/:productId', authenticate, WishlistController.checkWishlist);

  // Add product to wishlist
  app.post('/api/wishlist', authenticate, WishlistController.addToWishlist);

  // Remove product from wishlist
  app.delete('/api/wishlist/:productId', authenticate, WishlistController.removeFromWishlist);

  // Clear entire wishlist
  app.delete('/api/wishlist', authenticate, WishlistController.clearWishlist);
}
