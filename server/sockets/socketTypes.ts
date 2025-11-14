import type { Socket } from 'socket.io';
import { userRole } from '@shared/constants';

/**
 * Socket Types and Event Definitions
 * Centralized type definitions for all Socket.IO events
 */

// User role type from constants
export type UserRole = (typeof userRole)[keyof typeof userRole];

// Extend Socket with authenticated user information
export interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    isApproved: boolean;
  };
}

// ============================================================================
// Event Names (Constants)
// ============================================================================

export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Authentication events
  AUTHENTICATE: 'authenticate',
  AUTHENTICATION_SUCCESS: 'authentication:success',
  AUTHENTICATION_ERROR: 'authentication:error',

  // Delivery location events (Client → Server)
  DELIVERY_LOCATION_UPDATE: 'delivery:location:update',

  // Delivery location events (Server → Client)
  DELIVERY_LOCATION: 'delivery:location',
  DELIVERY_LOCATION_ERROR: 'delivery:location:error',

  // Room management events
  JOIN_ORDER_ROOM: 'room:order:join',
  LEAVE_ORDER_ROOM: 'room:order:leave',
  JOIN_STORE_ROOM: 'room:store:join',
  LEAVE_STORE_ROOM: 'room:store:leave',

  // System events
  ERROR: 'error',
} as const;

// ============================================================================
// Payload Interfaces
// ============================================================================

/**
 * Location update sent from delivery partner
 */
export interface DeliveryLocationUpdatePayload {
  orderId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number; // Compass direction (0-360 degrees)
  speed?: number; // km/h
  timestamp?: string; // ISO string
}

/**
 * Location broadcast sent to clients (users, stores, admin)
 */
export interface DeliveryLocationBroadcastPayload {
  orderId: number;
  deliveryPartnerId: number;
  deliveryPartnerName?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

/**
 * Authentication payload for socket connection
 */
export interface SocketAuthPayload {
  token: string;
}

/**
 * Room join/leave payloads
 */
export interface JoinOrderRoomPayload {
  orderId: number;
}

export interface LeaveOrderRoomPayload {
  orderId: number;
}

export interface JoinStoreRoomPayload {
  storeId: number;
}

export interface LeaveStoreRoomPayload {
  storeId: number;
}

/**
 * Error payload
 */
export interface SocketErrorPayload {
  message: string;
  code?: string;
  details?: any;
}

// ============================================================================
// Room Naming Conventions (Type-Branded)
// ============================================================================

export const ROOM_PREFIX = {
  ORDER: 'order',
  STORE: 'store',
  ADMIN: 'admin',
  DELIVERY_PARTNER: 'delivery_partner',
} as const;

// Type-branded room names for type safety
export type OrderRoomName = `order:${number}`;
export type StoreRoomName = `store:${number}`;
export type AdminRoomName = 'admin:all';
export type DeliveryPartnerRoomName = `delivery_partner:${number}`;
export type RoomName = OrderRoomName | StoreRoomName | AdminRoomName | DeliveryPartnerRoomName;

/**
 * Generate room name for an order
 */
export function getOrderRoomName(orderId: number): OrderRoomName {
  return `${ROOM_PREFIX.ORDER}:${orderId}` as OrderRoomName;
}

/**
 * Generate room name for a store
 */
export function getStoreRoomName(storeId: number): StoreRoomName {
  return `${ROOM_PREFIX.STORE}:${storeId}` as StoreRoomName;
}

/**
 * Get admin room name (single room for all admins)
 */
export function getAdminRoomName(): AdminRoomName {
  return `${ROOM_PREFIX.ADMIN}:all`;
}

/**
 * Generate room name for a delivery partner
 */
export function getDeliveryPartnerRoomName(deliveryPartnerId: number): DeliveryPartnerRoomName {
  return `${ROOM_PREFIX.DELIVERY_PARTNER}:${deliveryPartnerId}` as DeliveryPartnerRoomName;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if socket is authenticated
 */
export function isAuthenticatedSocket(socket: Socket): socket is AuthenticatedSocket {
  return 'user' in socket && socket.user !== undefined;
}

/**
 * Check if user is delivery partner
 */
export function isDeliveryPartner(socket: AuthenticatedSocket): boolean {
  return socket.user?.role === userRole.DELIVERY_PARTNER;
}

/**
 * Check if user is admin
 */
export function isAdmin(socket: AuthenticatedSocket): boolean {
  return socket.user?.role === userRole.ADMIN;
}

/**
 * Check if user is seller/store owner
 */
export function isSeller(socket: AuthenticatedSocket): boolean {
  return socket.user?.role === userRole.SELLER;
}

/**
 * Validate location update payload
 */
export function isValidLocationUpdate(payload: any): payload is DeliveryLocationUpdatePayload {
  return (
    typeof payload === 'object' &&
    typeof payload.orderId === 'number' &&
    typeof payload.latitude === 'number' &&
    typeof payload.longitude === 'number' &&
    payload.latitude >= -90 &&
    payload.latitude <= 90 &&
    payload.longitude >= -180 &&
    payload.longitude <= 180
  );
}
