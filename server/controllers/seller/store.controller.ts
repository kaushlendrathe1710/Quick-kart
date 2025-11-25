import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { db } from '@server/db/connect';
import { users } from '@server/db/schema';
import { sellerSettingsService } from '@server/db/services/sellerSettings.service';
import * as sellerBusinessService from '@server/db/services/sellerBusiness.service';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Seller Store Controller
 * Consolidates store-related information from multiple sources:
 * - User profile (name, email, contact)
 * - Business details (business name, address)
 * - Seller settings (logo, banner, description)
 */

const updateStoreSchema = z.object({
  storeName: z.string().min(3).max(200).optional(),
  storeDescription: z.string().max(1000).optional(),
  address: z.string().min(10).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pincode: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
  contactNumber: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  email: z.string().email().optional(),
});

export class SellerStoreController {
  /**
   * Get consolidated store details
   * GET /api/seller/store
   */
  static async getStoreDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Get user profile
      const [user] = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Get business details
      const businessDetails = await sellerBusinessService.getBusinessDetails(sellerId);

      // Get seller settings
      const settings = await sellerSettingsService.getOrCreateSettings(sellerId);

      // Get pickup address from settings
      const pickupAddress = settings.pickupAddress as any;

      // Consolidate store data
      const storeData = {
        id: sellerId,
        sellerId: sellerId,
        storeName: businessDetails?.businessName || user.name || '',
        storeDescription: settings.storeDescription || '',
        logo: settings.storeLogo || '',
        banner: settings.storeBanner || '',
        address: pickupAddress?.addressLine1 || '',
        city: pickupAddress?.city || '',
        state: pickupAddress?.state || '',
        pincode: pickupAddress?.pincode || '',
        contactNumber: user.contactNumber || '',
        email: user.email || '',
        isActive: user.isApproved || false,
        createdAt: user.createdAt?.toISOString() || '',
        updatedAt: settings.updatedAt?.toISOString() || '',
      };

      return res.status(200).json({
        success: true,
        message: 'Store details retrieved successfully',
        data: storeData,
      });
    } catch (error) {
      console.error('Error getting store details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve store details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update store details
   * PUT /api/seller/store
   */
  static async updateStoreDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Validate request body
      const validation = updateStoreSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validation.error.errors,
        });
      }

      const { storeName, storeDescription, address, city, state, pincode, contactNumber, email } =
        validation.data;

      // Update user profile (name, contact, email)
      if (contactNumber || email) {
        const updateData: any = {};
        if (contactNumber) updateData.contactNumber = contactNumber;
        if (email) updateData.email = email;

        await db.update(users).set(updateData).where(eq(users.id, sellerId));
      }

      // Update business details (storeName)
      if (storeName) {
        await sellerBusinessService.updateBusinessDetails(sellerId, {
          businessName: storeName,
        });
      }

      // Update seller settings (description)
      if (storeDescription !== undefined) {
        await sellerSettingsService.updateSettings(sellerId, {
          storeDescription,
        });
      }

      // Update pickup address if address fields provided
      if (address || city || state || pincode) {
        const settings = await sellerSettingsService.getOrCreateSettings(sellerId);
        const currentAddress = (settings.pickupAddress as any) || {};

        const updatedAddress = {
          ...currentAddress,
          ...(address && { addressLine1: address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(pincode && { pincode }),
        };

        await sellerSettingsService.updateSettings(sellerId, {
          pickupAddress: updatedAddress as any,
        });
      }

      // Fetch updated data
      const [user] = await db.select().from(users).where(eq(users.id, sellerId)).limit(1);

      const businessDetails = await sellerBusinessService.getBusinessDetails(sellerId);
      const settings = await sellerSettingsService.getOrCreateSettings(sellerId);
      const pickupAddress = settings.pickupAddress as any;

      const storeData = {
        id: sellerId,
        sellerId: sellerId,
        storeName: businessDetails?.businessName || user.name || '',
        storeDescription: settings.storeDescription || '',
        logo: settings.storeLogo || '',
        banner: settings.storeBanner || '',
        address: pickupAddress?.addressLine1 || '',
        city: pickupAddress?.city || '',
        state: pickupAddress?.state || '',
        pincode: pickupAddress?.pincode || '',
        contactNumber: user.contactNumber || '',
        email: user.email || '',
        isActive: user.isApproved || false,
        createdAt: user.createdAt?.toISOString() || '',
        updatedAt: settings.updatedAt?.toISOString() || '',
      };

      return res.status(200).json({
        success: true,
        message: 'Store details updated successfully',
        data: storeData,
      });
    } catch (error) {
      console.error('Error updating store details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update store details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Upload store logo
   * POST /api/seller/store/logo
   */
  static async uploadLogo(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Import uploadToS3 dynamically
      const { uploadToS3 } = await import('../../utils/s3.utils');

      // Upload to S3
      const logoUrl = await uploadToS3(file, 'sellers/logos', sellerId);

      // Update seller settings
      await sellerSettingsService.updateSettings(sellerId, {
        storeLogo: logoUrl,
      });

      return res.status(200).json({
        success: true,
        message: 'Logo uploaded successfully',
        data: { logo: logoUrl },
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload logo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Upload store banner
   * POST /api/seller/store/banner
   */
  static async uploadBanner(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // Import uploadToS3 dynamically
      const { uploadToS3 } = await import('../../utils/s3.utils');

      // Upload to S3
      const bannerUrl = await uploadToS3(file, 'sellers/banners', sellerId);

      // Update seller settings
      await sellerSettingsService.updateSettings(sellerId, {
        storeBanner: bannerUrl,
      });

      return res.status(200).json({
        success: true,
        message: 'Banner uploaded successfully',
        data: { banner: bannerUrl },
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload banner',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
