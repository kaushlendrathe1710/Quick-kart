import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { userRole } from '@shared/constants';

/**
 * Check if delivery partner is approved
 * Used to prevent unapproved delivery partners from accessing certain features
 */
export const requireDeliveryPartnerApproval = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Only applies to delivery partners
    if (user.role !== userRole.DELIVERY_PARTNER) {
      return next();
    }

    // Check if delivery partner is approved
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          'Your delivery partner account is pending approval. Please wait for admin approval.',
        code: 'DELIVERY_PARTNER_NOT_APPROVED',
        isApproved: false,
      });
    }

    next();
  } catch (error) {
    console.error('Error checking delivery partner approval:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking delivery partner approval status',
    });
  }
};

/**
 * Allow access to both approved delivery partners and those checking their status
 * Use this for endpoints that delivery partners need to access even before approval
 */
export const optionalDeliveryPartnerApproval = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Just pass through - endpoint can check approval status as needed
  next();
};
