import type { Express } from 'express';
import { AdminTicketController } from '../../controllers/admin/ticket.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { updateTicketSchema, idParamSchema } from '../../utils/deliveryPartner.validation';

/**
 * Register admin ticket routes
 * All routes require authentication as admin
 */
export function registerAdminTicketRoutes(app: Express): void {
  // Get all tickets
  app.get('/api/admin/ticket', authenticate, AdminTicketController.getAllTickets);

  // Get open tickets
  app.get('/api/admin/ticket/open', authenticate, AdminTicketController.getOpenTickets);

  // Get ticket by ID
  app.get(
    '/api/admin/ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    AdminTicketController.getTicketById
  );

  // Update ticket
  app.patch(
    '/api/admin/ticket/:id',
    authenticate,
    validateRequest(updateTicketSchema),
    AdminTicketController.updateTicket
  );

  // Add admin response to ticket
  app.post('/api/admin/ticket/:id/response', authenticate, AdminTicketController.addAdminResponse);

  // Resolve ticket
  app.post('/api/admin/ticket/:id/resolve', authenticate, AdminTicketController.resolveTicket);

  // Close ticket
  app.post('/api/admin/ticket/:id/close', authenticate, AdminTicketController.closeTicket);

  // Delete ticket
  app.delete(
    '/api/admin/ticket/:id',
    authenticate,
    validateRequest(idParamSchema),
    AdminTicketController.deleteTicket
  );
}
