import type { Socket } from 'socket.io';
import type {
  JoinOrderRoomPayload,
  LeaveOrderRoomPayload,
  SocketErrorPayload,
} from '../socketTypes';
import { SOCKET_EVENTS, getOrderRoomName } from '../socketTypes';
import { requireAuthentication, getAuthenticatedUser } from '../auth';
import { validateOrderAccess } from '../validators/authorization';
import { getPartnerLocationForOrder } from '@server/db/services/deliveryLocation.service';
import { db } from '@server/db/connect';
import { orders } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { socketLogger } from '../utils/logger';
import { emitSocketError } from '../utils/broadcast';
import type { Server } from 'socket.io';

/**
 * Handle join order room event
 * Validates user has access to the order before allowing join
 */
export async function handleJoinOrderRoom(
  io: Server,
  socket: Socket,
  payload: JoinOrderRoomPayload
): Promise<void> {
  const context = {
    socketId: socket.id,
    event: 'room:order:join',
    orderId: payload.orderId,
  };

  try {
    // Check authentication
    if (!requireAuthentication(socket)) {
      const error: SocketErrorPayload = {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      };

      socketLogger.authFailure(socket.id, 'Not authenticated');
      emitSocketError(io, socket.id, SOCKET_EVENTS.ERROR, error);
      return;
    }

    const user = getAuthenticatedUser(socket);
    if (!user) return;

    // Validate order access authorization
    const accessValidation = await validateOrderAccess(user, payload.orderId);

    if (!accessValidation.authorized) {
      const error: SocketErrorPayload = {
        message: accessValidation.reason || 'Access denied',
        code: 'AUTHORIZATION_FAILED',
      };

      socketLogger.authorizationFailure({
        socketId: socket.id,
        userId: user.id,
        resource: 'order',
        resourceId: payload.orderId,
        reason: accessValidation.reason || 'Access denied',
      });

      emitSocketError(io, socket.id, SOCKET_EVENTS.ERROR, error);
      return;
    }

    // Join the room
    const roomName = getOrderRoomName(payload.orderId);
    await socket.join(roomName);

    socketLogger.roomJoin(roomName, socket.id, user.id);

    // Send latest location if available
    try {
      const latestLocation = await fetchLatestLocationForOrder(payload.orderId);

      if (latestLocation && latestLocation.orderId === payload.orderId) {
        socket.emit(SOCKET_EVENTS.DELIVERY_LOCATION, {
          orderId: latestLocation.orderId,
          deliveryPartnerId: latestLocation.deliveryPartnerId,
          latitude: parseFloat(latestLocation.latitude),
          longitude: parseFloat(latestLocation.longitude),
          accuracy: latestLocation.accuracy ? parseFloat(latestLocation.accuracy) : undefined,
          heading: latestLocation.heading ? parseFloat(latestLocation.heading) : undefined,
          speed: latestLocation.speed ? parseFloat(latestLocation.speed) : undefined,
          timestamp: latestLocation.recordedAt.toISOString(),
        });

        socketLogger.debug('Sent latest location to client', {
          socketId: socket.id,
          orderId: payload.orderId,
          deliveryPartnerId: latestLocation.deliveryPartnerId,
        });
      }
    } catch (locationError) {
      socketLogger.warn('Failed to fetch latest location', {
        ...context,
        userId: user.id,
      });
      // Non-critical error, don't fail the join operation
    }
  } catch (error) {
    socketLogger.error(
      'Failed to join order room',
      { ...context, userId: getAuthenticatedUser(socket)?.id },
      error as Error
    );

    const errorPayload: SocketErrorPayload = {
      message: 'Failed to join order room',
      code: 'JOIN_ROOM_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    emitSocketError(io, socket.id, SOCKET_EVENTS.ERROR, errorPayload);
  }
}

/**
 * Handle leave order room event
 */
export async function handleLeaveOrderRoom(
  socket: Socket,
  payload: LeaveOrderRoomPayload
): Promise<void> {
  try {
    const roomName = getOrderRoomName(payload.orderId);
    await socket.leave(roomName);

    const user = getAuthenticatedUser(socket);
    socketLogger.roomLeave(roomName, socket.id, user?.id || 0);
  } catch (error) {
    socketLogger.error(
      'Failed to leave order room',
      {
        socketId: socket.id,
        orderId: payload.orderId,
        event: 'room:order:leave',
      },
      error as Error
    );
  }
}

/**
 * Helper to get latest location for order
 * Returns null if not found or on error
 */
async function fetchLatestLocationForOrder(orderId: number) {
  try {
    const order = await db
      .select({ deliveryPartnerId: orders.deliveryPartnerId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order.length || !order[0].deliveryPartnerId) {
      return null;
    }

    return await getPartnerLocationForOrder(order[0].deliveryPartnerId, orderId);
  } catch (error) {
    console.error('Error fetching latest location:', error);
    return null;
  }
}
