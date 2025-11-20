import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@server/types';
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  idSchema,
} from '@server/utils/validation';
import {
  getUserPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from '@server/db/services/payment.service';

/**
 * Payment Method Controller
 * Handles CRUD operations for user payment methods
 */
export class PaymentController {
  /**
   * Get all payment methods for the authenticated user
   * GET /api/payment-methods
   */
  static async getAllPaymentMethods(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const paymentMethods = await getUserPaymentMethods(userId);

      return res.status(200).json({
        success: true,
        message: 'Payment methods retrieved successfully',
        data: paymentMethods,
      });
    } catch (error) {
      console.error('Get payment methods error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment methods',
      });
    }
  }

  /**
   * Get a single payment method by ID
   * GET /api/payment-methods/:id
   */
  static async getPaymentMethod(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const paymentMethod = await getPaymentMethodById(id, userId);

      if (!paymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment method retrieved successfully',
        data: paymentMethod,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Get payment method error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment method',
      });
    }
  }

  /**
   * Create a new payment method
   * POST /api/payment-methods
   */
  static async createPaymentMethod(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const data = createPaymentMethodSchema.parse(req.body);

      const newPaymentMethod = await createPaymentMethod(userId, data);

      return res.status(201).json({
        success: true,
        message: 'Payment method created successfully',
        data: newPaymentMethod,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Create payment method error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment method',
      });
    }
  }

  /**
   * Update an existing payment method
   * PUT /api/payment-methods/:id
   */
  static async updatePaymentMethod(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });
      const data = updatePaymentMethodSchema.parse(req.body);

      const updatedPaymentMethod = await updatePaymentMethod(id, userId, data);

      if (!updatedPaymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment method updated successfully',
        data: updatedPaymentMethod,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Update payment method error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update payment method',
      });
    }
  }

  /**
   * Delete a payment method
   * DELETE /api/payment-methods/:id
   */
  static async deletePaymentMethod(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const deleted = await deletePaymentMethod(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment method deleted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Delete payment method error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete payment method',
      });
    }
  }

  /**
   * Set a payment method as default
   * PATCH /api/payment-methods/:id/default
   */
  static async setDefaultPaymentMethod(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const updatedPaymentMethod = await setDefaultPaymentMethod(id, userId);

      if (!updatedPaymentMethod) {
        return res.status(404).json({
          success: false,
          message: 'Payment method not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Default payment method set successfully',
        data: updatedPaymentMethod,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Set default payment method error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set default payment method',
      });
    }
  }
}
