import type { Express } from 'express';
import { DeliveryPartnerDeliveryController } from '../../controllers/deliveryPartner/delivery.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { idParamSchema } from '../../utils/deliveryPartner.validation';

/**
 * Register delivery partner delivery routes
 * All routes require authentication as delivery partner
 */
export function registerDeliveryPartnerDeliveryRoutes(app: Express): void {
  // Get current partner's deliveries
  app.get(
    '/api/deliveryPartner/delivery/my-deliveries',
    authenticate,
    DeliveryPartnerDeliveryController.getMyDeliveries
  );

  // Get current partner's statistics
  app.get(
    '/api/deliveryPartner/delivery/my-stats',
    authenticate,
    DeliveryPartnerDeliveryController.getMyStats
  );

  // Get delivery by ID (for assigned deliveries)
  app.get(
    '/api/deliveryPartner/delivery/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerDeliveryController.getDeliveryById
  );

  // Update delivery status
  app.patch(
    '/api/deliveryPartner/delivery/:id/status',
    authenticate,
    DeliveryPartnerDeliveryController.updateDeliveryStatus
  );
}
