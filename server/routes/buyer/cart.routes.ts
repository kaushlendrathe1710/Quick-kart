import type { Express } from 'express';
import { CartController } from '../../controllers/buyer/cart.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register cart routes
 * All routes are protected - require authentication
 */
export function registerCartRoutes(app: Express): void {
  // Get user's cart
  app.get('/api/cart', authenticate, CartController.getCart);

  // Get cart items count
  app.get('/api/cart/count', authenticate, CartController.getCartCount);

  // Add product to cart
  app.post('/api/cart', authenticate, CartController.addToCart);

  // Update cart item quantity
  app.patch('/api/cart/:productId', authenticate, CartController.updateCartItem);

  // Remove product from cart
  app.delete('/api/cart/:productId', authenticate, CartController.removeFromCart);

  // Clear entire cart
  app.delete('/api/cart', authenticate, CartController.clearCart);
}
