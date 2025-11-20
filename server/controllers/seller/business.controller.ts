import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import * as sellerBusinessService from '@server/db/services/sellerBusiness.service';

/**
 * Seller Business Controller
 * Handles business details and banking information for sellers
 */

export class SellerBusinessController {
  /**
   * Get seller's business details
   * GET /api/seller/business-details
   */
  static async getBusinessDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      const details = await sellerBusinessService.getBusinessDetails(sellerId);

      return res.status(200).json({
        success: true,
        message: 'Business details retrieved successfully',
        data: details || { sellerId },
      });
    } catch (error) {
      console.error('Error getting business details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve business details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update seller's business details
   * PUT /api/seller/business-details
   */
  static async updateBusinessDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const { businessName, gstNumber, panNumber, businessType } = req.body;

      // Validate required fields
      if (!businessName) {
        return res.status(400).json({
          success: false,
          message: 'Business name is required',
        });
      }

      // Update business details
      const details = await sellerBusinessService.updateBusinessDetails(sellerId, {
        businessName,
        gstNumber,
        panNumber,
        businessType,
      });

      return res.status(200).json({
        success: true,
        message: 'Business details updated successfully',
        data: details,
      });
    } catch (error) {
      console.error('Error updating business details:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update business details',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get seller's banking information
   * GET /api/seller/banking-information
   */
  static async getBankingInformation(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      const info = await sellerBusinessService.getBankingInformation(sellerId);

      return res.status(200).json({
        success: true,
        message: 'Banking information retrieved successfully',
        data: info || { sellerId },
      });
    } catch (error) {
      console.error('Error getting banking information:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve banking information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update seller's banking information
   * PUT /api/seller/banking-information
   */
  static async updateBankingInformation(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const { accountHolderName, accountNumber, bankName, ifscCode } = req.body;

      // Validate required fields
      const requiredFields = ['accountHolderName', 'accountNumber', 'bankName', 'ifscCode'];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      // Update banking information
      const info = await sellerBusinessService.updateBankingInformation(sellerId, {
        accountHolderName,
        accountNumber,
        bankName,
        ifscCode,
      });

      return res.status(200).json({
        success: true,
        message: 'Banking information updated successfully',
        data: info,
      });
    } catch (error) {
      console.error('Error updating banking information:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update banking information',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
