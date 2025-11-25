import type { Express } from 'express';
import { SellerDeliveryController } from '../../controllers/seller/delivery.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createDeliverySchema, idParamSchema } from '../../utils/deliveryPartner.validation';

/**
 * Register seller delivery routes
 * Sellers create deliveries after accepting orders
 * All routes require authentication as seller
 */
export function registerSellerDeliveryRoutes(app: Express): void {
  // Get all deliveries for seller
  app.get('/api/seller/deliveries', authenticate, SellerDeliveryController.getSellerDeliveries);

  // Get delivery by order ID
  app.get(
    '/api/seller/delivery/order/:orderId',
    authenticate,
    SellerDeliveryController.getDeliveryByOrderId
  );

  // Get delivery by ID
  app.get(
    '/api/seller/delivery/:id',
    authenticate,
    validateRequest(idParamSchema),
    SellerDeliveryController.getDeliveryById
  );

  // Create delivery for an order
  app.post(
    '/api/seller/delivery',
    authenticate,
    validateRequest(createDeliverySchema),
    SellerDeliveryController.createDelivery
  );

  // Assign delivery to a partner
  app.post(
    '/api/seller/delivery/:id/assign',
    authenticate,
    SellerDeliveryController.assignDelivery
  );

  // Cancel delivery
  app.post(
    '/api/seller/delivery/:id/cancel',
    authenticate,
    SellerDeliveryController.cancelDelivery
  );
}
