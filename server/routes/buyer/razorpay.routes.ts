import type { Express } from 'express';
import { RazorpayController } from '../../controllers/buyer/razorpay.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register Razorpay payment routes
 * All routes require authentication
 */
export function registerRazorpayRoutes(app: Express): void {
  /**
   * @route   POST /api/razorpay/create-order
   * @desc    Create Razorpay order from cart
   * @access  Private (Buyer)
   */
  app.post('/api/razorpay/create-order', authenticate, RazorpayController.createOrder);

  /**
   * @route   POST /api/razorpay/verify-payment
   * @desc    Verify Razorpay payment and credit wallets
   * @access  Private (Buyer)
   */
  app.post('/api/razorpay/verify-payment', authenticate, RazorpayController.verifyPayment);

  /**
   * @route   GET /api/razorpay/key
   * @desc    Get Razorpay public key
   * @access  Private
   */
  app.get('/api/razorpay/key', authenticate, RazorpayController.getRazorpayKey);
}
