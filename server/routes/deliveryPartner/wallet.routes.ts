import type { Express } from 'express';
import { DeliveryPartnerWalletController } from '../../controllers/deliveryPartner/wallet.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireDeliveryPartnerApproval } from '../../middleware/deliveryPartnerApproval.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { applyPayoutSchema } from '../../utils/deliveryPartner.validation';

/**
 * Register delivery partner wallet routes
 * All routes require authentication and approval as delivery partner
 */
export function registerDeliveryPartnerWalletRoutes(app: Express): void {
  // Get current partner's wallet
  app.get(
    '/api/deliveryPartner/wallet',
    authenticate,
    requireDeliveryPartnerApproval,
    DeliveryPartnerWalletController.getMyWallet
  );

  // Create wallet
  app.post(
    '/api/deliveryPartner/wallet',
    authenticate,
    requireDeliveryPartnerApproval,
    DeliveryPartnerWalletController.createWallet
  );

  // Get current partner's transactions
  app.get(
    '/api/deliveryPartner/wallet/transactions',
    authenticate,
    requireDeliveryPartnerApproval,
    DeliveryPartnerWalletController.getMyTransactions
  );

  // Get current partner's payouts
  app.get(
    '/api/deliveryPartner/wallet/payouts',
    authenticate,
    requireDeliveryPartnerApproval,
    DeliveryPartnerWalletController.getMyPayouts
  );

  // Apply for payout
  app.post(
    '/api/deliveryPartner/payout/apply',
    authenticate,
    requireDeliveryPartnerApproval,
    validateRequest(applyPayoutSchema),
    DeliveryPartnerWalletController.applyForPayout
  );
}
