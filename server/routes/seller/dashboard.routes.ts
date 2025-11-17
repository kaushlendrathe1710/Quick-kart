import type { Express } from 'express';
import { SellerDashboardController } from '../../controllers/seller/dashboard.controller';
import { authenticate, isSeller } from '../../middleware/auth.middleware';
import { requireSellerApproval } from '../../middleware/sellerApproval.middleware';

/**
 * Register seller dashboard routes
 * Protected routes - require authentication and seller role
 */
export function registerSellerDashboardRoutes(app: Express): void {
  // Get seller dashboard overview
  app.get(
    '/api/seller/dashboard',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerDashboardController.getDashboard
  );

  // Get recent orders with pagination
  app.get(
    '/api/seller/dashboard/orders',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerDashboardController.getRecentOrders
  );

  // Get top performing products
  app.get(
    '/api/seller/dashboard/top-products',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerDashboardController.getTopProducts
  );

  // Get low stock products
  app.get(
    '/api/seller/dashboard/low-stock',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerDashboardController.getLowStockProducts
  );
}
