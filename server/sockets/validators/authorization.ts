import { db } from '@server/db/connect';
import { orders, orderItems, products } from '@server/db/schema';
import { eq, and } from 'drizzle-orm';
import { userRole } from '@shared/constants';

/**
 * Validation Helpers for Socket Authorization
 * Centralized authorization logic for socket events
 */

export interface SocketUser {
  id: number;
  email: string;
  role: (typeof userRole)[keyof typeof userRole];
  isApproved: boolean;
}

/**
 * Validate if user has access to an order
 * Customers can only access their own orders
 * Admins can access any order
 */
export async function validateOrderAccess(
  user: SocketUser,
  orderId: number
): Promise<{ authorized: boolean; reason?: string }> {
  // Admins have access to all orders
  if (user.role === userRole.ADMIN) {
    return { authorized: true };
  }

  try {
    // Check if order belongs to user
    const order = await db
      .select({ userId: orders.userId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order.length) {
      return {
        authorized: false,
        reason: 'Order not found',
      };
    }

    if (order[0].userId !== user.id) {
      return {
        authorized: false,
        reason: 'You do not have access to this order',
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error('Order access validation error:', error);
    return {
      authorized: false,
      reason: 'Failed to validate order access',
    };
  }
}

/**
 * Validate if user has access to a store
 * Sellers can only access stores they own
 * Admins can access any store
 */
export async function validateStoreAccess(
  user: SocketUser,
  storeId: number
): Promise<{ authorized: boolean; reason?: string }> {
  // Admins have access to all stores
  if (user.role === userRole.ADMIN) {
    return { authorized: true };
  }

  // Only sellers and admins can access store rooms
  if (user.role !== userRole.SELLER) {
    return {
      authorized: false,
      reason: 'Only store owners and admins can access store rooms',
    };
  }

  // For sellers, storeId is their user ID
  // (assuming each seller has one store identified by their user ID)
  if (user.id !== storeId) {
    return {
      authorized: false,
      reason: 'You do not have access to this store',
    };
  }

  return { authorized: true };
}

/**
 * Validate if user is a delivery partner
 */
export function validateDeliveryPartner(user: SocketUser): {
  authorized: boolean;
  reason?: string;
} {
  if (user.role !== userRole.DELIVERY_PARTNER) {
    return {
      authorized: false,
      reason: 'Only delivery partners can send location updates',
    };
  }

  if (!user.isApproved) {
    return {
      authorized: false,
      reason: 'Delivery partner account not approved',
    };
  }

  return { authorized: true };
}

/**
 * Get store ID(s) for an order
 * Returns array of seller IDs who have products in the order
 */
export async function getStoreIdsForOrder(orderId: number): Promise<number[]> {
  try {
    const result = await db
      .selectDistinct({ sellerId: products.sellerId })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return result.map((r) => r.sellerId).filter((id): id is number => id !== null);
  } catch (error) {
    console.error('Error fetching store IDs for order:', error);
    return [];
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: SocketUser): boolean {
  return user.role === userRole.ADMIN;
}

/**
 * Check if user is delivery partner
 */
export function isDeliveryPartner(user: SocketUser): boolean {
  return user.role === userRole.DELIVERY_PARTNER;
}

/**
 * Check if user is seller/store owner
 */
export function isSeller(user: SocketUser): boolean {
  return user.role === userRole.SELLER;
}

/**
 * Check if user is customer
 */
export function isCustomer(user: SocketUser): boolean {
  return user.role === userRole.USER;
}
