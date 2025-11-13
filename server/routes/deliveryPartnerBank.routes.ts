import type { Express } from 'express';
import { DeliveryPartnerBankController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createBankDetailsSchema,
  updateBankDetailsSchema,
  idParamSchema,
} from '../utils/deliveryPartner.validation';

/**
 * Register delivery partner bank details routes
 * All routes require authentication
 */
export function registerDeliveryPartnerBankRoutes(app: Express): void {
  // Get bank details by ID
  app.get(
    '/api/delivery-partner/bank/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerBankController.getBankDetailsById
  );

  // Get current partner's bank details
  app.get(
    '/api/delivery-partner/bank',
    authenticate,
    DeliveryPartnerBankController.getMyBankDetails
  );

  // Create bank details
  app.post(
    '/api/delivery-partner/bank',
    authenticate,
    validateRequest(createBankDetailsSchema),
    DeliveryPartnerBankController.createBankDetails
  );

  // Update bank details
  app.patch(
    '/api/delivery-partner/bank/:id',
    authenticate,
    validateRequest(updateBankDetailsSchema),
    DeliveryPartnerBankController.updateBankDetails
  );

  // Delete bank details
  app.delete(
    '/api/delivery-partner/bank/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerBankController.deleteBankDetails
  );
}
