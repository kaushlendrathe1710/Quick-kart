import type { Request, Response } from 'express';
import { z } from 'zod';
import { generateToken } from '@server/utils/jwt';
import { sendOtpEmail } from '@server/emails/email';
import { generateOtp, getOtpExpiryTime } from '@server/utils/otp';
import {
  emailOnlySchema,
  verifyOtpSchema,
  completeUserProfileSchema,
  type EmailOnlyInput,
  type VerifyOtpInput,
  type CompleteUserProfileInput,
} from '@server/utils/validation';
import { getUserByEmail, createBasicUser, updateUserProfile, hasCompletedProfile } from '@server/db/services/user.service';
import {
  saveOtp,
  findValidOtp,
  markOtpAsUsed,
  deleteOtpsByEmail,
} from '@server/db/services/otp.service';

/**
 * Auth Controller
 * Handles passwordless authentication with email OTP
 */
export class AuthController {
  /**
   * Step 1: Send OTP to email
   * - If user exists → send OTP for login
   * - If new user → create basic user and send OTP
   */
  static async sendOtp(req: Request, res: Response) {
    try {
      const data: EmailOnlyInput = emailOnlySchema.parse(req.body);

      // Check if user exists
      let user = await getUserByEmail(data.email);
      let isNewUser = false;

      if (!user) {
        // Create basic user with only email
        user = await createBasicUser(data.email);
        isNewUser = true;
      }

      // Delete any previous OTPs for this email
      await deleteOtpsByEmail(data.email);

      // Generate new OTP
      const otp = generateOtp();
      const expiresAt = getOtpExpiryTime();

      // Save OTP to database
      await saveOtp({
        email: data.email,
        otp,
        expiresAt,
        isUsed: false,
      });

      // Send OTP via email
      await sendOtpEmail(data.email, otp);

      return res.status(200).json({
        success: true,
        message: 'OTP sent to your email',
        isNewUser,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Send OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP',
      });
    }
  }

  /**
   * Step 2: Verify OTP
   * - For existing users with complete profile → return token and user data
   * - For new users or incomplete profile → return token and needsProfileCompletion flag
   */
  static async verifyOtp(req: Request, res: Response) {
    try {
      const data: VerifyOtpInput = verifyOtpSchema.parse(req.body);

      // Find valid OTP
      const otpRecord = await findValidOtp(data.email, data.otp);

      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }

      // Mark OTP as used
      await markOtpAsUsed(otpRecord.id);

      // Get user
      const user = await getUserByEmail(data.email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if profile is complete
      const profileComplete = await hasCompletedProfile(user.id);

      // Generate JWT token
      const token = generateToken(user.id);

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          contactNumber: user.contactNumber,
          role: user.role,
          avatar: user.avatar,
          isApproved: user.isApproved,
        },
        needsProfileCompletion: !profileComplete,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Verify OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify OTP',
      });
    }
  }

  /**
   * Step 3: Complete user profile (for new users)
   * Required after OTP verification for new users
   */
  static async completeProfile(req: Request, res: Response) {
    try {
      // Get user from JWT token (set by auth middleware)
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
      }

      const data: CompleteUserProfileInput = completeUserProfileSchema.parse(req.body);

      // Update user profile
      const updatedUser = await updateUserProfile(user.id, {
        name: data.name,
        contactNumber: data.contactNumber,
        role: data.role,
      });

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update profile',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile completed successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          contactNumber: updatedUser.contactNumber,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          isApproved: updatedUser.isApproved,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }

      console.error('Complete profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to complete profile',
      });
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
      }

      // Check if profile is complete
      const profileComplete = await hasCompletedProfile(user.id);

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          contactNumber: user.contactNumber,
          role: user.role,
          avatar: user.avatar,
          isApproved: user.isApproved,
        },
        needsProfileCompletion: !profileComplete,
      });
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get user information',
      });
    }
  }

  /**
   * Logout
   */
  static async logout(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  /**
   * Resend OTP
   */
  static async resendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      await deleteOtpsByEmail(email);

      const otp = generateOtp();
      const expiresAt = getOtpExpiryTime();

      await saveOtp({
        email,
        otp,
        expiresAt,
        isUsed: false,
      });

      await sendOtpEmail(email, otp);

      return res.status(200).json({
        success: true,
        message: 'New OTP sent to your email',
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
      });
    }
  }
}
