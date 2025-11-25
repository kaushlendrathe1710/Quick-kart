import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { sellerSettingsService } from '@server/db/services/sellerSettings.service';
import { z } from 'zod';

/**
 * Seller Settings Controller
 * Handles store settings, notifications, and preferences
 */

const settingsSchema = z.object({
  storeDescription: z.string().max(1000).optional(),
  storeLogo: z.string().url().optional().nullable(),
  storeBanner: z.string().url().optional().nullable(),
  taxEnabled: z.boolean().optional(),
  defaultTaxRate: z.string().optional().nullable(),
  emailNotifications: z.boolean().optional(),
  orderNotifications: z.boolean().optional(),
  lowStockAlerts: z.boolean().optional(),
});

const pickupAddressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email(),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
  country: z.string().default('India'),
});

export class SellerSettingsController {
  /**
   * Get seller settings
   * GET /api/seller/settings
   */
  static async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      const settings = await sellerSettingsService.getOrCreateSettings(sellerId);

      return res.status(200).json({
        success: true,
        message: 'Settings retrieved successfully',
        data: settings,
      });
    } catch (error) {
      console.error('Error getting seller settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update seller settings
   * PUT /api/seller/settings
   */
  static async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Validate request body
      const validatedData = settingsSchema.parse(req.body);

      // Update settings
      const updated = await sellerSettingsService.updateSettings(sellerId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error updating seller settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update pickup address (one-time only)
   * PUT /api/seller/settings/pickup-address
   */
  static async updatePickupAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      // Validate pickup address
      const validatedAddress = pickupAddressSchema.parse(req.body);

      // Update pickup address
      const updated = await sellerSettingsService.updatePickupAddress(sellerId, validatedAddress);

      return res.status(200).json({
        success: true,
        message: 'Pickup address updated successfully',
        data: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Error updating pickup address:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update pickup address',
      });
    }
  }
}
