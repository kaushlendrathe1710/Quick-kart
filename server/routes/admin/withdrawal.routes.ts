import type { Express } from 'express';
import { AdminWithdrawalController } from '../../controllers/admin/withdrawal.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register admin withdrawal routes
 * All routes require authentication and admin role
 */
export function registerAdminWithdrawalRoutes(app: Express): void {
  /**
   * @route   GET /api/admin/withdrawals
   * @desc    Get all withdrawal requests with filtering and pagination
   * @access  Private (Admin)
   */
  app.get('/api/admin/withdrawals', authenticate, AdminWithdrawalController.getAllWithdrawals);

  /**
   * @route   GET /api/admin/withdrawals/:id
   * @desc    Get single withdrawal request
   * @access  Private (Admin)
   */
  app.get('/api/admin/withdrawals/:id', authenticate, AdminWithdrawalController.getWithdrawal);

  /**
   * @route   PUT /api/admin/withdrawals/:id/approve
   * @desc    Approve withdrawal request
   * @access  Private (Admin)
   */
  app.put(
    '/api/admin/withdrawals/:id/approve',
    authenticate,
    AdminWithdrawalController.approveWithdrawal
  );

  /**
   * @route   PUT /api/admin/withdrawals/:id/complete
   * @desc    Complete withdrawal (mark as paid and debit wallet)
   * @access  Private (Admin)
   */
  app.put(
    '/api/admin/withdrawals/:id/complete',
    authenticate,
    AdminWithdrawalController.completeWithdrawal
  );

  /**
   * @route   PUT /api/admin/withdrawals/:id/reject
   * @desc    Reject withdrawal request
   * @access  Private (Admin)
   */
  app.put(
    '/api/admin/withdrawals/:id/reject',
    authenticate,
    AdminWithdrawalController.rejectWithdrawal
  );
}
