import { Application } from 'express';
import { SellerBusinessController } from '@server/controllers/seller/business.controller';
import { SellerPaymentController } from '@server/controllers/seller/payment.controller';
import { authenticate, isSeller } from '@server/middleware/auth.middleware';
import { requireSellerApproval } from '@server/middleware/sellerApproval.middleware';

/**
 * Seller Business & Payment Routes
 * All routes require authentication + seller role + approved status
 */
export function registerSellerBusinessRoutes(app: Application) {
  const middleware = [authenticate, isSeller, requireSellerApproval];

  /**
   * @route   GET /api/seller/business-details
   * @desc    Get seller's business details
   * @access  Private (Seller - Approved)
   */
  app.get(
    '/api/seller/business-details',
    ...middleware,
    SellerBusinessController.getBusinessDetails
  );

  /**
   * @route   PUT /api/seller/business-details
   * @desc    Update seller's business details
   * @access  Private (Seller - Approved)
   * @body    { businessName, gstNumber?, panNumber?, businessType? }
   */
  app.put(
    '/api/seller/business-details',
    ...middleware,
    SellerBusinessController.updateBusinessDetails
  );

  /**
   * @route   GET /api/seller/banking-information
   * @desc    Get seller's banking information
   * @access  Private (Seller - Approved)
   */
  app.get(
    '/api/seller/banking-information',
    ...middleware,
    SellerBusinessController.getBankingInformation
  );

  /**
   * @route   PUT /api/seller/banking-information
   * @desc    Update seller's banking information
   * @access  Private (Seller - Approved)
   * @body    { accountHolderName, accountNumber, bankName, ifscCode }
   */
  app.put(
    '/api/seller/banking-information',
    ...middleware,
    SellerBusinessController.updateBankingInformation
  );

  /**
   * @route   GET /api/seller/payments
   * @desc    Get seller's payment history with pagination
   * @access  Private (Seller - Approved)
   * @query   page, limit, status
   */
  app.get('/api/seller/payments', ...middleware, SellerPaymentController.getPayments);

  /**
   * @route   GET /api/seller/payments/:id
   * @desc    Get single payment details
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/payments/:id', ...middleware, SellerPaymentController.getPayment);

  /**
   * @route   POST /api/seller/payments/request
   * @desc    Request payment/withdrawal
   * @access  Private (Seller - Approved)
   * @body    { amount, notes? }
   */
  app.post('/api/seller/payments/request', ...middleware, SellerPaymentController.requestPayment);

  /**
   * @route   GET /api/seller/payments-summary
   * @desc    Get payment summary statistics
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/payments-summary', ...middleware, SellerPaymentController.getPaymentSummary);
}
