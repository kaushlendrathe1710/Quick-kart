import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import * as adminDeliveryPartnerService from '../../db/services/adminDeliveryPartner.service';
import { getPaginationParams, createPaginatedResponse } from '../../utils/pagination.utils';

/**
 * Get all delivery partners with pagination
 * GET /api/admin/delivery-partners?page=1&limit=20
 */
export async function getDeliveryPartners(req: AuthenticatedRequest, res: Response) {
  try {
    const { page, limit, offset } = getPaginationParams(req);

    const result = await adminDeliveryPartnerService.getDeliveryPartners(limit, offset);

    res.json(createPaginatedResponse(result.data, page, limit, result.total));
  } catch (error) {
    console.error('Error fetching delivery partners:', error);
    res.status(500).json({ error: 'Failed to fetch delivery partners' });
  }
}

/**
 * Approve a delivery partner
 * POST /api/admin/delivery-partners/:id/approve
 */
export async function approveDeliveryPartner(req: AuthenticatedRequest, res: Response) {
  try {
    const deliveryPartnerId = parseInt(req.params.id);
    const { rejectionReason } = req.body;

    if (isNaN(deliveryPartnerId)) {
      return res.status(400).json({ error: 'Invalid delivery partner ID' });
    }

    const deliveryPartner =
      await adminDeliveryPartnerService.approveDeliveryPartner(deliveryPartnerId);

    if (!deliveryPartner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }

    res.json({
      success: true,
      message: 'Delivery partner approved successfully',
      deliveryPartner,
    });
  } catch (error) {
    console.error('Error approving delivery partner:', error);
    res.status(500).json({ error: 'Failed to approve delivery partner' });
  }
}

/**
 * Reject a delivery partner
 * POST /api/admin/delivery-partners/:id/reject
 */
export async function rejectDeliveryPartner(req: AuthenticatedRequest, res: Response) {
  try {
    const deliveryPartnerId = parseInt(req.params.id);
    const { rejectionReason } = req.body;

    if (isNaN(deliveryPartnerId)) {
      return res.status(400).json({ error: 'Invalid delivery partner ID' });
    }

    const deliveryPartner = await adminDeliveryPartnerService.rejectDeliveryPartner(
      deliveryPartnerId,
      rejectionReason
    );

    if (!deliveryPartner) {
      return res.status(404).json({ error: 'Delivery partner not found' });
    }

    res.json({
      success: true,
      message: 'Delivery partner rejected successfully',
      deliveryPartner,
    });
  } catch (error) {
    console.error('Error rejecting delivery partner:', error);
    res.status(500).json({ error: 'Failed to reject delivery partner' });
  }
}

/**
 * Get all delivery partner applications
 * GET /api/admin/delivery-partner-applications
 */
export async function getDeliveryPartnerApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const { status } = req.query;
    const applications = await adminDeliveryPartnerService.getDeliveryPartnerApplications(
      status as string
    );
    res.json(applications);
  } catch (error) {
    console.error('Error fetching delivery partner applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

/**
 * Approve delivery partner application
 * PUT /api/admin/delivery-partner-applications/:id/approve
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

    const result = await adminDeliveryPartnerService.approveDeliveryPartnerApplication(
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
 * Reject delivery partner application
 * PUT /api/admin/delivery-partner-applications/:id/reject
 */
export async function rejectApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const applicationId = parseInt(req.params.id);
    const { adminNotes, rejectionReason } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await adminDeliveryPartnerService.rejectDeliveryPartnerApplication(
      applicationId,
      req.user.id,
      adminNotes,
      rejectionReason
    );

    res.json({
      success: true,
      message: 'Application rejected',
      application: result.application,
      user: result.user,
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
 * GET /api/admin/delivery-partner-applications/stats
 */
export async function getApplicationStats(req: AuthenticatedRequest, res: Response) {
  try {
    const stats = await adminDeliveryPartnerService.getDeliveryPartnerApplicationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}
