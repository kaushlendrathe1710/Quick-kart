import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { db } from '@server/db/connect';
import { sellerApplications, users, sellerDocuments } from '@server/db/schema';
import { eq, and } from 'drizzle-orm';
import { uploadWithPath, UPLOAD_PATHS } from '../../utils/s3.utils';
import { unlinkSync } from 'fs';

/**
 * Seller Application Controller
 * Handles seller application submission and document uploads
 */

/**
 * Get seller application
 * GET /api/seller/application
 */
export async function getSellerApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const application = await db.query.sellerApplications.findFirst({
      where: eq(sellerApplications.userId, userId),
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No application found',
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Error fetching seller application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
}

/**
 * Submit seller application
 * POST /api/seller/application/submit
 */
export async function submitSellerApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { businessName, businessAddress, gstNumber, panNumber, documentsSubmitted } = req.body;

    // Validate required fields
    if (!businessName || !businessAddress || !gstNumber || !panNumber) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if application already exists
    const existingApplication = await db.query.sellerApplications.findFirst({
      where: eq(sellerApplications.userId, userId),
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'Application already submitted' });
    }

    // Get user email and phone from users table
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new application
    const [application] = await db
      .insert(sellerApplications)
      .values({
        userId,
        businessName,
        businessAddress,
        gstNumber,
        panNumber,
        email: user.email,
        phone: user.contactNumber || '',
        documentsSubmitted: JSON.stringify(documentsSubmitted || []),
        status: 'pending',
        profileCompleted: 'true',
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error submitting seller application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
}

/**
 * Upload seller document
 * POST /api/seller/documents/upload
 */
export async function uploadSellerDocument(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { documentType } = req.body;
    const userId = req.user!.id;

    if (!documentType) {
      return res.status(400).json({ error: 'Document type is required' });
    }

    // Map camelCase to snake_case for database enum
    const documentTypeMapping: Record<string, string> = {
      gstCertificate: 'gst_certificate',
      panCard: 'pan_card',
      addressProof: 'address_proof',
      cancelledCheque: 'cancelled_cheque',
      bankStatement: 'bank_statement',
      businessLicense: 'business_license',
      aadhaar: 'aadhaar',
      other: 'other',
    };

    const dbDocumentType = documentTypeMapping[documentType] || documentType;

    // Upload to S3
    const documentUrl = await uploadWithPath({
      file: req.file,
      uploadPath: UPLOAD_PATHS.SELLER_DOCUMENTS(userId),
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    // Save document info to database
    const [document] = await db
      .insert(sellerDocuments)
      .values({
        sellerId: userId,
        documentType: dbDocumentType as any,
        documentName: req.file.originalname,
        documentUrl: documentUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      })
      .returning();

    // Clean up local file
    try {
      unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Error cleaning up local file:', cleanupError);
    }

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      documentUrl,
      documentType,
      document,
    });
  } catch (error: any) {
    console.error('Error uploading seller document:', error);

    // Clean up local file on error
    if (req.file?.path) {
      try {
        unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up local file after upload error:', cleanupError);
      }
    }

    res.status(500).json({ error: error.message || 'Failed to upload document' });
  }
}
