import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as orderController from '../../controllers/admin/order.controller';

export function registerAdminOrderRoutes(app: Express) {
  // Order Management
  app.get('/api/admin/orders', authenticate, isAdmin, orderController.getAllOrders);
  app.get('/api/admin/orders/stats', authenticate, isAdmin, orderController.getOrderStats);
  app.get('/api/admin/orders/:id', authenticate, isAdmin, orderController.getOrderById);
  app.put('/api/admin/orders/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);
}
