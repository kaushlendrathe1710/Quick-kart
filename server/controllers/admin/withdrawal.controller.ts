import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@server/types';
import {
  getAllWithdrawalRequests,
  getWithdrawalRequestById,
  updateWithdrawalRequestStatus,
  debitWallet,
  getWalletById,
} from '@server/db/services/wallet.service';
import { logger } from '@server/utils/logger';

/**
 * Admin Withdrawal Controller
 * Handles admin operations for withdrawal requests
 */

// Validation schemas
const paginationSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('50'),
  status: z.string().optional(),
  userType: z.string().optional(),
});

const approveWithdrawalSchema = z.object({
  adminNotes: z.string().optional(),
  payoutReferenceId: z.string().optional(),
  razorpayPayoutId: z.string().optional(),
});

const rejectWithdrawalSchema = z.object({
  rejectionReason: z.string().min(1, 'Rejection reason is required'),
  adminNotes: z.string().optional(),
});

export class AdminWithdrawalController {
  /**
   * Get all withdrawal requests
   * GET /api/admin/withdrawals
   */
  static async getAllWithdrawals(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admins only.',
        });
      }

      const { page, limit, status, userType } = paginationSchema.parse(req.query);
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const withdrawalRequests = await getAllWithdrawalRequests({
        limit: limitNum,
        offset,
        status,
        userType,
      });

      return res.status(200).json({
        success: true,
        message: 'Withdrawal requests retrieved successfully',
        data: {
          withdrawalRequests,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount: withdrawalRequests.length,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      logger.error('Get all withdrawals error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve withdrawal requests',
      });
    }
  }

  /**
   * Get single withdrawal request
   * GET /api/admin/withdrawals/:id
   */
  static async getWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const userRole = req.user?.role;

      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admins only.',
        });
      }

      const id = parseInt(req.params.id);

      const withdrawalRequest = await getWithdrawalRequestById(id);

      if (!withdrawalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal request not found',
        });
      }

      // Get associated wallet
      const wallet = await getWalletById(withdrawalRequest.walletId);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal request retrieved successfully',
        data: {
          withdrawalRequest,
          wallet,
        },
      });
    } catch (error) {
      logger.error('Get withdrawal error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve withdrawal request',
      });
    }
  }

  /**
   * Approve withdrawal request
   * PUT /api/admin/withdrawals/:id/approve
   */
  static async approveWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admins only.',
        });
      }

      const id = parseInt(req.params.id);
      const { adminNotes, payoutReferenceId, razorpayPayoutId } = approveWithdrawalSchema.parse(
        req.body
      );

      const withdrawalRequest = await getWithdrawalRequestById(id);

      if (!withdrawalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal request not found',
        });
      }

      if (withdrawalRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Withdrawal request cannot be approved. Current status: ${withdrawalRequest.status}`,
        });
      }

      // Update status to approved
      await updateWithdrawalRequestStatus(id, 'approved', {
        processedBy: userId,
        adminNotes,
        payoutReferenceId,
        razorpayPayoutId,
      });

      logger.info(`Withdrawal request ${id} approved by admin ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal request approved successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      logger.error('Approve withdrawal error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to approve withdrawal request',
      });
    }
  }

  /**
   * Complete withdrawal (mark as paid and debit wallet)
   * PUT /api/admin/withdrawals/:id/complete
   */
  static async completeWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admins only.',
        });
      }

      const id = parseInt(req.params.id);
      const { adminNotes, payoutReferenceId, razorpayPayoutId } = approveWithdrawalSchema.parse(
        req.body
      );

      const withdrawalRequest = await getWithdrawalRequestById(id);

      if (!withdrawalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal request not found',
        });
      }

      if (!['approved', 'processing'].includes(withdrawalRequest.status)) {
        return res.status(400).json({
          success: false,
          message: `Withdrawal request cannot be completed. Current status: ${withdrawalRequest.status}`,
        });
      }

      // Debit wallet
      await debitWallet(withdrawalRequest.walletId, withdrawalRequest.amount, {
        type: 'deducted',
        category: 'withdrawal',
        description: `Withdrawal completed - Request #${withdrawalRequest.id}`,
        referenceId: payoutReferenceId || razorpayPayoutId,
        metadata: JSON.stringify({
          withdrawalRequestId: withdrawalRequest.id,
          processedBy: userId,
        }),
      });

      // Update status to completed
      await updateWithdrawalRequestStatus(id, 'completed', {
        processedBy: userId,
        adminNotes,
        payoutReferenceId,
        razorpayPayoutId,
      });

      logger.info(`Withdrawal request ${id} completed by admin ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal completed successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      logger.error('Complete withdrawal error:', error as Error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to complete withdrawal',
      });
    }
  }

  /**
   * Reject withdrawal request
   * PUT /api/admin/withdrawals/:id/reject
   */
  static async rejectWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admins only.',
        });
      }

      const id = parseInt(req.params.id);
      const { rejectionReason, adminNotes } = rejectWithdrawalSchema.parse(req.body);

      const withdrawalRequest = await getWithdrawalRequestById(id);

      if (!withdrawalRequest) {
        return res.status(404).json({
          success: false,
          message: 'Withdrawal request not found',
        });
      }

      if (withdrawalRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Withdrawal request cannot be rejected. Current status: ${withdrawalRequest.status}`,
        });
      }

      // Update status to rejected
      await updateWithdrawalRequestStatus(id, 'rejected', {
        processedBy: userId,
        adminNotes,
        rejectionReason,
      });

      logger.info(`Withdrawal request ${id} rejected by admin ${userId}`);

      return res.status(200).json({
        success: true,
        message: 'Withdrawal request rejected successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      logger.error('Reject withdrawal error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to reject withdrawal request',
      });
    }
  }
}
