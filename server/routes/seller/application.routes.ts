import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { sellerDocumentUpload } from '../../config/multer';
import * as sellerApplicationController from '../../controllers/seller/sellerApplication.controller';
import App from '@/App';

const router = Router();

/**
 * Seller Application Routes
 * Handles seller application submission and document uploads
 */

// All routes require authentication
router.use(authenticate);

// Get seller application
router.get('/application', sellerApplicationController.getSellerApplication);

// Submit seller application
router.post('/application/submit', sellerApplicationController.submitSellerApplication);

// Upload seller document
router.post(
  '/documents/upload',
  sellerDocumentUpload.single('document'),
  sellerApplicationController.uploadSellerDocument
);

export function registerSellerApplicationRoutes(app: Router) {
  app.use('/api/seller', router);
}
