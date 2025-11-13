import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { deliveryPartnerVehicleService } from '@server/db/services';
import { uploadToS3, deleteFromS3 } from '@server/utils';
import { DELIVERY_PARTNER_S3_CONFIG } from '@server/constants';

/**
 * Delivery Partner Vehicle Controller
 * Handles CRUD operations for delivery partner vehicle information
 */
export class DeliveryPartnerVehicleController {
  /**
   * Get vehicle by ID
   * GET /api/delivery-partner/vehicle/:id
   */
  static async getVehicleById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const vehicle = await deliveryPartnerVehicleService.getVehicleById(id);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle retrieved successfully',
        data: vehicle,
      });
    } catch (error) {
      console.error('Get vehicle error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve vehicle',
      });
    }
  }

  /**
   * Get vehicle by delivery partner (current user)
   * GET /api/delivery-partner/vehicle
   */
  static async getMyVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const vehicle = await deliveryPartnerVehicleService.getVehicleByPartnerId(userId);

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle retrieved successfully',
        data: vehicle,
      });
    } catch (error) {
      console.error('Get my vehicle error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve vehicle',
      });
    }
  }

  /**
   * Create vehicle
   * POST /api/delivery-partner/vehicle
   */
  static async createVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check if vehicle already exists
      const existingVehicle = await deliveryPartnerVehicleService.vehicleExists(userId);
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle already exists. Use update endpoint to modify.',
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const { vehicleType, brand, model, registrationNumber, color, year, fuelType } = req.body;

      // Check if registration number is already in use
      const existingReg =
        await deliveryPartnerVehicleService.getVehicleByRegistration(registrationNumber);
      if (existingReg) {
        return res.status(400).json({
          success: false,
          message: 'Registration number already exists',
        });
      }

      // Upload files to S3
      const documentUrls: any = {};

      if (files?.insuranceCertificate?.[0]) {
        documentUrls.insuranceCertificate = await uploadToS3(
          files.insuranceCertificate[0],
          DELIVERY_PARTNER_S3_CONFIG.VEHICLE_FOLDER,
          userId
        );
      }
      if (files?.pucCertificate?.[0]) {
        documentUrls.pucCertificate = await uploadToS3(
          files.pucCertificate[0],
          DELIVERY_PARTNER_S3_CONFIG.VEHICLE_FOLDER,
          userId
        );
      }

      // Create vehicle record
      const newVehicle = await deliveryPartnerVehicleService.createVehicle({
        deliveryPartnerId: userId,
        vehicleType,
        brand,
        model,
        registrationNumber,
        color,
        year: year ? parseInt(year) : undefined,
        fuelType,
        ...documentUrls,
      });

      return res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: newVehicle,
      });
    } catch (error) {
      console.error('Create vehicle error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create vehicle',
      });
    }
  }

  /**
   * Update vehicle
   * PATCH /api/delivery-partner/vehicle/:id
   */
  static async updateVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing vehicle
      const existingVehicle = await deliveryPartnerVehicleService.getVehicleById(id);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      // Check ownership
      if (existingVehicle.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this vehicle',
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const { vehicleType, brand, model, registrationNumber, color, year, fuelType } = req.body;

      // Check if new registration number is already in use by another vehicle
      if (registrationNumber && registrationNumber !== existingVehicle.registrationNumber) {
        const existingReg =
          await deliveryPartnerVehicleService.getVehicleByRegistration(registrationNumber);
        if (existingReg) {
          return res.status(400).json({
            success: false,
            message: 'Registration number already exists',
          });
        }
      }

      const updateData: any = {};

      // Update basic fields
      if (vehicleType) updateData.vehicleType = vehicleType;
      if (brand) updateData.brand = brand;
      if (model) updateData.model = model;
      if (registrationNumber) updateData.registrationNumber = registrationNumber;
      if (color) updateData.color = color;
      if (year) updateData.year = parseInt(year);
      if (fuelType) updateData.fuelType = fuelType;

      // Update insurance certificate if new file provided
      if (files?.insuranceCertificate?.[0]) {
        if (existingVehicle.insuranceCertificate) {
          await deleteFromS3(existingVehicle.insuranceCertificate);
        }
        updateData.insuranceCertificate = await uploadToS3(
          files.insuranceCertificate[0],
          DELIVERY_PARTNER_S3_CONFIG.VEHICLE_FOLDER,
          userId
        );
      }

      // Update PUC certificate if new file provided
      if (files?.pucCertificate?.[0]) {
        if (existingVehicle.pucCertificate) {
          await deleteFromS3(existingVehicle.pucCertificate);
        }
        updateData.pucCertificate = await uploadToS3(
          files.pucCertificate[0],
          DELIVERY_PARTNER_S3_CONFIG.VEHICLE_FOLDER,
          userId
        );
      }

      // Update vehicle
      const updatedVehicle = await deliveryPartnerVehicleService.updateVehicle(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        data: updatedVehicle,
      });
    } catch (error) {
      console.error('Update vehicle error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update vehicle',
      });
    }
  }

  /**
   * Delete vehicle
   * DELETE /api/delivery-partner/vehicle/:id
   */
  static async deleteVehicle(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing vehicle
      const existingVehicle = await deliveryPartnerVehicleService.getVehicleById(id);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found',
        });
      }

      // Check ownership
      if (existingVehicle.deliveryPartnerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this vehicle',
        });
      }

      // Delete files from S3
      const filesToDelete = [
        existingVehicle.insuranceCertificate,
        existingVehicle.pucCertificate,
      ].filter(Boolean) as string[];

      for (const fileUrl of filesToDelete) {
        try {
          await deleteFromS3(fileUrl);
        } catch (error) {
          console.error(`Failed to delete file: ${fileUrl}`, error);
        }
      }

      // Delete vehicle record
      await deliveryPartnerVehicleService.deleteVehicle(id);

      return res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully',
      });
    } catch (error) {
      console.error('Delete vehicle error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete vehicle',
      });
    }
  }
}
