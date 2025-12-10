import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@server/types';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  fetchPaymentDetails,
} from '@server/config/razorpay';
import {
  createOrderFromCart,
  updateOrderWithRazorpayDetails,
  updateOrderEarnings,
  getOrderByRazorpayOrderId,
  getOrderById,
} from '@server/db/services/order.service';
import { getOrCreateWallet, creditWallet } from '@server/db/services/wallet.service';
import { logger } from '@server/utils/logger';

/**
 * Razorpay Payment Controller
 * Handles Razorpay order creation, payment verification, and wallet crediting
 */

// Validation schemas
const createRazorpayOrderSchema = z.object({
  addressId: z.number().int().positive(),
  notes: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export class RazorpayController {
  /**
   * Create Razorpay order for checkout
   * POST /api/razorpay/create-order
   */
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { addressId, notes } = createRazorpayOrderSchema.parse(req.body);

      // 1. Create order from cart
      const order = await createOrderFromCart(userId, addressId, notes);

      // 2. Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(
        parseFloat(order.finalAmount),
        'INR',
        `order_${order.id}`,
        {
          orderId: order.id.toString(),
          userId: userId.toString(),
        }
      );

      // 3. Update order with Razorpay order ID
      await updateOrderWithRazorpayDetails(order.id, razorpayOrder.id, '', '', undefined);

      logger.info(`Razorpay order created: ${razorpayOrder.id} for order ${order.id}`);

      return res.status(200).json({
        success: true,
        message: 'Razorpay order created successfully',
        data: {
          orderId: order.id,
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
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

      logger.error('Create Razorpay order error:', error as Error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create Razorpay order',
      });
    }
  }

  /**
   * Verify Razorpay payment and credit wallets
   * POST /api/razorpay/verify-payment
   */
  static async verifyPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifyPaymentSchema.parse(
        req.body
      );

      // 1. Verify signature
      const isValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        logger.error(`Invalid Razorpay signature for order ${razorpayOrderId}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature',
        });
      }

      // 2. Fetch payment details from Razorpay
      const paymentDetails = await fetchPaymentDetails(razorpayPaymentId);

      // 3. Get order
      const order = await getOrderByRazorpayOrderId(razorpayOrderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Verify order belongs to user
      if (order.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Check if payment already completed
      if (order.paymentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Payment already completed for this order',
        });
      }

      // 4. Update order with payment details
      await updateOrderWithRazorpayDetails(
        order.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        paymentDetails.method || undefined
      );

      // 5. Calculate commissions and earnings
      const finalAmount = parseFloat(order.finalAmount);
      const shippingCharges = parseFloat(order.shippingCharges || '0');

      // Platform commission: 10% of (finalAmount - shippingCharges)
      const platformCommissionRate = 0.1;
      const platformCommission = (finalAmount - shippingCharges) * platformCommissionRate;

      // Seller earnings: finalAmount - shippingCharges - platformCommission
      const sellerEarnings = finalAmount - shippingCharges - platformCommission;

      // Update order with earnings breakdown
      await updateOrderEarnings(order.id, {
        platformCommission: platformCommission.toFixed(2),
        sellerEarnings: sellerEarnings.toFixed(2),
      });

      // 6. Credit seller wallet
      if (order.sellerId) {
        try {
          const sellerWallet = await getOrCreateWallet(order.sellerId, 'seller');
          await creditWallet(sellerWallet.id, sellerEarnings.toFixed(2), {
            orderId: order.id,
            type: 'received',
            category: 'order_earning',
            description: `Earnings from order #${order.id}`,
            referenceId: razorpayPaymentId,
            metadata: JSON.stringify({
              platformCommission: platformCommission.toFixed(2),
              shippingCharges: shippingCharges.toFixed(2),
            }),
          });

          logger.info(
            `Credited seller wallet: ₹${sellerEarnings.toFixed(2)} for order ${order.id}`
          );
        } catch (error) {
          logger.error(`Failed to credit seller wallet for order ${order.id}:`, error as Error);
        }
      }

      // 7. Credit delivery partner wallet (if assigned)
      if (order.deliveryPartnerId && shippingCharges > 0) {
        try {
          const deliveryWallet = await getOrCreateWallet(
            order.deliveryPartnerId,
            'deliveryPartner'
          );
          await creditWallet(deliveryWallet.id, shippingCharges.toFixed(2), {
            orderId: order.id,
            type: 'pending', // Pending until delivery is completed
            category: 'delivery_fee',
            description: `Delivery fee for order #${order.id} (pending completion)`,
            referenceId: razorpayPaymentId,
          });

          logger.info(
            `Credited delivery partner wallet (pending): ₹${shippingCharges.toFixed(2)} for order ${order.id}`
          );
        } catch (error) {
          logger.error(
            `Failed to credit delivery partner wallet for order ${order.id}:`,
            error as Error
          );
        }
      }

      logger.info(`Payment verified successfully for order ${order.id}`);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: order.id,
          paymentStatus: 'completed',
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

      logger.error('Verify payment error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
      });
    }
  }

  /**
   * Get Razorpay key for frontend
   * GET /api/razorpay/key
   */
  static async getRazorpayKey(req: AuthenticatedRequest, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      logger.error('Get Razorpay key error:', error as Error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get Razorpay key',
      });
    }
  }
}
