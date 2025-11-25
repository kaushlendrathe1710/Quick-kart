import type { Express } from 'express';
import { SellerStoreController } from '../../controllers/seller/store.controller';
import { authenticate, isSeller } from '../../middleware/auth.middleware';
import { requireSellerApproval } from '../../middleware/sellerApproval.middleware';
import { storeImageUpload } from '../../config/multer';

/**
 * Register seller store routes
 * Consolidates store information from profile, business, and settings
 */
export function registerSellerStoreRoutes(app: Express): void {
  const middleware = [authenticate, isSeller, requireSellerApproval];

  /**
   * @route   GET /api/seller/store
   * @desc    Get consolidated store details
   * @access  Private (Seller - Approved)
   */
  app.get('/api/seller/store', ...middleware, SellerStoreController.getStoreDetails);

  /**
   * @route   PUT /api/seller/store
   * @desc    Update store details
   * @access  Private (Seller - Approved)
   * @body    { storeName?, storeDescription?, address?, city?, state?, pincode?, contactNumber?, email? }
   */
  app.put('/api/seller/store', ...middleware, SellerStoreController.updateStoreDetails);

  /**
   * @route   POST /api/seller/store/logo
   * @desc    Upload/update store logo
   * @access  Private (Seller - Approved)
   * @body    FormData with 'logo' file
   */
  app.post(
    '/api/seller/store/logo',
    ...middleware,
    storeImageUpload.single('logo'),
    SellerStoreController.uploadLogo
  );

  /**
   * @route   POST /api/seller/store/banner
   * @desc    Upload/update store banner
   * @access  Private (Seller - Approved)
   * @body    FormData with 'banner' file
   */
  app.post(
    '/api/seller/store/banner',
    ...middleware,
    storeImageUpload.single('banner'),
    SellerStoreController.uploadBanner
  );
}
