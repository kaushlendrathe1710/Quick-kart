import type { Response } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '@server/types';
import { createAddressSchema, updateAddressSchema, idSchema } from '@server/utils/validation';
import {
  getUserAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@server/db/services/address.service';

/**
 * Address Controller
 * Handles CRUD operations for user addresses
 */
export class AddressController {
  /**
   * Get all addresses for the authenticated user
   * GET /api/addresses
   */
  static async getAllAddresses(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const addresses = await getUserAddresses(userId);

      return res.status(200).json({
        success: true,
        message: 'Addresses retrieved successfully',
        data: addresses,
      });
    } catch (error) {
      console.error('Get addresses error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve addresses',
      });
    }
  }

  /**
   * Get a single address by ID
   * GET /api/addresses/:id
   */
  static async getAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const address = await getAddressById(id, userId);

      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Address retrieved successfully',
        data: address,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Get address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve address',
      });
    }
  }

  /**
   * Create a new address
   * POST /api/addresses
   */
  static async createAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const data = createAddressSchema.parse(req.body);
      console.log("Creating address with data:", data);

      const newAddress = await createAddress(userId, data);

      return res.status(201).json({
        success: true,
        message: 'Address created successfully',
        data: newAddress,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Create address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create address',
      });
    }
  }

  /**
   * Update an existing address
   * PUT /api/addresses/:id
   */
  static async updateAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });
      const data = updateAddressSchema.parse(req.body);

      const updatedAddress = await updateAddress(id, userId, data);

      if (!updatedAddress) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        data: updatedAddress,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Update address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update address',
      });
    }
  }

  /**
   * Delete an address
   * DELETE /api/addresses/:id
   */
  static async deleteAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const deleted = await deleteAddress(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Delete address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete address',
      });
    }
  }

  /**
   * Set an address as default
   * PATCH /api/addresses/:id/default
   */
  static async setDefaultAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { id } = idSchema.parse({ id: req.params.id });

      const updatedAddress = await setDefaultAddress(id, userId);

      if (!updatedAddress) {
        return res.status(404).json({
          success: false,
          message: 'Address not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Default address set successfully',
        data: updatedAddress,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Set default address error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set default address',
      });
    }
  }
}
