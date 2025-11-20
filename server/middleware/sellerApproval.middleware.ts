import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { userRole } from '@shared/constants';

/**
 * Check if seller is approved
 * Used to prevent unapproved sellers from accessing certain features
 */
export const requireSellerApproval = async (
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

    // Only applies to sellers
    if (user.role !== userRole.SELLER) {
      return next();
    }

    // Check if seller is approved
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your seller account is pending approval. Please wait for admin approval.',
        code: 'SELLER_NOT_APPROVED',
        isApproved: false,
      });
    }

    next();
  } catch (error) {
    console.error('Error checking seller approval:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking seller approval status',
    });
  }
};

/**
 * Allow access to both approved sellers and sellers checking their status
 * Use this for endpoints that sellers need to access even before approval
 */
export const optionalSellerApproval = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Just pass through - endpoint can check approval status as needed
  next();
};
