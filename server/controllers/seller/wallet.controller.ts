import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@server/types';
import {
  getOrCreateWallet,
  getTransactionsByWalletId,
  createWithdrawalRequest,
  getWithdrawalRequestsByUser,
  getWithdrawalRequestById,
} from '@server/db/services/wallet.service';
import { logger } from '@server/utils/logger';

/**
 * Seller Wallet Controller
 * Handles wallet operations for sellers
 */

// Validation schemas
const withdrawalRequestSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'),
  paymentMethod: z.enum(['bank_transfer', 'upi']),
  accountDetails: z.string().min(1, 'Account details are required'),
});

const paginationSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
});

export class SellerWalletController {
  /**
   * Get seller wallet balance and summary
   * GET /api/seller/wallet
   */
  static async getWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'seller') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Sellers only.',
        });
      }

      const wallet = await getOrCreateWallet(userId, 'seller');

      return res.status(200).json({
        success: true,
        message: 'Wallet retrieved successfully',
        data: wallet,
      });
    } catch (error) {
      logger.error('Get seller wallet error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve wallet',
      });
    }
  }

  /**
   * Get seller wallet transactions
   * GET /api/seller/wallet/transactions
   */
  static async getTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'seller') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Sellers only.',
        });
      }

      const { page, limit } = paginationSchema.parse(req.query);
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const wallet = await getOrCreateWallet(userId, 'seller');
      const transactions = await getTransactionsByWalletId(wallet.id, {
        limit: limitNum,
        offset,
      });

      return res.status(200).json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: {
          transactions,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount: transactions.length,
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

      logger.error('Get seller transactions error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve transactions',
      });
    }
  }

  /**
   * Create withdrawal request
   * POST /api/seller/wallet/withdraw
   */
  static async requestWithdrawal(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'seller') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Sellers only.',
        });
      }

      const { amount, paymentMethod, accountDetails } = withdrawalRequestSchema.parse(req.body);

      const wallet = await getOrCreateWallet(userId, 'seller');

      // Create withdrawal request
      const withdrawalRequest = await createWithdrawalRequest({
        walletId: wallet.id,
        userId,
        userType: 'seller',
        amount,
        paymentMethod,
        accountDetails,
      });

      logger.info(`Withdrawal request created: ${withdrawalRequest.id} for seller ${userId}`);

      return res.status(201).json({
        success: true,
        message: 'Withdrawal request created successfully',
        data: withdrawalRequest,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      logger.error('Create withdrawal request error:', error as Error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create withdrawal request',
      });
    }
  }

  /**
   * Get withdrawal requests
   * GET /api/seller/wallet/withdrawals
   */
  static async getWithdrawalRequests(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'seller') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Sellers only.',
        });
      }

      const { page, limit } = paginationSchema.parse(req.query);
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const withdrawalRequests = await getWithdrawalRequestsByUser(userId, {
        limit: limitNum,
        offset,
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

      logger.error('Get withdrawal requests error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve withdrawal requests',
      });
    }
  }

  /**
   * Get single withdrawal request
   * GET /api/seller/wallet/withdrawals/:id
   */
  static async getWithdrawalRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || userRole !== 'seller') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Sellers only.',
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

      // Verify it belongs to the seller
      if (withdrawalRequest.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      return res.status(200).json({
        success: false,
        message: 'Withdrawal request retrieved successfully',
        data: withdrawalRequest,
      });
    } catch (error) {
      logger.error('Get withdrawal request error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve withdrawal request',
      });
    }
  }
}
