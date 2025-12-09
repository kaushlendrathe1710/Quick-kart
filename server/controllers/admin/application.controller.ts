import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { db } from '@server/db/connect';
import {
  sellerApplications,
  deliveryPartnerApplications,
  users,
  sellerDocuments,
  deliveryPartnerDocuments,
} from '@server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Admin Application Management Controller
 * Handles approval/rejection of seller and delivery partner applications
 */

/**
 * Get all seller applications
 * GET /api/admin/applications/sellers
 */
export async function getAllSellerApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const applications = await db.query.sellerApplications.findMany({
      orderBy: (sellerApplications, { desc }) => [desc(sellerApplications.createdAt)],
    });

    // Fetch documents for each application
    const applicationsWithDocuments = await Promise.all(
      applications.map(async (app) => {
        const documents = await db.query.sellerDocuments.findMany({
          where: eq(sellerDocuments.sellerId, app.userId),
        });

        return {
          ...app,
          documents: documents || [],
        };
      })
    );

    res.json({
      success: true,
      data: applicationsWithDocuments,
    });
  } catch (error) {
    console.error('Error fetching seller applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

/**
 * Get all delivery partner applications
 * GET /api/admin/applications/delivery-partners
 */
export async function getAllDeliveryPartnerApplications(req: AuthenticatedRequest, res: Response) {
  try {
    const applications = await db.query.deliveryPartnerApplications.findMany({
      orderBy: (deliveryPartnerApplications, { desc }) => [
        desc(deliveryPartnerApplications.createdAt),
      ],
    });

    // Fetch documents for each application
    const applicationsWithDocuments = await Promise.all(
      applications.map(async (app) => {
        const documents = await db.query.deliveryPartnerDocuments.findFirst({
          where: eq(deliveryPartnerDocuments.deliveryPartnerId, app.userId),
        });

        return {
          ...app,
          documents: documents || null,
        };
      })
    );

    res.json({
      success: true,
      data: applicationsWithDocuments,
    });
  } catch (error) {
    console.error('Error fetching delivery partner applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

/**
 * Approve seller application
 * POST /api/admin/applications/sellers/:id/approve
 */
export async function approveSellerApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const applicationId = parseInt(req.params.id);
    const adminId = req.user!.id;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    // Get application
    const application = await db.query.sellerApplications.findFirst({
      where: eq(sellerApplications.id, applicationId),
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application has already been processed' });
    }

    // Update application status
    await db
      .update(sellerApplications)
      .set({
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(sellerApplications.id, applicationId));

    // Update user's isApproved status
    await db
      .update(users)
      .set({
        isApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, application.userId));

    res.json({
      success: true,
      message: 'Seller application approved successfully',
    });
  } catch (error) {
    console.error('Error approving seller application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
}

/**
 * Reject seller application
 * POST /api/admin/applications/sellers/:id/reject
 */
export async function rejectSellerApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const applicationId = parseInt(req.params.id);
    const adminId = req.user!.id;
    const { adminNotes } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    if (!adminNotes || !adminNotes.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Get application
    const application = await db.query.sellerApplications.findFirst({
      where: eq(sellerApplications.id, applicationId),
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application has already been processed' });
    }

    // Update application status
    await db
      .update(sellerApplications)
      .set({
        status: 'rejected',
        adminNotes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(sellerApplications.id, applicationId));

    // Update user's rejected status
    await db
      .update(users)
      .set({
        rejected: true,
        rejectionReason: adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, application.userId));

    res.json({
      success: true,
      message: 'Seller application rejected',
    });
  } catch (error) {
    console.error('Error rejecting seller application:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
}

/**
 * Approve delivery partner application
 * POST /api/admin/applications/delivery-partners/:id/approve
 */
export async function approveDeliveryPartnerApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const applicationId = parseInt(req.params.id);
    const adminId = req.user!.id;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    // Get application
    const application = await db.query.deliveryPartnerApplications.findFirst({
      where: eq(deliveryPartnerApplications.id, applicationId),
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application has already been processed' });
    }

    // Update application status
    await db
      .update(deliveryPartnerApplications)
      .set({
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(deliveryPartnerApplications.id, applicationId));

    // Update user's isApproved status
    await db
      .update(users)
      .set({
        isApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, application.userId));

    res.json({
      success: true,
      message: 'Delivery partner application approved successfully',
    });
  } catch (error) {
    console.error('Error approving delivery partner application:', error);
    res.status(500).json({ error: 'Failed to approve application' });
  }
}

/**
 * Reject delivery partner application
 * POST /api/admin/applications/delivery-partners/:id/reject
 */
export async function rejectDeliveryPartnerApplication(req: AuthenticatedRequest, res: Response) {
  try {
    const applicationId = parseInt(req.params.id);
    const adminId = req.user!.id;
    const { adminNotes } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    if (!adminNotes || !adminNotes.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    // Get application
    const application = await db.query.deliveryPartnerApplications.findFirst({
      where: eq(deliveryPartnerApplications.id, applicationId),
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application has already been processed' });
    }

    // Update application status
    await db
      .update(deliveryPartnerApplications)
      .set({
        status: 'rejected',
        adminNotes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(deliveryPartnerApplications.id, applicationId));

    // Update user's rejected status
    await db
      .update(users)
      .set({
        rejected: true,
        rejectionReason: adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, application.userId));

    res.json({
      success: true,
      message: 'Delivery partner application rejected',
    });
  } catch (error) {
    console.error('Error rejecting delivery partner application:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
}
