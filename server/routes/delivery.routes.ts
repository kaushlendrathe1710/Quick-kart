import type { Express } from 'express';
import { DeliveryController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createDeliverySchema,
  updateDeliverySchema,
  idParamSchema,
} from '../utils/deliveryPartner.validation';

/**
 * Register delivery routes
 * All routes require authentication
 */
export function registerDeliveryRoutes(app: Express): void {
  // Get current partner's deliveries
  app.get('/api/delivery/my-deliveries', authenticate, DeliveryController.getMyDeliveries);

  // Get current partner's statistics
  app.get('/api/delivery/my-stats', authenticate, DeliveryController.getMyStats);

  // Get delivery by ID
  app.get(
    '/api/delivery/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryController.getDeliveryById
  );

  // Get deliveries by status
  app.get(
    '/api/delivery/by-status/:status',
    authenticate,
    DeliveryController.getDeliveriesByStatus
  );

  // Create delivery
  app.post(
    '/api/delivery',
    authenticate,
    validateRequest(createDeliverySchema),
    DeliveryController.createDelivery
  );

  // Update delivery
  app.patch(
    '/api/delivery/:id',
    authenticate,
    validateRequest(updateDeliverySchema),
    DeliveryController.updateDelivery
  );

  // Assign delivery to partner
  app.post('/api/delivery/:id/assign', authenticate, DeliveryController.assignDelivery);

  // Update delivery status
  app.patch('/api/delivery/:id/status', authenticate, DeliveryController.updateDeliveryStatus);

  // Cancel delivery
  app.post('/api/delivery/:id/cancel', authenticate, DeliveryController.cancelDelivery);

  // Delete delivery
  app.delete(
    '/api/delivery/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryController.deleteDelivery
  );
}
