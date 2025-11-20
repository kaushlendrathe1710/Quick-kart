import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryService } from '@server/db/services';

/**
 * Admin Delivery Controller
 * Handles delivery management operations for administrators
 * Note: Sellers create deliveries after accepting orders and assign them to delivery partners
 */
export class AdminDeliveryController {
  /**
   * Get all deliveries by status
   * GET /api/admin/delivery/by-status/:status
   */
  static async getDeliveriesByStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const status = req.params.status;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const deliveries = await deliveryService.getDeliveriesByStatus(status, { limit, offset });

      return res.status(200).json({
        success: true,
        message: 'Deliveries retrieved successfully',
        data: deliveries,
      });
    } catch (error) {
      console.error('Get deliveries by status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve deliveries',
      });
    }
  }

  /**
   * Get delivery by ID
   * GET /api/admin/delivery/:id
   */
  static async getDeliveryById(req: AuthenticatedRequest, res: Response) {
    try {
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
   * Create delivery
   * POST /api/admin/delivery
   */
  static async createDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        orderId,
        deliveryPartnerId,
        pickupLocation,
        dropLocation,
        buyerId,
        deliveryFee,
        status,
      } = req.body;

      // Check if delivery already exists for this order
      const existingDelivery = await deliveryService.getDeliveryByOrderId(orderId);
      if (existingDelivery) {
        return res.status(400).json({
          success: false,
          message: 'Delivery already exists for this order',
        });
      }

      // Create delivery
      const newDelivery = await deliveryService.createDelivery({
        orderId,
        deliveryPartnerId,
        pickupLocation,
        dropLocation,
        buyerId,
        deliveryFee: deliveryFee.toString(),
        status: status || 'pending',
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
   * Update delivery
   * PATCH /api/admin/delivery/:id
   */
  static async updateDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { deliveryPartnerId, status, tip, cancellationReason } = req.body;

      // Get existing delivery
      const existingDelivery = await deliveryService.getDeliveryById(id);
      if (!existingDelivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      const updateData: any = {};

      if (deliveryPartnerId) updateData.deliveryPartnerId = deliveryPartnerId;
      if (status) updateData.status = status;
      if (tip !== undefined) updateData.tip = tip.toString();
      if (cancellationReason) updateData.cancellationReason = cancellationReason;

      // Update timestamps based on status
      if (status === 'picked_up') {
        updateData.pickedUpAt = new Date();
      } else if (status === 'delivered') {
        updateData.deliveredAt = new Date();
      } else if (status === 'assigned' && !existingDelivery.assignedAt) {
        updateData.assignedAt = new Date();
      }

      // Update delivery
      const updatedDelivery = await deliveryService.updateDelivery(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Delivery updated successfully',
        data: updatedDelivery,
      });
    } catch (error) {
      console.error('Update delivery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update delivery',
      });
    }
  }

  /**
   * Assign delivery to partner
   * POST /api/admin/delivery/:id/assign
   */
  static async assignDelivery(req: AuthenticatedRequest, res: Response) {
    try {
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
   * Cancel delivery
   * POST /api/admin/delivery/:id/cancel
   */
  static async cancelDelivery(req: AuthenticatedRequest, res: Response) {
    try {
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

  /**
   * Delete delivery
   * DELETE /api/admin/delivery/:id
   */
  static async deleteDelivery(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Get existing delivery
      const existingDelivery = await deliveryService.getDeliveryById(id);
      if (!existingDelivery) {
        return res.status(404).json({
          success: false,
          message: 'Delivery not found',
        });
      }

      // Delete delivery
      await deliveryService.deleteDelivery(id);

      return res.status(200).json({
        success: true,
        message: 'Delivery deleted successfully',
      });
    } catch (error) {
      console.error('Delete delivery error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete delivery',
      });
    }
  }
}
