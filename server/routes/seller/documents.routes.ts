import type { Express } from 'express';
import { SellerDocumentsController } from '../../controllers/seller/documents.controller';
import { authenticate, isSeller } from '../../middleware/auth.middleware';
import { optionalSellerApproval } from '../../middleware/sellerApproval.middleware';

/**
 * Register seller documents routes
 * Protected routes - require authentication and seller role
 * Allow unapproved sellers to upload documents for verification
 */
export function registerSellerDocumentsRoutes(app: Express): void {
  // List all documents
  app.get(
    '/api/seller/documents',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerDocumentsController.listDocuments
  );

  // Get document statistics
  app.get(
    '/api/seller/documents/stats',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerDocumentsController.getDocumentStats
  );

  // Get specific document
  app.get(
    '/api/seller/documents/:id',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerDocumentsController.getDocument
  );

  // Upload new document
  app.post(
    '/api/seller/documents',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerDocumentsController.uploadDocument
  );

  // Delete document
  app.delete(
    '/api/seller/documents/:id',
    authenticate,
    isSeller,
    optionalSellerApproval,
    SellerDocumentsController.deleteDocument
  );
}
