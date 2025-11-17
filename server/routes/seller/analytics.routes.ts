import type { Express } from 'express';
import { SellerAnalyticsController } from '../../controllers/seller/analytics.controller';
import { authenticate, isSeller } from '../../middleware/auth.middleware';
import { requireSellerApproval } from '../../middleware/sellerApproval.middleware';

/**
 * Register seller analytics routes
 * Protected routes - require authentication, seller role, and approval
 */
export function registerSellerAnalyticsRoutes(app: Express): void {
  // Get analytics for date range
  app.get(
    '/api/seller/analytics',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerAnalyticsController.getAnalytics
  );

  // Get analytics summary
  app.get(
    '/api/seller/analytics/summary',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerAnalyticsController.getSummary
  );

  // Get revenue chart data
  app.get(
    '/api/seller/analytics/revenue-chart',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerAnalyticsController.getRevenueChart
  );

  // Get product performance
  app.get(
    '/api/seller/analytics/product-performance',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerAnalyticsController.getProductPerformance
  );

  // Get customer insights
  app.get(
    '/api/seller/analytics/customer-insights',
    authenticate,
    isSeller,
    requireSellerApproval,
    SellerAnalyticsController.getCustomerInsights
  );
}
