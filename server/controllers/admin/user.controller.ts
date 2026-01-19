import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as adminUserService from '../../db/services/adminUser.service';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.utils';

/**
 * Get all users with pagination
 * GET /api/admin/users?page=1&limit=20&role=buyer&search=john
 */
export async function getAllUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const { role, isApproved, search } = req.query;
    const { page, limit, offset } = getPaginationParams(req);

    const filters = {
      role: role as string,
      isApproved: isApproved === 'true' ? true : isApproved === 'false' ? false : undefined,
      search: search as string,
      limit,
      offset,
    };

    const result = await adminUserService.getAllUsers(filters);

    // If service returns paginated data, use it directly
    if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
      res.json(createPaginatedResponse(result.data, page, limit, result.total));
    } else {
      // Fallback for non-paginated service response
      res.json(result);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

/**
 * Get user statistics
 * GET /api/admin/users/stats
 */
export async function getUserStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await adminUserService.getUserStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
}

/**
 * Get single user by ID
 * GET /api/admin/users/:id
 */
export async function getUserById(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await adminUserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

/**
 * Update user details
 * PUT /api/admin/users/:id
 */
export async function updateUser(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    const { name, email, contactNumber, role, isApproved } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
    if (role !== undefined) updateData.role = role;
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    updateData.updatedAt = new Date();

    const user = await adminUserService.updateUserDetails(userId, updateData);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
export async function updateUserRole(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!role || !['buyer', 'seller', 'deliveryPartner', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await adminUserService.updateUserRole(userId, role);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
}

/**
 * Soft delete user
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Prevent deleting self
    if (userId === req.user?.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await adminUserService.softDeleteUser(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      user,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

/**
 * Recover deleted user
 * POST /api/admin/users/:id/recover
 */
export async function recoverUser(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await adminUserService.recoverUser(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User recovered successfully',
      user,
    });
  } catch (error) {
    console.error('Error recovering user:', error);
    res.status(500).json({ error: 'Failed to recover user' });
  }
}
