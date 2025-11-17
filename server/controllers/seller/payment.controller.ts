import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import * as sellerPaymentService from '@server/db/services/sellerPayment.service';

/**
 * Seller Payment Controller
 * Handles payment requests and withdrawal management for sellers
 */

export class SellerPaymentController {
  /**
   * Get seller's payment history
   * GET /api/seller/payments
   */
  static async getPayments(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      const status = req.query.status as string | undefined;

      const payments = await sellerPaymentService.getSellerPayments(sellerId, {
        limit,
        offset,
        status,
      });

      // Get total count
      const allPayments = await sellerPaymentService.getSellerPayments(sellerId, { status });

      return res.status(200).json({
        success: true,
        message: 'Payments retrieved successfully',
        data: {
          payments,
          pagination: {
            page,
            limit,
            total: allPayments.length,
            totalPages: Math.ceil(allPayments.length / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting payments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get single payment details
   * GET /api/seller/payments/:id
   */
  static async getPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const paymentId = parseInt(req.params.id);

      if (isNaN(paymentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment ID',
        });
      }

      const payment = await sellerPaymentService.getSellerPayment(paymentId);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      // Verify ownership
      if (payment.sellerId !== sellerId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this payment',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment retrieved successfully',
        data: payment,
      });
    } catch (error) {
      console.error('Error getting payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Request payment/withdrawal
   * POST /api/seller/payments/request
   */
  static async requestPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const { amount, notes } = req.body;

      // Validate amount
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid amount is required',
        });
      }

      // Create payment request
      const payment = await sellerPaymentService.createSellerPayment({
        sellerId,
        amount: amount.toString(),
        status: 'pending',
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Payment request created successfully',
        data: payment,
      });
    } catch (error) {
      console.error('Error requesting payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment request',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get payment summary
   * GET /api/seller/payments-summary
   */
  static async getPaymentSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;

      const summary = await sellerPaymentService.getSellerPaymentSummary(sellerId);

      return res.status(200).json({
        success: true,
        message: 'Payment summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      console.error('Error getting payment summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment summary',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
