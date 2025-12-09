import type { User } from '@shared/types';

/**
 * Shared utility functions for approval status checks
 * Follows DRY principles for consistent approval logic
 */

/**
 * Check if a user needs approval
 * @param user - Current user object
 * @returns true if user requires approval but hasn't received it
 */
export function needsApproval(user: User | null): boolean {
  if (!user) return false;

  const rolesRequiringApproval = ['seller', 'deliveryPartner'];
  return rolesRequiringApproval.includes(user.role) && !user.isApproved;
}

/**
 * Check if a user is approved
 * @param user - Current user object
 * @returns true if user is approved or doesn't require approval
 */
export function isApproved(user: User | null): boolean {
  if (!user) return false;

  const rolesRequiringApproval = ['seller', 'deliveryPartner'];
  if (!rolesRequiringApproval.includes(user.role)) {
    return true; // Users, admins don't need approval
  }

  return user.isApproved || false;
}

/**
 * Get the application page URL based on user role
 * @param user - Current user object
 * @returns Application page URL or null
 */
export function getApplicationUrl(user: User | null): string | null {
  if (!user) return null;

  switch (user.role) {
    case 'seller':
      return '/seller/application';
    case 'deliveryPartner':
      return '/delivery-partner/app-download';
    default:
      return null;
  }
}

/**
 * Check if a user should see application submission in sidebar
 * @param user - Current user object
 * @returns true if user should see application submission option
 */
export function shouldShowApplicationSubmission(user: User | null): boolean {
  return needsApproval(user);
}
