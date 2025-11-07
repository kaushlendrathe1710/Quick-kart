import type { Express } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Register order routes
 * All routes are protected - require authentication
 */
export function registerOrderRoutes(app: Express): void {
  // Create order from cart
  app.post('/api/orders', authenticate, OrderController.createOrder);

  // Get all orders for user
  app.get('/api/orders', authenticate, OrderController.getUserOrders);

  // Get specific order by ID
  app.get('/api/orders/:orderId', authenticate, OrderController.getOrderById);

  // Cancel order
  app.post('/api/orders/:orderId/cancel', authenticate, OrderController.cancelOrder);
}
