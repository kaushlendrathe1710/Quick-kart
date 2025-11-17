import type { Express } from 'express';
import { DeliveryPartnerWalletController } from '../../controllers/deliveryPartner/wallet.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { applyPayoutSchema } from '../../utils/deliveryPartner.validation';

/**
 * Register delivery partner wallet routes
 * All routes require authentication as delivery partner
 */
export function registerDeliveryPartnerWalletRoutes(app: Express): void {
  // Get current partner's wallet
  app.get('/api/deliveryPartner/wallet', authenticate, DeliveryPartnerWalletController.getMyWallet);

  // Create wallet
  app.post(
    '/api/deliveryPartner/wallet',
    authenticate,
    DeliveryPartnerWalletController.createWallet
  );

  // Get current partner's transactions
  app.get(
    '/api/deliveryPartner/wallet/transactions',
    authenticate,
    DeliveryPartnerWalletController.getMyTransactions
  );

  // Get current partner's payouts
  app.get(
    '/api/deliveryPartner/wallet/payouts',
    authenticate,
    DeliveryPartnerWalletController.getMyPayouts
  );

  // Apply for payout
  app.post(
    '/api/deliveryPartner/payout/apply',
    authenticate,
    validateRequest(applyPayoutSchema),
    DeliveryPartnerWalletController.applyForPayout
  );
}
