import type { Express } from 'express';
import { SellerWalletController } from '../../controllers/seller/wallet.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireSellerApproval } from '../../middleware/sellerApproval.middleware';

/**
 * Register seller wallet routes
 * All routes require authentication, seller role, and approval
 */
export function registerSellerWalletRoutes(app: Express): void {
  /**
   * @route   GET /api/seller/wallet
   * @desc    Get seller wallet balance and summary
   * @access  Private (Approved Seller)
   */
  app.get(
    '/api/seller/wallet',
    authenticate,
    requireSellerApproval,
    SellerWalletController.getWallet
  );

  /**
   * @route   GET /api/seller/wallet/transactions
   * @desc    Get seller wallet transactions with pagination
   * @access  Private (Approved Seller)
   */
  app.get(
    '/api/seller/wallet/transactions',
    authenticate,
    requireSellerApproval,
    SellerWalletController.getTransactions
  );

  /**
   * @route   POST /api/seller/wallet/withdraw
   * @desc    Create withdrawal request
   * @access  Private (Approved Seller)
   */
  app.post(
    '/api/seller/wallet/withdraw',
    authenticate,
    requireSellerApproval,
    SellerWalletController.requestWithdrawal
  );

  /**
   * @route   GET /api/seller/wallet/withdrawals
   * @desc    Get all withdrawal requests
   * @access  Private (Approved Seller)
   */
  app.get(
    '/api/seller/wallet/withdrawals',
    authenticate,
    requireSellerApproval,
    SellerWalletController.getWithdrawalRequests
  );

  /**
   * @route   GET /api/seller/wallet/withdrawals/:id
   * @desc    Get single withdrawal request
   * @access  Private (Approved Seller)
   */
  app.get(
    '/api/seller/wallet/withdrawals/:id',
    authenticate,
    requireSellerApproval,
    SellerWalletController.getWithdrawalRequest
  );
}
