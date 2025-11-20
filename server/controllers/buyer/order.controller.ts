import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '@server/types';
import {
  createOrderFromCart,
  getUserOrders,
  getOrderById,
  cancelOrder,
} from '@server/db/services/order.service';
import { PAGINATION_UPPER_LIMIT, PAGINATION_DEFAULT_LIMIT } from '@server/constants';

/**
 * Order Controller
 * Handles order operations (all protected routes)
 */

// Validation schema for order creation
const createOrderSchema = z.object({
  addressId: z.number().int().positive(),
  notes: z.string().optional(),
});

// Validation schema for pagination
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .min(1)
    .max(PAGINATION_UPPER_LIMIT)
    .default(PAGINATION_DEFAULT_LIMIT),
});

export class OrderController {
  /**
   * Create order from cart
   * POST /api/orders
   */
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;
      const data = createOrderSchema.parse(req.body);

      const order = await createOrderFromCart(userId, data.addressId, data.notes);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data',
          errors: error.errors,
        });
      }

      console.error('Error creating order:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      });
    }
  }

  /**
   * Get all orders for user with pagination
   * GET /api/orders?page=1&limit=10
   */
  static async getUserOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;
      const { page, limit } = paginationSchema.parse(req.query);

      const result = await getUserOrders(userId, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: result.orders,
          pagination: {
            page,
            limit,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
            hasNextPage: page < result.totalPages,
            hasPreviousPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:orderId
   */
  static async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
        });
      }

      const order = await getOrderById(orderId, userId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      console.error('Error getting order:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Cancel order
   * POST /api/orders/:orderId/cancel
   */
  static async cancelOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id!;
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
        });
      }

      await cancelOrder(orderId, userId);

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel order',
      });
    }
  }
}
