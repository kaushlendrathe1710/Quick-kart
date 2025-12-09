import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as applicationController from '../../controllers/admin/application.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);

/**
 * Admin Application Routes
 * Manage seller and delivery partner applications
 */

// Seller applications
router.get('/applications/sellers', applicationController.getAllSellerApplications);
router.post('/applications/sellers/:id/approve', applicationController.approveSellerApplication);
router.post('/applications/sellers/:id/reject', applicationController.rejectSellerApplication);

// Delivery partner applications
router.get(
  '/applications/delivery-partners',
  applicationController.getAllDeliveryPartnerApplications
);
router.post(
  '/applications/delivery-partners/:id/approve',
  applicationController.approveDeliveryPartnerApplication
);
router.post(
  '/applications/delivery-partners/:id/reject',
  applicationController.rejectDeliveryPartnerApplication
);

export function registerAdminApplicationRoutes(app: Router) {
  app.use('/api/admin', router);
}
