import type { Express } from 'express';
import { AuthController } from '../../controllers/auth/auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

/**
 * Register authentication routes
 * Implements 3-step passwordless OTP-based authentication
 */
export function registerAuthRoutes(app: Express): void {
  // Step 1: Send OTP (creates basic user if new)
  app.post('/api/auth/send-otp', AuthController.sendOtp);

  // Step 2: Verify OTP and get JWT token
  app.post('/api/auth/verify-otp', AuthController.verifyOtp);

  // Step 3: Complete profile (for new users, protected route)
  app.post('/api/auth/complete-profile', authenticate, AuthController.completeProfile);

  // Resend OTP
  app.post('/api/auth/resend-otp', AuthController.resendOtp);

  // Get current authenticated user (protected route)
  app.get('/api/auth/me', authenticate, AuthController.getCurrentUser);

  // Logout
  app.post('/api/auth/logout', AuthController.logout);
}
