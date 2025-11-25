import type { Express } from 'express';
import { SellerSettingsController } from '../../controllers/seller/settings.controller';
import { authenticate, isSeller } from '../../middleware/auth.middleware';
import { requireSellerApproval } from '../../middleware/sellerApproval.middleware';

/**
 * Register seller settings routes
 * Protected routes - require authentication, seller role, and approval
 */
export function registerSellerSettingsRoutes(app: Express): void {
  const middleware = [authenticate, isSeller, requireSellerApproval];

  /**
   * @route   GET /api/seller/settings
   * @desc    Get seller settings (store info, notifications, tax settings)
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/settings', ...middleware, SellerSettingsController.getSettings);

  /**
   * @route   PUT /api/seller/settings
   * @desc    Update seller settings
   * @access  Private (Seller - Approved)
   * @body    Partial settings data
   */
  app.put('/api/seller/settings', ...middleware, SellerSettingsController.updateSettings);

  /**
   * @route   PUT /api/seller/settings/pickup-address
   * @desc    Set pickup address (one-time only)
   * @access  Private (Seller - Approved)
   * @body    Pickup address data
   */
  app.put(
    '/api/seller/settings/pickup-address',
    ...middleware,
    SellerSettingsController.updatePickupAddress
  );
}
