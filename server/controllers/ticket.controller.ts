import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { ticketService } from '@server/db/services';

/**
 * Ticket Controller
 * Handles support ticket operations for delivery partners
 */
export class TicketController {
  /**
   * Get ticket by ID
   * GET /api/delivery-partner/ticket/:id
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

      const ticket = await ticketService.getTicketById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Check if user owns this ticket (or is admin)
      if (ticket.deliveryPartnerId !== userId && req.user?.role !== 'admin') {
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
   * Get tickets for current delivery partner
   * GET /api/delivery-partner/ticket
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

      const tickets = await ticketService.getTicketsByPartnerId(userId, { limit, offset, status });

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
   * Get all tickets (Admin only)
   * GET /api/delivery-partner/ticket/all
   */
  static async getAllTickets(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const status = req.query.status as string | undefined;
      const issueType = req.query.issueType as string | undefined;

      const tickets = await ticketService.getAllTickets({ limit, offset, status, issueType });

      return res.status(200).json({
        success: true,
        message: 'Tickets retrieved successfully',
        data: tickets,
      });
    } catch (error) {
      console.error('Get all tickets error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve tickets',
      });
    }
  }

  /**
   * Get open tickets (Admin only)
   * GET /api/delivery-partner/ticket/open
   */
  static async getOpenTickets(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const tickets = await ticketService.getOpenTickets({ limit, offset });

      return res.status(200).json({
        success: true,
        message: 'Open tickets retrieved successfully',
        data: tickets,
      });
    } catch (error) {
      console.error('Get open tickets error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve open tickets',
      });
    }
  }

  /**
   * Create ticket
   * POST /api/delivery-partner/ticket
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
      const newTicket = await ticketService.createTicket({
        deliveryPartnerId: userId,
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

  /**
   * Update ticket
   * PATCH /api/delivery-partner/ticket/:id
   */
  static async updateTicket(req: AuthenticatedRequest, res: Response) {
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
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Check if user owns this ticket (or is admin)
      const isAdmin = req.user?.role === 'admin';
      if (existingTicket.deliveryPartnerId !== userId && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to update this ticket',
        });
      }

      const { status, adminResponse, adminId } = req.body;

      const updateData: any = {};

      // Admin can update status and add response
      if (isAdmin) {
        if (status) updateData.status = status;
        if (adminResponse) updateData.adminResponse = adminResponse;
        if (adminId) updateData.adminId = adminId;
      } else {
        // Partner can only close their own tickets
        if (status === 'closed') {
          updateData.status = status;
        }
      }

      // Update ticket
      const updatedTicket = await ticketService.updateTicket(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
        data: updatedTicket,
      });
    } catch (error) {
      console.error('Update ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update ticket',
      });
    }
  }

  /**
   * Add admin response to ticket (Admin only)
   * POST /api/delivery-partner/ticket/:id/response
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
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      const { adminResponse, status } = req.body;

      // Add admin response
      const updatedTicket = await ticketService.addAdminResponse(
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
   * Resolve ticket (Admin only)
   * POST /api/delivery-partner/ticket/:id/resolve
   */
  static async resolveTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { adminResponse } = req.body;

      // Get existing ticket
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Resolve ticket
      const resolvedTicket = await ticketService.resolveTicket(id, adminResponse);

      return res.status(200).json({
        success: true,
        message: 'Ticket resolved successfully',
        data: resolvedTicket,
      });
    } catch (error) {
      console.error('Resolve ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to resolve ticket',
      });
    }
  }

  /**
   * Close ticket
   * POST /api/delivery-partner/ticket/:id/close
   */
  static async closeTicket(req: AuthenticatedRequest, res: Response) {
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
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Check if user owns this ticket (or is admin)
      if (existingTicket.deliveryPartnerId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to close this ticket',
        });
      }

      // Close ticket
      const closedTicket = await ticketService.closeTicket(id);

      return res.status(200).json({
        success: true,
        message: 'Ticket closed successfully',
        data: closedTicket,
      });
    } catch (error) {
      console.error('Close ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to close ticket',
      });
    }
  }

  /**
   * Delete ticket
   * DELETE /api/delivery-partner/ticket/:id
   */
  static async deleteTicket(req: AuthenticatedRequest, res: Response) {
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
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      // Check if user owns this ticket (or is admin)
      if (existingTicket.deliveryPartnerId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this ticket',
        });
      }

      // Delete ticket
      await ticketService.deleteTicket(id);

      return res.status(200).json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    } catch (error) {
      console.error('Delete ticket error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete ticket',
      });
    }
  }
}
