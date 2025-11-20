import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as deliveryPartnerController from '../../controllers/admin/deliveryPartner.controller';

export function registerAdminDeliveryPartnerRoutes(app: Express) {
  // Delivery Partner Management
  app.get(
    '/api/admin/delivery-partners',
    authenticate,
    isAdmin,
    deliveryPartnerController.getDeliveryPartners
  );
  app.post(
    '/api/admin/delivery-partners/:id/approve',
    authenticate,
    isAdmin,
    deliveryPartnerController.approveDeliveryPartner
  );
  app.post(
    '/api/admin/delivery-partners/:id/reject',
    authenticate,
    isAdmin,
    deliveryPartnerController.rejectDeliveryPartner
  );

  // Delivery Partner Applications
  app.get(
    '/api/admin/delivery-partner-applications',
    authenticate,
    isAdmin,
    deliveryPartnerController.getDeliveryPartnerApplications
  );
  app.put(
    '/api/admin/delivery-partner-applications/:id/approve',
    authenticate,
    isAdmin,
    deliveryPartnerController.approveApplication
  );
  app.put(
    '/api/admin/delivery-partner-applications/:id/reject',
    authenticate,
    isAdmin,
    deliveryPartnerController.rejectApplication
  );
  app.get(
    '/api/admin/delivery-partner-applications/stats',
    authenticate,
    isAdmin,
    deliveryPartnerController.getApplicationStats
  );
}
