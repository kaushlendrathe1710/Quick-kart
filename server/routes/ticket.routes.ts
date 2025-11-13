import type { Express } from 'express';
import { TicketController } from '../controllers';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createTicketSchema,
  updateTicketSchema,
  idParamSchema,
} from '../utils/deliveryPartner.validation';

/**
 * Register ticket routes
 * All routes require authentication
 */
export function registerTicketRoutes(app: Express): void {
  // Get ticket by ID
  app.get(
    '/api/delivery-partner/ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    TicketController.getTicketById
  );

  // Get current partner's tickets
  app.get('/api/delivery-partner/ticket', authenticate, TicketController.getMyTickets);

  // Get all tickets (Admin only)
  app.get('/api/delivery-partner/ticket/all', authenticate, TicketController.getAllTickets);

  // Get open tickets (Admin only)
  app.get('/api/delivery-partner/ticket/open', authenticate, TicketController.getOpenTickets);

  // Create ticket
  app.post(
    '/api/delivery-partner/ticket',
    authenticate,
    validateRequest(createTicketSchema),
    TicketController.createTicket
  );

  // Update ticket
  app.patch(
    '/api/delivery-partner/ticket/:id',
    authenticate,
    validateRequest(updateTicketSchema),
    TicketController.updateTicket
  );

  // Add admin response (Admin only)
  app.post(
    '/api/delivery-partner/ticket/:id/response',
    authenticate,
    TicketController.addAdminResponse
  );

  // Resolve ticket (Admin only)
  app.post(
    '/api/delivery-partner/ticket/:id/resolve',
    authenticate,
    TicketController.resolveTicket
  );

  // Close ticket
  app.post('/api/delivery-partner/ticket/:id/close', authenticate, TicketController.closeTicket);

  // Delete ticket
  app.delete(
    '/api/delivery-partner/ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    TicketController.deleteTicket
  );
}
