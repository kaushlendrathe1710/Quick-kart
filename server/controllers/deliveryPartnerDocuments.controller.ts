import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryPartnerDocumentsService } from '@server/db/services';
import { uploadToS3, deleteFromS3 } from '@server/utils';
import { DELIVERY_PARTNER_S3_CONFIG } from '@server/constants';

/**
 * Delivery Partner Documents Controller
 * Handles CRUD operations for delivery partner documents with S3 file uploads
 */
export class DeliveryPartnerDocumentsController {
  /**
   * Get documents by ID
   * GET /api/delivery-partner/documents/:id
   */
  static async getDocumentsById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const documents = await deliveryPartnerDocumentsService.getDocumentsById(id);

      if (!documents) {
        return res.status(404).json({
          success: false,
          message: 'Documents not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: documents,
      });
    } catch (error) {
      console.error('Get documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve documents',
      });
    }
  }

  /**
   * Get documents by delivery partner (current user)
   * GET /api/delivery-partner/documents
   */
  static async getMyDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const documents = await deliveryPartnerDocumentsService.getDocumentsByPartnerId(userId);

      if (!documents) {
        return res.status(404).json({
          success: false,
          message: 'Documents not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Documents retrieved successfully',
        data: documents,
      });
    } catch (error) {
      console.error('Get my documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve documents',
      });
    }
  }

  /**
   * Create or upload documents
   * POST /api/delivery-partner/documents
   */
  static async createDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      console.log('Files received:', Object.keys(req.files || {}));


      // Check if documents already exist
      const existingDocs = await deliveryPartnerDocumentsService.documentsExist(userId);
      if (existingDocs) {
        return res.status(400).json({
          success: false,
          message: 'Documents already exist. Use update endpoint to modify.',
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const { aadharNumber, panNumber, licenseNumber } = req.body;

      // Upload files to S3
      const documentUrls: any = {};

      if (files?.aadharCard?.[0]) {
        documentUrls.aadharCard = await uploadToS3(
          files.aadharCard[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }
      if (files?.panCard?.[0]) {
        documentUrls.panCard = await uploadToS3(
          files.panCard[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }
      if (files?.drivingLicense?.[0]) {
        documentUrls.drivingLicense = await uploadToS3(
          files.drivingLicense[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }
      if (files?.vehicleRegistration?.[0]) {
        documentUrls.vehicleRegistration = await uploadToS3(
          files.vehicleRegistration[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }
      if (files?.insuranceCertificate?.[0]) {
        documentUrls.insuranceCertificate = await uploadToS3(
          files.insuranceCertificate[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }

      // Create documents record
      const newDocuments = await deliveryPartnerDocumentsService.createDocuments({
        deliveryPartnerId: userId,
        ...documentUrls,
        aadharNumber,
        panNumber,
        licenseNumber,
      });

      return res.status(201).json({
        success: true,
        message: 'Documents uploaded successfully',
        data: newDocuments,
      });
    } catch (error) {
      console.error('Create documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload documents',
      });
    }
  }

  /**
   * Update documents (partial update with file replacement)
   * PATCH /api/delivery-partner/documents/:id
   */
  static async updateDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing documents
      const existingDocs = await deliveryPartnerDocumentsService.getDocumentsById(id);
      if (!existingDocs) {
        return res.status(404).json({
          success: false,
          message: 'Documents not found',
        });
      }

      // Check ownership
      if (existingDocs.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update these documents',
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const { aadharNumber, panNumber, licenseNumber } = req.body;

      const updateData: any = {};

      // Update aadhar card if new file provided
      if (files?.aadharCard?.[0]) {
        if (existingDocs.aadharCard) {
          await deleteFromS3(existingDocs.aadharCard);
        }
        updateData.aadharCard = await uploadToS3(
          files.aadharCard[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }

      // Update PAN card if new file provided
      if (files?.panCard?.[0]) {
        if (existingDocs.panCard) {
          await deleteFromS3(existingDocs.panCard);
        }
        updateData.panCard = await uploadToS3(
          files.panCard[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }

      // Update driving license if new file provided
      if (files?.drivingLicense?.[0]) {
        if (existingDocs.drivingLicense) {
          await deleteFromS3(existingDocs.drivingLicense);
        }
        updateData.drivingLicense = await uploadToS3(
          files.drivingLicense[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }

      // Update vehicle registration if new file provided
      if (files?.vehicleRegistration?.[0]) {
        if (existingDocs.vehicleRegistration) {
          await deleteFromS3(existingDocs.vehicleRegistration);
        }
        updateData.vehicleRegistration = await uploadToS3(
          files.vehicleRegistration[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }

      // Update insurance certificate if new file provided
      if (files?.insuranceCertificate?.[0]) {
        if (existingDocs.insuranceCertificate) {
          await deleteFromS3(existingDocs.insuranceCertificate);
        }
        updateData.insuranceCertificate = await uploadToS3(
          files.insuranceCertificate[0],
          DELIVERY_PARTNER_S3_CONFIG.DOCUMENTS_FOLDER,
          userId
        );
      }

      // Update document numbers if provided
      if (aadharNumber) updateData.aadharNumber = aadharNumber;
      if (panNumber) updateData.panNumber = panNumber;
      if (licenseNumber) updateData.licenseNumber = licenseNumber;

      // Update documents
      const updatedDocuments = await deliveryPartnerDocumentsService.updateDocuments(
        id,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: 'Documents updated successfully',
        data: updatedDocuments,
      });
    } catch (error) {
      console.error('Update documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update documents',
      });
    }
  }

  /**
   * Delete documents
   * DELETE /api/delivery-partner/documents/:id
   */
  static async deleteDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing documents
      const existingDocs = await deliveryPartnerDocumentsService.getDocumentsById(id);
      if (!existingDocs) {
        return res.status(404).json({
          success: false,
          message: 'Documents not found',
        });
      }

      // Check ownership
      if (existingDocs.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete these documents',
        });
      }

      // Delete files from S3
      const filesToDelete = [
        existingDocs.aadharCard,
        existingDocs.panCard,
        existingDocs.drivingLicense,
        existingDocs.vehicleRegistration,
        existingDocs.insuranceCertificate,
      ].filter(Boolean) as string[];

      for (const fileUrl of filesToDelete) {
        try {
          await deleteFromS3(fileUrl);
        } catch (error) {
          console.error(`Failed to delete file: ${fileUrl}`, error);
        }
      }

      // Delete documents record
      await deliveryPartnerDocumentsService.deleteDocuments(id);

      return res.status(200).json({
        success: true,
        message: 'Documents deleted successfully',
      });
    } catch (error) {
      console.error('Delete documents error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete documents',
      });
    }
  }
}
