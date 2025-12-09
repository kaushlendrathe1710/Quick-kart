import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { walletService } from '@server/db/services';
import { DELIVERY_PARTNER_CONFIG } from '@server/constants';

/**
 * Delivery Partner Wallet Controller
 * Handles wallet, transactions, and payout operations for delivery partners
 */
export class DeliveryPartnerWalletController {
  /**
   * Get wallet
   * GET /api/deliveryPartner/wallet
   */
  static async getMyWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const wallet = await walletService.getWalletByUserId(userId);

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
   * Create wallet
   * POST /api/deliveryPartner/wallet
   */
  static async createWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check if wallet already exists
      const existingWallet = await walletService.walletExists(userId);
      if (existingWallet) {
        return res.status(400).json({
          success: false,
          message: 'Wallet already exists',
        });
      }

      // Create wallet
      const newWallet = await walletService.createWallet({
        userId: userId,
        userType: 'deliveryPartner',
        balance: '0.00',
        totalEarnings: '0.00',
        totalWithdrawn: '0.00',
      });

      return res.status(201).json({
        success: true,
        message: 'Wallet created successfully',
        data: newWallet,
      });
    } catch (error) {
      console.error('Create wallet error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create wallet',
      });
    }
  }

  /**
   * Get wallet transactions
   * GET /api/deliveryPartner/wallet/transactions
   */
  static async getMyTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const wallet = await walletService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const transactions = await walletService.getTransactionsByWalletId(wallet.id, {
        limit,
        offset,
      });

      return res.status(200).json({
        success: true,
        message: 'Transactions retrieved successfully',
        data: transactions,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve transactions',
      });
    }
  }

  /**
   * Get payouts
   * GET /api/deliveryPartner/wallet/payouts
   */
  static async getMyPayouts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const wallet = await walletService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const payouts = await walletService.getPayoutsByWalletId(wallet.id, { limit, offset });
      const stats = await walletService.getPayoutStats(wallet.id);

      return res.status(200).json({
        success: true,
        message: 'Payouts retrieved successfully',
        data: {
          payouts,
          stats,
        },
      });
    } catch (error) {
      console.error('Get payouts error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payouts',
      });
    }
  }

  /**
   * Apply for payout
   * POST /api/deliveryPartner/payout/apply
   */
  static async applyForPayout(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { amount } = req.body;

      // Get wallet
      const wallet = await walletService.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      // Check minimum threshold
      if (amount < DELIVERY_PARTNER_CONFIG.MINIMUM_PAYOUT_THRESHOLD) {
        return res.status(400).json({
          success: false,
          message: `Minimum payout amount is ₹${DELIVERY_PARTNER_CONFIG.MINIMUM_PAYOUT_THRESHOLD}`,
        });
      }

      // Check maximum limit
      if (amount > DELIVERY_PARTNER_CONFIG.MAXIMUM_PAYOUT_AMOUNT) {
        return res.status(400).json({
          success: false,
          message: `Maximum payout amount is ₹${DELIVERY_PARTNER_CONFIG.MAXIMUM_PAYOUT_AMOUNT}`,
        });
      }

      // Check available balance
      if (Number(wallet.balance) < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance',
        });
      }

      // Create payout request
      const newPayout = await walletService.createPayout({
        walletId: wallet.id,
        amount: amount.toString(),
        status: 'applied',
      });

      return res.status(201).json({
        success: true,
        message: 'Payout request submitted successfully',
        data: newPayout,
      });
    } catch (error) {
      console.error('Apply payout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to apply for payout',
      });
    }
  }
}
