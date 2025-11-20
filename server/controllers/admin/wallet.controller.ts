import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { walletService } from '@server/db/services';

/**
 * Admin Wallet Controller
 * Handles wallet management and payout approvals for administrators
 */
export class AdminWalletController {
  /**
   * Get wallet by ID
   * GET /api/admin/wallet/:id
   */
  static async getWalletById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const wallet = await walletService.getWalletById(id);

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Wallet retrieved successfully',
        data: wallet,
      });
    } catch (error) {
      console.error('Get wallet error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallet',
      });
    }
  }

  /**
   * Update payout status
   * PATCH /api/admin/payout/:id/status
   */
  static async updatePayoutStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { status, paymentReferenceId, paymentMethod, rejectionReason } = req.body;

      // Get payout
      const payout = await walletService.getPayoutById(id);
      if (!payout) {
        return res.status(404).json({
          success: false,
          message: 'Payout not found',
        });
      }

      // Update payout status
      const updatedPayout = await walletService.updatePayoutStatus(id, status, {
        paymentReferenceId,
        paymentMethod,
        rejectionReason,
      });

      return res.status(200).json({
        success: true,
        message: 'Payout status updated successfully',
        data: updatedPayout,
      });
    } catch (error) {
      console.error('Update payout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update payout',
      });
    }
  }

  /**
   * Get pending payouts
   * GET /api/admin/payout/pending
   */
  static async getPendingPayouts(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const payouts = await walletService.getPendingPayouts({ limit, offset });

      return res.status(200).json({
        success: true,
        message: 'Pending payouts retrieved successfully',
        data: payouts,
      });
    } catch (error) {
      console.error('Get pending payouts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve pending payouts',
      });
    }
  }

  /**
   * Get all payouts with filters
   * GET /api/admin/payout
   */
  static async getAllPayouts(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string | undefined;

      const payouts = await walletService.getAllPayouts({ limit, offset, status });

      return res.status(200).json({
        success: true,
        message: 'Payouts retrieved successfully',
        data: payouts,
      });
    } catch (error) {
      console.error('Get all payouts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payouts',
      });
    }
  }
}
