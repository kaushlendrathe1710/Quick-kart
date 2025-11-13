import type { Express } from 'express';
import { DeliveryPartnerDocumentsController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { documentUpload } from '../config/multer';
import {
  createDocumentsSchema,
  updateDocumentsSchema,
  idParamSchema,
} from '../utils/deliveryPartner.validation';

/**
 * Register delivery partner documents routes
 * All routes require authentication
 */
export function registerDeliveryPartnerDocumentsRoutes(app: Express): void {
  // Get documents by ID
  app.get(
    '/api/delivery-partner/documents/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerDocumentsController.getDocumentsById
  );

  // Get current partner's documents
  app.get(
    '/api/delivery-partner/documents',
    authenticate,
    DeliveryPartnerDocumentsController.getMyDocuments
  );

  // Create/upload documents
  app.post(
    '/api/delivery-partner/documents',
    authenticate,
    (req, res, next)=>{
      console.log('Uploading delivery partner documents');
      console.log("files:", req.files);
      next();
    },
    documentUpload.fields([
      { name: 'aadharCard', maxCount: 1 },
      { name: 'panCard', maxCount: 1 },
      { name: 'drivingLicense', maxCount: 1 },
      { name: 'vehicleRegistration', maxCount: 1 },
      { name: 'insuranceCertificate', maxCount: 1 },
    ]),
    validateRequest(createDocumentsSchema),
    DeliveryPartnerDocumentsController.createDocuments
  );

  // Update documents
  app.patch(
    '/api/delivery-partner/documents/:id',
    authenticate,
    documentUpload.fields([
      { name: 'aadharCard', maxCount: 1 },
      { name: 'panCard', maxCount: 1 },
      { name: 'drivingLicense', maxCount: 1 },
      { name: 'vehicleRegistration', maxCount: 1 },
      { name: 'insuranceCertificate', maxCount: 1 },
    ]),
    validateRequest(updateDocumentsSchema),
    DeliveryPartnerDocumentsController.updateDocuments
  );

  // Delete documents
  app.delete(
    '/api/delivery-partner/documents/:id',
    authenticate,
    validateRequest(idParamSchema),
    DeliveryPartnerDocumentsController.deleteDocuments
  );
}
