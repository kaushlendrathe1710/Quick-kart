import type { Response } from 'express';
import type { AuthenticatedRequest } from '@server/types';
import { ticketService } from '@server/db/services';

/**
 * Admin Ticket Controller
 * Handles admin operations for delivery partner support tickets
 */
export class AdminTicketController {
  /**
   * Get all tickets (Admin only)
   * GET /api/admin/tickets
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
   * GET /api/admin/tickets/open
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
   * Get ticket by ID (Admin can view any ticket)
   * GET /api/admin/tickets/:id
   */
  static async getTicketById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      const ticket = await ticketService.getTicketById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
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
   * Update ticket (Admin only)
   * PATCH /api/admin/tickets/:id
   */
  static async updateTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Get existing ticket
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      const updates = req.body;

      // Update ticket
      const updatedTicket = await ticketService.updateTicket(id, updates);

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
   * Add admin response to ticket
   * POST /api/admin/tickets/:id/response
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
   * Resolve ticket
   * POST /api/admin/tickets/:id/resolve
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
   * POST /api/admin/tickets/:id/close
   */
  static async closeTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Get existing ticket
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
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
   * DELETE /api/admin/tickets/:id
   */
  static async deleteTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // Get existing ticket
      const existingTicket = await ticketService.getTicketById(id);
      if (!existingTicket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
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
