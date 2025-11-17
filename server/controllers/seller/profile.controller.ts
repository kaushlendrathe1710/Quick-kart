import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { sellerService } from '@server/db/services/seller.service';
import { sellerSettingsService } from '@server/db/services/sellerSettings.service';
import { db } from '@server/db/connect';
import { users } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Seller Profile Controller
 * Handles seller profile and business information management
 */

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  contactNumber: z.string().regex(/^\d{10}$/).optional(),
  businessName: z.string().min(2).max(200).optional(),
  businessAddress: z.string().min(5).max(500).optional(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
});

const updateBankingSchema = z.object({
  bankName: z.string().min(2).max(100),
  bankState: z.string().min(2).max(100),
  bankCity: z.string().min(2).max(100),
  bankPincode: z.string().regex(/^\d{6}$/),
  accountNumber: z.string().min(9).max(18),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
});

export class SellerProfileController {
  /**
   * Get seller profile with full details
   * GET /api/seller/profile
   */
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Get seller with all details
      const seller = await sellerService.getSellerById(sellerId);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found',
        });
      }

      // Get seller settings
      const settings = await sellerSettingsService.getOrCreateSettings(sellerId);

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: seller.id,
            email: seller.email,
            name: seller.name,
            contactNumber: seller.contactNumber,
            avatar: seller.avatar,
            isApproved: seller.isApproved,
            rejected: seller.rejected,
            rejectionReason: seller.rejectionReason,
            createdAt: seller.createdAt,
          },
          businessInfo: seller.sellerInfo,
          settings,
        },
      });
    } catch (error) {
      console.error('Error getting seller profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update seller profile
   * PUT /api/seller/profile
   */
  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Validate request body
      const validatedData = updateProfileSchema.parse(req.body);

      // Separate user fields from seller info fields
      const userFields: Partial<{
        name: string;
        contactNumber: string;
      }> = {};

      const sellerInfoFields: Partial<{
        businessName: string;
        businessAddress: string;
        gstNumber: string;
        panNumber: string;
      }> = {};

      if (validatedData.name) userFields.name = validatedData.name;
      if (validatedData.contactNumber) userFields.contactNumber = validatedData.contactNumber;
      if (validatedData.businessName) sellerInfoFields.businessName = validatedData.businessName;
      if (validatedData.businessAddress) sellerInfoFields.businessAddress = validatedData.businessAddress;
      if (validatedData.gstNumber) sellerInfoFields.gstNumber = validatedData.gstNumber;
      if (validatedData.panNumber) sellerInfoFields.panNumber = validatedData.panNumber;

      // Update user table if needed
      if (Object.keys(userFields).length > 0) {
        await db
          .update(users)
          .set({ ...userFields, updatedAt: new Date() })
          .where(eq(users.id, sellerId));
      }

      // Update seller info if needed
      if (Object.keys(sellerInfoFields).length > 0) {
        await sellerService.updateSellerInfo(sellerId, sellerInfoFields);
      }

      // Get updated profile
      const updatedSeller = await sellerService.getSellerById(sellerId);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedSeller,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid profile data',
          errors: error.errors,
        });
      }

      console.error('Error updating seller profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update banking information
   * PUT /api/seller/profile/banking
   */
  static async updateBanking(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Validate request body
      const validatedData = updateBankingSchema.parse(req.body);

      // Update banking info
      const updated = await sellerService.updateBankingInfo(sellerId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Banking information updated successfully',
        data: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid banking data',
          errors: error.errors,
        });
      }

      console.error('Error updating banking info:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update banking information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get approval status
   * GET /api/seller/profile/status
   */
  static async getApprovalStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      const seller = await db.query.users.findFirst({
        where: eq(users.id, sellerId),
        columns: {
          isApproved: true,
          rejected: true,
          rejectionReason: true,
        },
        with: {
          sellerInfo: {
            columns: {
              approvedAt: true,
              approvedBy: true,
              rejectedAt: true,
              rejectedBy: true,
            },
          },
        },
      });

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Approval status retrieved successfully',
        data: seller,
      });
    } catch (error) {
      console.error('Error getting approval status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve approval status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
