import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { sellerTicketService } from '@server/db/services';

/**
 * Seller Ticket Controller
 * Handles support ticket operations for sellers
 */
export class SellerTicketController {
  /**
   * Get ticket by ID (own tickets only)
   * GET /api/seller/ticket/:id
   */
  static async getTicketById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const ticket = await sellerTicketService.getSellerTicketById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Check if seller owns this ticket
      if (ticket.sellerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to view this ticket',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ticket retrieved successfully',
        data: ticket,
      });
    } catch (error) {
      console.error('Get ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve ticket',
      });
    }
  }

  /**
   * Get all tickets for current seller
   * GET /api/seller/ticket
   */
  static async getMyTickets(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string | undefined;

      const tickets = await sellerTicketService.getTicketsBySellerId(userId, {
        limit,
        offset,
        status,
      });

      return res.status(200).json({
        success: true,
        message: 'Tickets retrieved successfully',
        data: tickets,
      });
    } catch (error) {
      console.error('Get my tickets error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve tickets',
      });
    }
  }

  /**
   * Create a new support ticket
   * POST /api/seller/ticket
   */
  static async createTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const { issueType, subject, description } = req.body;

      // Create ticket
      const newTicket = await sellerTicketService.createSellerTicket({
        sellerId: userId,
        issueType,
        subject,
        description,
        status: 'open',
      });

      return res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: newTicket,
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create ticket',
      });
    }
  }
}
