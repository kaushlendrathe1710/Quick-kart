import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { extractToken } from '../utils/jwt';
import { userService } from '@server/db/services/user.service';
import { AuthenticatedRequest } from '../types';
import { userRole } from '@shared/constants';

// For JWT authentication
const JWT_SECRET = process.env.JWT_SECRET;

// Auth middleware that checks either session or JWT token
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // First check if user is authenticated via session
  if (req.session?.userId) {
    const user = await userService.getUserById(req.session?.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved || false,
    };
    return next();
  }

  // If not, check for JWT token
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number };
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved || false,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin authentication middleware
export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // First ensure the user is authenticated (this now attaches user to req)
  authenticate(req, res, async () => {
    // Get the user from req.user (set by authenticate middleware)
    const user = req.user;

    if (!user || user.role !== userRole.ADMIN) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  });
};

export const isSeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // First ensure the user is authenticated (this now attaches user to req)
  authenticate(req, res, async () => {
    // Get the user from req.user (set by authenticate middleware)
    const user = req.user;

    if (!user || user.role !== userRole.SELLER) {
      return res.status(403).json({ message: 'Seller access required' });
    }

    next();
  });
};

export const isDeliveryPartner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // First ensure the user is authenticated (this now attaches user to req)
  authenticate(req, res, async () => {
    // Get the user from req.user (set by authenticate middleware)
    const user = req.user;

    if (!user || user.role !== userRole.DELIVERY_PARTNER) {
      return res.status(403).json({ message: 'Delivery partner access required' });
    }

    next();
  });
};

export const tryAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try session
    if (req.session?.userId) {
      const user = await userService.getUserById(req.session?.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved || false,
        };
        return next();
      }
    }

    // Try JWT
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET!) as { userId: number };
      const user = await userService.getUserById(decoded.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved || false,
        };
      }
    }

    // Even if user is not found, allow to proceed
    next();
  } catch (err) {
    // Don't block user; just continue unauthenticated
    next();
  }
};
