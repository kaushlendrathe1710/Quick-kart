import type { Server, Socket } from 'socket.io';
import {
  SOCKET_EVENTS,
  type DeliveryLocationUpdatePayload,
  type JoinOrderRoomPayload,
  type LeaveOrderRoomPayload,
  type JoinStoreRoomPayload,
  type LeaveStoreRoomPayload,
  getAdminRoomName,
  isAdmin,
} from './socketTypes';
import { handleLocationUpdate } from './handlers/locationUpdate';
import { handleJoinOrderRoom, handleLeaveOrderRoom } from './rooms/orderRoom';
import { handleJoinStoreRoom, handleLeaveStoreRoom } from './rooms/storeRoom';
import { getAuthenticatedUser } from './auth';
import { socketLogger } from './utils/logger';

/**
 * Delivery Location Socket Handler
 * Manages real-time delivery partner location tracking
 * Improved with authorization, error handling, and proper logging
 */

/**
 * Register delivery location event handlers
 */
export function registerDeliveryLocationHandlers(io: Server, socket: Socket): void {
  socketLogger.debug('Registering delivery location handlers', {
    socketId: socket.id,
    userId: getAuthenticatedUser(socket)?.id,
  });

  // Handle location updates from delivery partners
  socket.on(
    SOCKET_EVENTS.DELIVERY_LOCATION_UPDATE,
    async (payload: DeliveryLocationUpdatePayload) => {
      await handleLocationUpdate(io, socket, payload);
    }
  );

  // Handle order room join/leave events
  socket.on(SOCKET_EVENTS.JOIN_ORDER_ROOM, async (payload: JoinOrderRoomPayload) => {
    await handleJoinOrderRoom(io, socket, payload);
  });

  socket.on(SOCKET_EVENTS.LEAVE_ORDER_ROOM, async (payload: LeaveOrderRoomPayload) => {
    await handleLeaveOrderRoom(socket, payload);
  });

  // Handle store room join/leave events
  socket.on(SOCKET_EVENTS.JOIN_STORE_ROOM, async (payload: JoinStoreRoomPayload) => {
    await handleJoinStoreRoom(io, socket, payload);
  });

  socket.on(SOCKET_EVENTS.LEAVE_STORE_ROOM, async (payload: LeaveStoreRoomPayload) => {
    await handleLeaveStoreRoom(socket, payload);
  });
}

/**
 * Auto-join admin room for admin users
 */
export function autoJoinAdminRoom(socket: Socket): void {
  const user = getAuthenticatedUser(socket);

  if (user && isAdmin(socket as any)) {
    const adminRoom = getAdminRoomName();
    socket.join(adminRoom);

    socketLogger.info('Admin auto-joined admin room', {
      socketId: socket.id,
      userId: user.id,
      room: adminRoom,
    });
  }
}
