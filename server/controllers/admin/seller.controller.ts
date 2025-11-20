import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as adminSellerService from '../../db/services/adminSeller.service';

/**
 * Get all sellers
 * GET /api/admin/sellers
 */
export async function getSellers(req: AuthenticatedRequest, res: Response) {
  try {
    const sellers = await adminSellerService.getSellers();
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
}

/**
 * Approve a seller
 * POST /api/admin/sellers/:id/approve
 */
export async function approveSeller(req: AuthenticatedRequest, res: Response) {
  try {
    const sellerId = parseInt(req.params.id);

    if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const seller = await adminSellerService.approveSeller(sellerId);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({
      success: true,
      message: 'Seller approved successfully',
      seller,
    });
  } catch (error) {
    console.error('Error approving seller:', error);
    res.status(500).json({ error: 'Failed to approve seller' });
  }
}

/**
 * Reject a seller
 * POST /api/admin/sellers/:id/reject
 */
export async function rejectSeller(req: AuthenticatedRequest, res: Response) {
  try {
    const sellerId = parseInt(req.params.id);

    if (isNaN(sellerId)) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    const seller = await adminSellerService.rejectSeller(sellerId);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({
      success: true,
      message: 'Seller rejected successfully',
      seller,
    });
  } catch (error) {
    console.error('Error rejecting seller:', error);
    res.status(500).json({ error: 'Failed to reject seller' });
  }
}

/**
 * Get all seller applications
 * GET /api/admin/seller-applications
 */
export async function getSellerApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.query;
    const applications = await adminSellerService.getSellerApplications(status as string);
    res.json(applications);
  } catch (error) {
    console.error('Error fetching seller applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

/**
 * Approve seller application
 * PUT /api/admin/seller-applications/:id/approve
 */
export async function approveApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const applicationId = parseInt(req.params.id);
    const { adminNotes } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await adminSellerService.approveApplication(
      applicationId,
      req.user.id,
      adminNotes
    );

    res.json({
      success: true,
      message: 'Application approved successfully',
      application: result.application,
      user: result.user,
    });
  } catch (error) {
    console.error('Error approving application:', error);
    if (error instanceof Error && error.message === 'Application not found') {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(500).json({ error: 'Failed to approve application' });
  }
}

/**
 * Reject seller application
 * PUT /api/admin/seller-applications/:id/reject
 */
export async function rejectApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const applicationId = parseInt(req.params.id);
    const { adminNotes } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const application = await adminSellerService.rejectApplication(
      applicationId,
      req.user.id,
      adminNotes
    );

    res.json({
      success: true,
      message: 'Application rejected',
      application,
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    if (error instanceof Error && error.message === 'Application not found') {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.status(500).json({ error: 'Failed to reject application' });
  }
}

/**
 * Get application statistics
 * GET /api/admin/seller-applications/stats
 */
export async function getApplicationStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await adminSellerService.getApplicationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

/**
 * Get all seller withdrawals
 * GET /api/admin/seller-withdrawals
 */
export async function getSellerWithdrawals(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, sellerId } = req.query;
    const withdrawals = await adminSellerService.getSellerWithdrawalsForAdmin({
      status: status as string,
      sellerId: sellerId ? parseInt(sellerId as string) : undefined,
    });
    res.json(withdrawals);
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
}

/**
 * Update withdrawal status
 * PUT /api/admin/seller-withdrawals/:id/status
 */
export async function updateWithdrawalStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const withdrawalId = parseInt(req.params.id);
    const { status, adminNotes, referenceId } = req.body;

    if (isNaN(withdrawalId)) {
      return res.status(400).json({ error: 'Invalid withdrawal ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const withdrawal = await adminSellerService.updateWithdrawalStatus(
      withdrawalId,
      status,
      req.user.id,
      adminNotes,
      referenceId
    );

    res.json({
      success: true,
      message: 'Withdrawal status updated successfully',
      withdrawal,
    });
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    if (error instanceof Error && error.message === 'Withdrawal not found') {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    res.status(500).json({ error: 'Failed to update withdrawal status' });
  }
}

/**
 * Update withdrawal details
 * PUT /api/admin/seller-withdrawals/:id
 */
export async function updateWithdrawal(req: AuthenticatedRequest, res: Response) {
  try {
    const withdrawalId = parseInt(req.params.id);

    if (isNaN(withdrawalId)) {
      return res.status(400).json({ error: 'Invalid withdrawal ID' });
    }

    const { amount, paymentMethod, accountDetails, referenceId, status, adminNotes } = req.body;

    const withdrawal = await adminSellerService.updateWithdrawal(withdrawalId, {
      amount,
      paymentMethod,
      accountDetails,
      referenceId,
      status,
      adminNotes,
    });

    res.json({
      success: true,
      message: 'Withdrawal updated successfully',
      withdrawal,
    });
  } catch (error) {
    console.error('Error updating withdrawal:', error);
    if (error instanceof Error && error.message === 'Withdrawal not found') {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    res.status(500).json({ error: 'Failed to update withdrawal' });
  }
}
