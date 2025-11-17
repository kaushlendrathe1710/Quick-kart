import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as sellerController from '../../controllers/admin/seller.controller';

export function registerAdminSellerRoutes(app: Express) {
  // Seller Management
  app.get('/api/admin/sellers', authenticate, isAdmin, sellerController.getSellers);
  app.post('/api/admin/sellers/:id/approve', authenticate, isAdmin, sellerController.approveSeller);
  app.post('/api/admin/sellers/:id/reject', authenticate, isAdmin, sellerController.rejectSeller);

  // Seller Applications
  app.get(
    '/api/admin/seller-applications',
    authenticate,
    isAdmin,
    sellerController.getSellerApplications
  );
  app.put(
    '/api/admin/seller-applications/:id/approve',
    authenticate,
    isAdmin,
    sellerController.approveApplication
  );
  app.put(
    '/api/admin/seller-applications/:id/reject',
    authenticate,
    isAdmin,
    sellerController.rejectApplication
  );
  app.get(
    '/api/admin/seller-applications/stats',
    authenticate,
    isAdmin,
    sellerController.getApplicationStats
  );

  // Seller Withdrawals
  app.get(
    '/api/admin/seller-withdrawals',
    authenticate,
    isAdmin,
    sellerController.getSellerWithdrawals
  );
  app.put(
    '/api/admin/seller-withdrawals/:id/status',
    authenticate,
    isAdmin,
    sellerController.updateWithdrawalStatus
  );
  app.put(
    '/api/admin/seller-withdrawals/:id',
    authenticate,
    isAdmin,
    sellerController.updateWithdrawal
  );
}
