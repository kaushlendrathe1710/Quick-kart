import { Application } from 'express';
import { SellerOrderController } from '@server/controllers/seller/order.controller';
import { authenticate, isSeller } from '@server/middleware/auth.middleware';
import { requireSellerApproval } from '@server/middleware/sellerApproval.middleware';

/**
 * Seller Order Routes
 * All routes require authentication + seller role + approved status
 */
export function registerSellerOrderRoutes(app: Application) {
  const middleware = [authenticate, isSeller, requireSellerApproval];

  /**
   * @route   GET /api/seller/orders
   * @desc    Get seller's orders with filters
   * @access  Private (Seller - Approved)
   * @query   page, limit, status
   */
  app.get('/api/seller/orders', ...middleware, SellerOrderController.getOrders);

  /**
   * @route   GET /api/seller/orders/:id
   * @desc    Get single order details
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/orders/:id', ...middleware, SellerOrderController.getOrderById);

  /**
   * @route   GET /api/seller/orders/:id/invoice
   * @desc    Generate invoice HTML for order
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/orders/:id/invoice', ...middleware, SellerOrderController.generateInvoice);

  /**
   * @route   GET /api/seller/orders/:id/shipping-label
   * @desc    Generate shipping label HTML for order
   * @access  Private (Seller - Approved)
   */
  app.get(
    '/api/seller/orders/:id/shipping-label',
    ...middleware,
    SellerOrderController.generateShippingLabel
  );

  /**
   * @route   PATCH /api/seller/orders/:id/status
   * @desc    Update order status
   * @access  Private (Seller - Approved)
   * @body    { status, trackingNumber, courierName }
   */
  app.patch(
    '/api/seller/orders/:id/status',
    ...middleware,
    SellerOrderController.updateOrderStatus
  );
}
