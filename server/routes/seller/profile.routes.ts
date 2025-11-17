import type { Express } from 'express';
import { SellerProfileController } from '../../controllers/seller/profile.controller';
import { authenticate, isSeller } from '../../middleware/auth.middleware';
import { optionalSellerApproval } from '../../middleware/sellerApproval.middleware';

/**
 * Register seller profile routes
 * Protected routes - require authentication and seller role
 */
export function registerSellerProfileRoutes(app: Express): void {
  // Get seller profile (allow unapproved sellers to view their profile)
  app.get(
    '/api/seller/profile',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerProfileController.getProfile
  );

  // Update seller profile
  app.put(
    '/api/seller/profile',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerProfileController.updateProfile
  );

  // Update banking information
  app.put(
    '/api/seller/profile/banking',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerProfileController.updateBanking
  );

  // Get approval status
  app.get(
    '/api/seller/profile/status',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerProfileController.getApprovalStatus
  );
}
