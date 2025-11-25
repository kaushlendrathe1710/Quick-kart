import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryService } from '@server/db/services';

/**
 * Seller Delivery Controller
 * Handles delivery creation and assignment operations for sellers
 * Sellers create deliveries after accepting orders and assign them to delivery partners
 */
export class SellerDeliveryController {
  /**
   * Get all deliveries for seller
   * GET /api/seller/deliveries
   */
  static async getSellerDeliveries(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;
      const offset = (page - 1) * limit;

      const { data, total } = await deliveryService.getDeliveriesBySellerId(sellerId, {
        limit,
        offset,
        status,
      });

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: 'Deliveries retrieved successfully',
        data,
        pagination: {
          page,
          limit,
          totalCount: total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    } catch (error) {
      console.error('Get seller deliveries error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve deliveries',
      });
    }
  }

  /**
   * Get delivery by order ID
   * GET /api/seller/delivery/order/:orderId
   */
  static async getDeliveryByOrderId(req: AuthenticatedRequest, res: Response) {
    try {
      const orderId = parseInt(req.params.orderId);

      const delivery = await deliveryService.getDeliveryByOrderId(orderId);

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found for this order',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Delivery retrieved successfully',
        data: delivery,
      });
    } catch (error) {
      console.error('Get delivery by order error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve delivery',
      });
    }
  }

  /**
   * Create delivery for an order
   * POST /api/seller/delivery
   */
  static async createDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { orderId, pickupLocation, dropLocation, buyerId, deliveryFee } = req.body;

      // Check if delivery already exists for this order
      const existingDelivery = await deliveryService.getDeliveryByOrderId(orderId);
      if (existingDelivery) {
        return res.status(400).json({
          success: false,
          message: 'Delivery already exists for this order',
        });
      }

      // Create delivery (initially without delivery partner)
      const newDelivery = await deliveryService.createDelivery({
        orderId,
        deliveryPartnerId: null,
        pickupLocation,
        dropLocation,
        buyerId,
        deliveryFee: deliveryFee.toString(),
        status: 'pending',
        tip: '0.00',
      });

      return res.status(201).json({
        success: true,
        message: 'Delivery created successfully',
        data: newDelivery,
      });
    } catch (error) {
      console.error('Create delivery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create delivery',
      });
    }
  }

  /**
   * Assign delivery to a partner
   * POST /api/seller/delivery/:id/assign
   */
  static async assignDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const id = parseInt(req.params.id);
      const { deliveryPartnerId } = req.body;

      // Get existing delivery
      const existingDelivery = await deliveryService.getDeliveryById(id);
      if (!existingDelivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      if (existingDelivery.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Delivery cannot be assigned in current status',
        });
      }

      // Assign delivery
      const assignedDelivery = await deliveryService.assignDelivery(id, deliveryPartnerId);

      return res.status(200).json({
        success: true,
        message: 'Delivery assigned successfully',
        data: assignedDelivery,
      });
    } catch (error) {
      console.error('Assign delivery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign delivery',
      });
    }
  }

  /**
   * Get delivery by ID (for seller's own orders)
   * GET /api/seller/delivery/:id
   */
  static async getDeliveryById(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const id = parseInt(req.params.id);

      const delivery = await deliveryService.getDeliveryById(id);

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Delivery retrieved successfully',
        data: delivery,
      });
    } catch (error) {
      console.error('Get delivery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve delivery',
      });
    }
  }

  /**
   * Cancel delivery
   * POST /api/seller/delivery/:id/cancel
   */
  static async cancelDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user?.id;
      if (!sellerId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const id = parseInt(req.params.id);
      const { cancellationReason } = req.body;

      // Get existing delivery
      const existingDelivery = await deliveryService.getDeliveryById(id);
      if (!existingDelivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      if (existingDelivery.status === 'delivered' || existingDelivery.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Delivery cannot be cancelled in current status',
        });
      }

      // Cancel delivery
      const cancelledDelivery = await deliveryService.cancelDelivery(id, cancellationReason);

      return res.status(200).json({
        success: true,
        message: 'Delivery cancelled successfully',
        data: cancelledDelivery,
      });
    } catch (error) {
      console.error('Cancel delivery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel delivery',
      });
    }
  }
}
