import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryPartnerBankService } from '@server/db/services';

/**
 * Delivery Partner Bank Details Controller
 * Handles CRUD operations for delivery partner bank account information
 */
export class DeliveryPartnerBankController {
  /**
   * Get bank details by ID
   * GET /api/delivery-partner/bank/:id
   */
  static async getBankDetailsById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const bankDetails = await deliveryPartnerBankService.getBankDetailsById(id);

      if (!bankDetails) {
        return res.status(404).json({
          success: false,
          message: 'Bank details not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Bank details retrieved successfully',
        data: bankDetails,
      });
    } catch (error) {
      console.error('Get bank details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bank details',
      });
    }
  }

  /**
   * Get bank details by delivery partner (current user)
   * GET /api/delivery-partner/bank
   */
  static async getMyBankDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const bankDetails = await deliveryPartnerBankService.getBankDetailsByPartnerId(userId);

      if (!bankDetails) {
        return res.status(404).json({
          success: false,
          message: 'Bank details not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Bank details retrieved successfully',
        data: bankDetails,
      });
    } catch (error) {
      console.error('Get my bank details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bank details',
      });
    }
  }

  /**
   * Create bank details
   * POST /api/delivery-partner/bank
   */
  static async createBankDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check if bank details already exist
      const existingBankDetails = await deliveryPartnerBankService.bankDetailsExist(userId);
      if (existingBankDetails) {
        return res.status(400).json({
          success: false,
          message: 'Bank details already exist. Use update endpoint to modify.',
        });
      }

      const {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        accountType,
        upiId,
      } = req.body;

      // Create bank details record
      const newBankDetails = await deliveryPartnerBankService.createBankDetails({
        deliveryPartnerId: userId,
        accountHolderName,
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        bankName,
        branchName,
        accountType,
        upiId,
      });

      return res.status(201).json({
        success: true,
        message: 'Bank details created successfully',
        data: newBankDetails,
      });
    } catch (error) {
      console.error('Create bank details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create bank details',
      });
    }
  }

  /**
   * Update bank details
   * PATCH /api/delivery-partner/bank/:id
   */
  static async updateBankDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing bank details
      const existingBankDetails = await deliveryPartnerBankService.getBankDetailsById(id);
      if (!existingBankDetails) {
        return res.status(404).json({
          success: false,
          message: 'Bank details not found',
        });
      }

      // Check ownership
      if (existingBankDetails.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update these bank details',
        });
      }

      const {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        branchName,
        accountType,
        upiId,
      } = req.body;

      const updateData: any = {};

      // Update fields if provided
      if (accountHolderName) updateData.accountHolderName = accountHolderName;
      if (accountNumber) updateData.accountNumber = accountNumber;
      if (ifscCode) updateData.ifscCode = ifscCode.toUpperCase();
      if (bankName) updateData.bankName = bankName;
      if (branchName !== undefined) updateData.branchName = branchName;
      if (accountType) updateData.accountType = accountType;
      if (upiId !== undefined) updateData.upiId = upiId;

      // Update bank details
      const updatedBankDetails = await deliveryPartnerBankService.updateBankDetails(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Bank details updated successfully',
        data: updatedBankDetails,
      });
    } catch (error) {
      console.error('Update bank details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update bank details',
      });
    }
  }

  /**
   * Delete bank details
   * DELETE /api/delivery-partner/bank/:id
   */
  static async deleteBankDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing bank details
      const existingBankDetails = await deliveryPartnerBankService.getBankDetailsById(id);
      if (!existingBankDetails) {
        return res.status(404).json({
          success: false,
          message: 'Bank details not found',
        });
      }

      // Check ownership
      if (existingBankDetails.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete these bank details',
        });
      }

      // Delete bank details record
      await deliveryPartnerBankService.deleteBankDetails(id);

      return res.status(200).json({
        success: true,
        message: 'Bank details deleted successfully',
      });
    } catch (error) {
      console.error('Delete bank details error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete bank details',
      });
    }
  }
}
