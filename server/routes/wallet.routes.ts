import type { Express } from 'express';
import { WalletController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  applyPayoutSchema,
  updatePayoutSchema,
  idParamSchema,
} from '../utils/deliveryPartner.validation';

/**
 * Register wallet and payout routes
 * All routes require authentication
 */
export function registerWalletRoutes(app: Express): void {
  // Wallet routes
  // Get current partner's wallet
  app.get('/api/delivery-partner/wallet', authenticate, WalletController.getMyWallet);

  // Create wallet
  app.post('/api/delivery-partner/wallet', authenticate, WalletController.createWallet);

  // Transaction routes
  // Get current partner's transactions
  app.get(
    '/api/delivery-partner/wallet/transactions',
    authenticate,
    WalletController.getMyTransactions
  );

  // Payout routes
  // Get current partner's payouts
  app.get('/api/delivery-partner/wallet/payouts', authenticate, WalletController.getMyPayouts);

  // Get wallet by ID
  app.get(
    '/api/delivery-partner/wallet/:id',
    authenticate,
    validateRequest(idParamSchema),
    WalletController.getWalletById
  );

  // Apply for payout
  app.post(
    '/api/delivery-partner/payout/apply',
    authenticate,
    validateRequest(applyPayoutSchema),
    WalletController.applyForPayout
  );

  // Update payout status (Admin only)
  app.patch(
    '/api/delivery-partner/payout/:id/pay',
    authenticate,
    validateRequest(updatePayoutSchema),
    WalletController.updatePayoutStatus
  );

  // Get pending payouts (Admin only)
  app.get('/api/delivery-partner/payout/pending', authenticate, WalletController.getPendingPayouts);
}
