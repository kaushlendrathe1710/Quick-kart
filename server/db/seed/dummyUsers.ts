import { userRole } from '@shared/constants';

/**
 * Dummy Users for Development
 * These users bypass OTP verification in development mode
 */
export const dummyUsers = [
  {
    id: 1,
    email: 'buyer@test.com',
    name: 'Test Buyer',
    contactNumber: '+919876543210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=buyer',
    role: userRole.USER,
    isApproved: true,
    rejected: false,
    rejectionReason: null,
  },
  {
    id: 2,
    email: 'seller@test.com',
    name: 'Test Seller',
    contactNumber: '+919876543211',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seller',
    role: userRole.SELLER,
    isApproved: true,
    rejected: false,
    rejectionReason: null,
  },
  {
    id: 3,
    email: 'delivery@test.com',
    name: 'Test Delivery Partner',
    contactNumber: '+919876543212',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=delivery',
    role: userRole.DELIVERY_PARTNER,
    isApproved: true,
    rejected: false,
    rejectionReason: null,
  },
  {
    id: 4,
    email: 'admin@test.com',
    name: 'Test Admin',
    contactNumber: '+919876543213',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: userRole.ADMIN,
    isApproved: true,
    rejected: false,
    rejectionReason: null,
  },
];

/**
 * Development-only emails that bypass OTP
 */
export const devEmails = dummyUsers.map((u) => u.email);
