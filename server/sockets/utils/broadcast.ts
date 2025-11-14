import type { Server } from 'socket.io';
import type {
  DeliveryLocationBroadcastPayload,
  OrderRoomName,
  StoreRoomName,
  AdminRoomName,
} from '../socketTypes';
import {
  SOCKET_EVENTS,
  getOrderRoomName,
  getStoreRoomName,
  getAdminRoomName,
} from '../socketTypes';
import { socketLogger } from '../utils/logger';

/**
 * Broadcast Options
 */
export interface BroadcastOptions {
  orderId: number;
  storeIds?: number[];
  includeAdmin?: boolean;
  excludeSocket?: string; // Socket ID to exclude from broadcast
}

/**
 * Broadcast delivery location to relevant rooms
 * Handles broadcasting to order rooms, store rooms, and admin room
 */
export async function broadcastDeliveryLocation(
  io: Server,
  payload: DeliveryLocationBroadcastPayload,
  options: BroadcastOptions
): Promise<void> {
  const { orderId, storeIds = [], includeAdmin = true, excludeSocket } = options;

  try {
    // Prepare emitter (exclude specific socket if provided)
    const emitter = excludeSocket ? io.except(excludeSocket) : io;

    // 1. Broadcast to order room (customer tracking their order)
    const orderRoom: OrderRoomName = getOrderRoomName(orderId);
    emitter.to(orderRoom).emit(SOCKET_EVENTS.DELIVERY_LOCATION, payload);

    socketLogger.debug('Broadcast to order room', {
      orderId,
      room: orderRoom,
      deliveryPartnerId: payload.deliveryPartnerId,
    });

    // 2. Broadcast to store rooms (store owners monitoring their deliveries)
    if (storeIds.length > 0) {
      for (const storeId of storeIds) {
        const storeRoom: StoreRoomName = getStoreRoomName(storeId);
        emitter.to(storeRoom).emit(SOCKET_EVENTS.DELIVERY_LOCATION, payload);

        socketLogger.debug('Broadcast to store room', {
          storeId,
          room: storeRoom,
          orderId,
        });
      }
    }

    // 3. Broadcast to admin room (admins monitoring all deliveries)
    if (includeAdmin) {
      const adminRoom: AdminRoomName = getAdminRoomName();
      emitter.to(adminRoom).emit(SOCKET_EVENTS.DELIVERY_LOCATION, payload);

      socketLogger.debug('Broadcast to admin room', {
        room: adminRoom,
        orderId,
      });
    }

    socketLogger.info('Location broadcast successful', {
      orderId,
      deliveryPartnerId: payload.deliveryPartnerId,
      storeCount: storeIds.length,
      includeAdmin,
    });
  } catch (error) {
    socketLogger.error(
      'Failed to broadcast delivery location',
      {
        orderId,
        deliveryPartnerId: payload.deliveryPartnerId,
      },
      error as Error
    );
    throw error;
  }
}

/**
 * Emit error to specific socket
 */
export function emitSocketError(
  io: Server,
  socketId: string,
  event: string,
  error: {
    message: string;
    code?: string;
    details?: any;
  }
): void {
  io.to(socketId).emit(event, error);

  socketLogger.debug('Emitted error to socket', {
    socketId,
    event,
    code: error.code,
    message: error.message,
  });
}
