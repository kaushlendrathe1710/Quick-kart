import type { Express } from 'express';
import { AdminWalletController } from '../../controllers/admin/wallet.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { updatePayoutSchema, idParamSchema } from '../../utils/deliveryPartner.validation';

/**
 * Register admin wallet routes
 * All routes require authentication as admin
 */
export function registerAdminWalletRoutes(app: Express): void {
  // Get wallet by ID
  app.get(
    '/api/admin/wallet/:id',
    authenticate,
    validateRequest(idParamSchema),
    AdminWalletController.getWalletById
  );

  // Get pending payouts
  app.get('/api/admin/payout/pending', authenticate, AdminWalletController.getPendingPayouts);

  // Get all payouts with filters
  app.get('/api/admin/payout', authenticate, AdminWalletController.getAllPayouts);

  // Update payout status
  app.patch(
    '/api/admin/payout/:id/status',
    authenticate,
    validateRequest(updatePayoutSchema),
    AdminWalletController.updatePayoutStatus
  );
}
