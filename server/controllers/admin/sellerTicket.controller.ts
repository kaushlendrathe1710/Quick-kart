import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { sellerTicketService } from '@server/db/services';

/**
 * Admin Seller Ticket Controller
 * Handles admin operations for seller support tickets
 */
export class AdminSellerTicketController {
  /**
   * Get all seller tickets (Admin only)
   * GET /api/admin/seller-ticket
   */
  static async getAllSellerTickets(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string | undefined;
      const issueType = req.query.issueType as string | undefined;

      const tickets = await sellerTicketService.getAllSellerTickets({
        limit,
        offset,
        status,
        issueType,
      });

      return res.status(200).json({
        success: true,
        message: 'Seller tickets retrieved successfully',
        data: tickets,
      });
    } catch (error) {
      console.error('Get all seller tickets error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve seller tickets',
      });
    }
  }

  /**
   * Get open seller tickets (Admin only)
   * GET /api/admin/seller-ticket/open
   */
  static async getOpenSellerTickets(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const tickets = await sellerTicketService.getOpenSellerTickets({ limit, offset });

      return res.status(200).json({
        success: true,
        message: 'Open seller tickets retrieved successfully',
        data: tickets,
      });
    } catch (error) {
      console.error('Get open seller tickets error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve open seller tickets',
      });
    }
  }

  /**
   * Get seller ticket by ID (Admin can view any ticket)
   * GET /api/admin/seller-ticket/:id
   */
  static async getSellerTicketById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const ticket = await sellerTicketService.getSellerTicketById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Seller ticket not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Seller ticket retrieved successfully',
        data: ticket,
      });
    } catch (error) {
      console.error('Get seller ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve seller ticket',
      });
    }
  }

  /**
   * Update seller ticket (Admin only)
   * PATCH /api/admin/seller-ticket/:id
   */
  static async updateSellerTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Get existing ticket
      const existingTicket = await sellerTicketService.getSellerTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Seller ticket not found',
        });
      }

      const updates = req.body;

      // Update ticket
      const updatedTicket = await sellerTicketService.updateSellerTicket(id, updates);

      return res.status(200).json({
        success: true,
        message: 'Seller ticket updated successfully',
        data: updatedTicket,
      });
    } catch (error) {
      console.error('Update seller ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update seller ticket',
      });
    }
  }

  /**
   * Add admin response to seller ticket
   * POST /api/admin/seller-ticket/:id/response
   */
  static async addAdminResponse(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Get existing ticket
      const existingTicket = await sellerTicketService.getSellerTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Seller ticket not found',
        });
      }

      const { adminResponse, status } = req.body;

      // Add admin response
      const updatedTicket = await sellerTicketService.addAdminResponseToSellerTicket(
        id,
        userId,
        adminResponse,
        status || 'in_progress'
      );

      return res.status(200).json({
        success: true,
        message: 'Admin response added successfully',
        data: updatedTicket,
      });
    } catch (error) {
      console.error('Add admin response error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add admin response',
      });
    }
  }

  /**
   * Resolve seller ticket
   * POST /api/admin/seller-ticket/:id/resolve
   */
  static async resolveSellerTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { adminResponse } = req.body;

      // Get existing ticket
      const existingTicket = await sellerTicketService.getSellerTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Seller ticket not found',
        });
      }

      // Resolve ticket
      const resolvedTicket = await sellerTicketService.resolveSellerTicket(id, adminResponse);

      return res.status(200).json({
        success: true,
        message: 'Seller ticket resolved successfully',
        data: resolvedTicket,
      });
    } catch (error) {
      console.error('Resolve seller ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to resolve seller ticket',
      });
    }
  }

  /**
   * Close seller ticket
   * POST /api/admin/seller-ticket/:id/close
   */
  static async closeSellerTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Get existing ticket
      const existingTicket = await sellerTicketService.getSellerTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Seller ticket not found',
        });
      }

      // Close ticket
      const closedTicket = await sellerTicketService.closeSellerTicket(id);

      return res.status(200).json({
        success: true,
        message: 'Seller ticket closed successfully',
        data: closedTicket,
      });
    } catch (error) {
      console.error('Close seller ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to close seller ticket',
      });
    }
  }

  /**
   * Delete seller ticket
   * DELETE /api/admin/seller-ticket/:id
   */
  static async deleteSellerTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Get existing ticket
      const existingTicket = await sellerTicketService.getSellerTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Seller ticket not found',
        });
      }

      // Delete ticket
      await sellerTicketService.deleteSellerTicket(id);

      return res.status(200).json({
        success: true,
        message: 'Seller ticket deleted successfully',
      });
    } catch (error) {
      console.error('Delete seller ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete seller ticket',
      });
    }
  }
}
