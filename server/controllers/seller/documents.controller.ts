import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { sellerDocumentService } from '@server/db/services/sellerDocument.service';
import { z } from 'zod';

/**
 * Seller Documents Controller
 * Handles document upload, retrieval, and deletion for seller verification
 */

// Validation schema
const uploadDocumentSchema = z.object({
  documentType: z.enum([
    'gst_certificate',
    'pan_card',
    'aadhaar',
    'bank_statement',
    'business_license',
    'cancelled_cheque',
    'address_proof',
    'other',
  ]),
  documentName: z.string().min(1).max(255),
  documentUrl: z.string().url(),
  fileSize: z.number().positive().optional(),
  mimeType: z.string().optional(),
  description: z.string().max(500).optional(),
});

export class SellerDocumentsController {
  /**
   * Get all documents for seller
   * GET /api/seller/documents
   */
  static async listDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const documentType = req.query.type as string | undefined;

      let documents;
      if (documentType) {
        documents = await sellerDocumentService.getDocumentsByType(sellerId, documentType as any);
      } else {
        documents = await sellerDocumentService.getDocumentsBySellerId(sellerId);
      }

      return res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: documents,
      });
    } catch (error) {
      console.error('Error listing documents:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve documents',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get document by ID
   * GET /api/seller/documents/:id
   */
  static async getDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const documentId = parseInt(req.params.id);

      if (isNaN(documentId) || documentId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document ID',
        });
      }

      const document = await sellerDocumentService.getDocumentById(documentId, sellerId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found or access denied',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Document retrieved successfully',
        data: document,
      });
    } catch (error) {
      console.error('Error getting document:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Upload a new document
   * POST /api/seller/documents
   */
  static async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Validate request body
      const validatedData = uploadDocumentSchema.parse(req.body);

      // Create document record
      const document = await sellerDocumentService.createDocument({
        sellerId,
        documentType: validatedData.documentType,
        documentName: validatedData.documentName,
        documentUrl: validatedData.documentUrl,
        fileSize: validatedData.fileSize,
        mimeType: validatedData.mimeType,
        description: validatedData.description,
      });

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document data',
          errors: error.errors,
        });
      }

      console.error('Error uploading document:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete a document
   * DELETE /api/seller/documents/:id
   */
  static async deleteDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const documentId = parseInt(req.params.id);

      if (isNaN(documentId) || documentId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document ID',
        });
      }

      const success = await sellerDocumentService.deleteDocument(documentId, sellerId);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Document not found or access denied',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get document statistics
   * GET /api/seller/documents/stats
   */
  static async getDocumentStats(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      const allDocuments = await sellerDocumentService.getDocumentsBySellerId(sellerId);

      // Group by document type
      const stats = allDocuments.reduce(
        (acc, doc) => {
          const type = doc.documentType;
          if (!acc[type]) {
            acc[type] = 0;
          }
          acc[type]++;
          return acc;
        },
        {} as Record<string, number>
      );

      return res.status(200).json({
        success: true,
        message: 'Document statistics retrieved successfully',
        data: {
          total: allDocuments.length,
          byType: stats,
        },
      });
    } catch (error) {
      console.error('Error getting document stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve document statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
