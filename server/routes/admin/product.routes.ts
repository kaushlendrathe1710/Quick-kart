import { Express } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth.middleware';
import * as productController from '../../controllers/admin/product.controller';

export function registerAdminProductRoutes(app: Express) {
  // Bulk operations (must be before individual product routes)
  app.post(
    '/api/admin/products/bulk/approve',
    authenticate,
    isAdmin,
    productController.bulkApproveProducts
  );
  app.post(
    '/api/admin/products/bulk/reject',
    authenticate,
    isAdmin,
    productController.bulkRejectProducts
  );

  // Product Management
  app.get('/api/admin/products', authenticate, isAdmin, productController.getAllProducts);
  app.get('/api/admin/products/stats', authenticate, isAdmin, productController.getProductStats);
  app.post(
    '/api/admin/products/:id/approve',
    authenticate,
    isAdmin,
    productController.approveProduct
  );
  app.post(
    '/api/admin/products/:id/reject',
    authenticate,
    isAdmin,
    productController.rejectProduct
  );
  app.delete('/api/admin/products/:id', authenticate, isAdmin, productController.deleteProduct);
  app.post(
    '/api/admin/products/:id/restore',
    authenticate,
    isAdmin,
    productController.restoreProduct
  );
}
