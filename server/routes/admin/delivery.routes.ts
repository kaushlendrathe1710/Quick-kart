import type { Express } from 'express';
import { AdminDeliveryController } from '../../controllers/admin/delivery.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import {
  createDeliverySchema,
  updateDeliverySchema,
  idParamSchema,
} from '../../utils/deliveryPartner.validation';

/**
 * Register admin delivery routes
 * All routes require authentication as admin
 */
export function registerAdminDeliveryRoutes(app: Express): void {
  // Get deliveries by status
  app.get(
    '/api/admin/delivery/by-status/:status',
    authenticate,
    AdminDeliveryController.getDeliveriesByStatus
  );

  // Get delivery by ID
  app.get(
    '/api/admin/delivery/:id',
    authenticate,
    validateRequest(idParamSchema),
    AdminDeliveryController.getDeliveryById
  );

  // Create delivery
  app.post(
    '/api/admin/delivery',
    authenticate,
    validateRequest(createDeliverySchema),
    AdminDeliveryController.createDelivery
  );

  // Update delivery
  app.patch(
    '/api/admin/delivery/:id',
    authenticate,
    validateRequest(updateDeliverySchema),
    AdminDeliveryController.updateDelivery
  );

  // Assign delivery to partner
  app.post('/api/admin/delivery/:id/assign', authenticate, AdminDeliveryController.assignDelivery);

  // Cancel delivery
  app.post('/api/admin/delivery/:id/cancel', authenticate, AdminDeliveryController.cancelDelivery);

  // Delete delivery
  app.delete(
    '/api/admin/delivery/:id',
    authenticate,
    validateRequest(idParamSchema),
    AdminDeliveryController.deleteDelivery
  );
}
