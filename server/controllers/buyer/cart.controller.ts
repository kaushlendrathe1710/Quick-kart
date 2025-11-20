import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '@server/types';
import { addToCartSchema, updateCartItemSchema } from '@shared/types';
import {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartItemsCount,
} from '@server/db/services/cart.service';

/**
 * Cart Controller
 * Handles shopping cart operations (all protected routes)
 */

export class CartController {
  /**
   * Get user's cart with all items
   * GET /api/cart
   */
  static async getCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;

      const cart = await getUserCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Add product to cart
   * POST /api/cart
   */
  static async addToCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;
      const data = addToCartSchema.parse(req.body);

      await addToCart(userId, data.productId, data.quantity);

      // Get updated cart
      const cart = await getUserCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Product added to cart successfully',
        data: cart,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        });
      }

      console.error('Error adding to cart:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add product to cart',
      });
    }
  }

  /**
   * Update cart item quantity
   * PATCH /api/cart/:productId
   */
  static async updateCartItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;
      const productId = parseInt(req.params.productId);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      const data = updateCartItemSchema.parse(req.body);

      await updateCartItemQuantity(userId, productId, data.quantity);

      // Get updated cart
      const cart = await getUserCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        data: cart,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        });
      }

      console.error('Error updating cart item:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update cart item',
      });
    }
  }

  /**
   * Remove product from cart
   * DELETE /api/cart/:productId
   */
  static async removeFromCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;
      const productId = parseInt(req.params.productId);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }

      await removeFromCart(userId, productId);

      // Get updated cart
      const cart = await getUserCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully',
        data: cart,
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove product from cart',
      });
    }
  }

  /**
   * Clear all items from cart
   * DELETE /api/cart
   */
  static async clearCart(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;

      await clearCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to clear cart',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get cart items count
   * GET /api/cart/count
   */
  static async getCartCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;

      const count = await getCartItemsCount(userId);

      return res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error('Error getting cart count:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get cart count',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
