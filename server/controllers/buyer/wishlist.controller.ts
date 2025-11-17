import { Request, Response } from 'express';
import { WishlistService } from '../../db/services/wishlist.service';
import { AuthenticatedRequest } from '../../types';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.utils';

export class WishlistController {
  /**
   * Get user's wishlist with product details and pagination
   * GET /api/wishlist?page=1&limit=20
   */
  static async getWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { page, limit, offset } = getPaginationParams(req);

      const result = await WishlistService.getUserWishlist(userId, limit, offset);

      res.json(createPaginatedResponse(result.data, page, limit, result.total));
    } catch (error) {
      console.error('Error getting wishlist:', error);
      res.status(500).json({ error: 'Failed to get wishlist' });
    }
  }

  /**
   * Get wishlist count
   * GET /api/wishlist/count
   */
  static async getWishlistCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const count = await WishlistService.getWishlistCount(userId);

      res.json({ count });
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      res.status(500).json({ error: 'Failed to get wishlist count' });
    }
  }

  /**
   * Check if product is in wishlist
   * GET /api/wishlist/check/:productId
   */
  static async checkWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId);

      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      const isInWishlist = await WishlistService.isInWishlist(userId, productId);

      res.json({ isInWishlist });
    } catch (error) {
      console.error('Error checking wishlist:', error);
      res.status(500).json({ error: 'Failed to check wishlist' });
    }
  }

  /**
   * Add product to wishlist
   * POST /api/wishlist
   * Body: { productId: number }
   */
  static async addToWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;

      if (!productId || typeof productId !== 'number') {
        return res.status(400).json({ error: 'Product ID is required' });
      }

      const wishlistItem = await WishlistService.addToWishlist(userId, productId);

      res.status(201).json(wishlistItem);
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);

      if (error.message === 'Product already in wishlist') {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to add to wishlist' });
    }
  }

  /**
   * Remove product from wishlist
   * DELETE /api/wishlist/:productId
   */
  static async removeFromWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const productId = parseInt(req.params.productId);

      if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }

      await WishlistService.removeFromWishlist(userId, productId);

      res.json({ message: 'Product removed from wishlist' });
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);

      if (error.message === 'Product not found in wishlist') {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
  }

  /**
   * Clear entire wishlist
   * DELETE /api/wishlist
   */
  static async clearWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await WishlistService.clearWishlist(userId);

      res.json({ message: 'Wishlist cleared successfully' });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      res.status(500).json({ error: 'Failed to clear wishlist' });
    }
  }
}
