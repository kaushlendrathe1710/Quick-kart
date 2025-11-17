import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as adminOrderService from '../../db/services/adminOrder.service';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.utils';

/**
 * Get all orders with pagination
 * GET /api/admin/orders?page=1&limit=20&orderStatus=pending
 */
export async function getAllOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const { orderStatus, userId, sellerId, search } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    const filters = {
      orderStatus: orderStatus as string,
      userId: userId ? parseInt(userId as string) : undefined,
      sellerId: sellerId ? parseInt(sellerId as string) : undefined,
      search: search as string,
      limit,
      offset,
    };

    const result = await adminOrderService.getAllOrders(filters);

    if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
      res.json(createPaginatedResponse(result.data, page, limit, result.total));
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * Get order by ID
 * GET /api/admin/orders/:id
 */
export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const order = await adminOrderService.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

/**
 * Update order status
 * PUT /api/admin/orders/:id/status
 */
export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const orderId = parseInt(req.params.id);
    const { orderStatus } = req.body;

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    if (!orderStatus) {
      return res.status(400).json({ error: 'orderStatus is required' });
    }

    const order = await adminOrderService.updateOrderStatus(orderId, orderStatus);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

/**
 * Get order statistics
 * GET /api/admin/orders/stats
 */
export async function getOrderStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await adminOrderService.getOrderStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order statistics' });
  }
}
