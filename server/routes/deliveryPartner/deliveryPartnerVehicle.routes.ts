import type { Express } from 'express';
import { DeliveryPartnerVehicleController } from '../../controllers';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { documentUpload } from '../../config/multer';
import {
  createVehicleSchema,
  updateVehicleSchema,
  idParamSchema,
} from '../../utils/deliveryPartner.validation';

/**
 * Register delivery partner vehicle routes
 * All routes require authentication
 */
export function registerDeliveryPartnerVehicleRoutes(app: Express): void {
  // Get vehicle by ID
  app.get(
    '/api/delivery-partner/vehicle/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerVehicleController.getVehicleById
  );

  // Get current partner's vehicle
  app.get(
    '/api/delivery-partner/vehicle',
    authenticate,
    DeliveryPartnerVehicleController.getMyVehicle
  );

  // Create vehicle
  app.post(
    '/api/delivery-partner/vehicle',
    authenticate,
    documentUpload.fields([
      { name: 'insuranceCertificate', maxCount: 1 },
      { name: 'pucCertificate', maxCount: 1 },
    ]),
    validateRequest(createVehicleSchema),
    DeliveryPartnerVehicleController.createVehicle
  );

  // Update vehicle
  app.patch(
    '/api/delivery-partner/vehicle/:id',
    authenticate,
    documentUpload.fields([
      { name: 'insuranceCertificate', maxCount: 1 },
      { name: 'pucCertificate', maxCount: 1 },
    ]),
    validateRequest(updateVehicleSchema),
    DeliveryPartnerVehicleController.updateVehicle
  );

  // Delete vehicle
  app.delete(
    '/api/delivery-partner/vehicle/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerVehicleController.deleteVehicle
  );
}
