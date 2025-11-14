import type { Server, Socket } from 'socket.io';
import {
  SOCKET_EVENTS,
  type DeliveryLocationUpdatePayload,
  type DeliveryLocationBroadcastPayload,
  type SocketErrorPayload,
  isValidLocationUpdate,
} from '../socketTypes';
import { requireAuthentication, getAuthenticatedUser } from '../auth';
import { validateDeliveryPartner, getStoreIdsForOrder } from '../validators/authorization';
import { updatePartnerLocation } from '@server/db/services/deliveryLocation.service';
import { socketLogger } from '../utils/logger';
import { broadcastDeliveryLocation, emitSocketError } from '../utils/broadcast';

/**
 * Handle location update from delivery partner
 * Validates, saves to DB, and broadcasts to relevant rooms
 */
export async function handleLocationUpdate(
  io: Server,
  socket: Socket,
  payload: DeliveryLocationUpdatePayload
): Promise<void> {
  const context = {
    socketId: socket.id,
    event: 'delivery:location:update',
    orderId: payload.orderId,
  };

  try {
    // 1. Check authentication
    if (!requireAuthentication(socket)) {
      const error: SocketErrorPayload = {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      };

      socketLogger.authFailure(socket.id, 'Not authenticated');
      emitSocketError(io, socket.id, SOCKET_EVENTS.DELIVERY_LOCATION_ERROR, error);
      return;
    }

    const user = getAuthenticatedUser(socket);
    if (!user) {
      const error: SocketErrorPayload = {
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      };

      socketLogger.error('User not found after authentication', context);
      emitSocketError(io, socket.id, SOCKET_EVENTS.DELIVERY_LOCATION_ERROR, error);
      return;
    }

    // 2. Validate user is delivery partner
    const deliveryPartnerValidation = validateDeliveryPartner(user);

    if (!deliveryPartnerValidation.authorized) {
      const error: SocketErrorPayload = {
        message: deliveryPartnerValidation.reason || 'Permission denied',
        code: 'PERMISSION_DENIED',
      };

      socketLogger.authorizationFailure({
        socketId: socket.id,
        userId: user.id,
        resource: 'delivery',
        resourceId: payload.orderId,
        reason: deliveryPartnerValidation.reason || 'Not a delivery partner',
      });

      emitSocketError(io, socket.id, SOCKET_EVENTS.DELIVERY_LOCATION_ERROR, error);
      return;
    }

    // 3. Validate payload
    if (!isValidLocationUpdate(payload)) {
      const error: SocketErrorPayload = {
        message: 'Invalid location data',
        code: 'INVALID_PAYLOAD',
        details: 'Latitude must be between -90 and 90, longitude between -180 and 180',
      };

      socketLogger.warn('Invalid location payload', {
        ...context,
        userId: user.id,
        payloadData: JSON.stringify(payload),
      });

      emitSocketError(io, socket.id, SOCKET_EVENTS.DELIVERY_LOCATION_ERROR, error);
      return;
    }

    // 4. Save location to database
    const locationRecord = await updatePartnerLocation({
      deliveryPartnerId: user.id,
      orderId: payload.orderId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heading: payload.heading,
      speed: payload.speed,
      recordedAt: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    });

    socketLogger.locationUpdate({
      deliveryPartnerId: user.id,
      orderId: payload.orderId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      speed: payload.speed,
      socketId: socket.id,
    });

    // 5. Prepare broadcast payload
    const broadcastPayload: DeliveryLocationBroadcastPayload = {
      orderId: payload.orderId,
      deliveryPartnerId: user.id,
      deliveryPartnerName: user.email,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      heading: payload.heading,
      speed: payload.speed,
      timestamp: locationRecord.recordedAt.toISOString(),
    };

    // 6. Get store IDs for the order
    let storeIds: number[] = [];
    try {
      storeIds = await getStoreIdsForOrder(payload.orderId);

      if (storeIds.length > 0) {
        socketLogger.debug('Resolved store IDs for order', {
          orderId: payload.orderId,
          storeIds: storeIds.join(', '),
        });
      }
    } catch (storeError) {
      socketLogger.warn('Failed to resolve store IDs', {
        orderId: payload.orderId,
        error: storeError instanceof Error ? storeError.message : 'Unknown',
      });
      // Non-critical, continue with empty storeIds
    }

    // 7. Broadcast to all relevant rooms
    await broadcastDeliveryLocation(io, broadcastPayload, {
      orderId: payload.orderId,
      storeIds,
      includeAdmin: true,
      excludeSocket: socket.id, // Don't send back to sender
    });

    socketLogger.info('Location update processed successfully', {
      deliveryPartnerId: user.id,
      orderId: payload.orderId,
      storeCount: storeIds.length,
    });
  } catch (error) {
    socketLogger.error(
      'Location update failed',
      {
        ...context,
        userId: getAuthenticatedUser(socket)?.id,
      },
      error as Error
    );

    const errorPayload: SocketErrorPayload = {
      message: 'Failed to process location update',
      code: 'LOCATION_UPDATE_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    emitSocketError(io, socket.id, SOCKET_EVENTS.DELIVERY_LOCATION_ERROR, errorPayload);
  }
}
