import type { Socket, Server } from 'socket.io';
import type {
  JoinStoreRoomPayload,
  LeaveStoreRoomPayload,
  SocketErrorPayload,
} from '../socketTypes';
import { SOCKET_EVENTS, getStoreRoomName } from '../socketTypes';
import { requireAuthentication, getAuthenticatedUser } from '../auth';
import { validateStoreAccess } from '../validators/authorization';
import { socketLogger } from '../utils/logger';
import { emitSocketError } from '../utils/broadcast';

/**
 * Handle join store room event
 * Validates user is store owner/admin before allowing join
 */
export async function handleJoinStoreRoom(
  io: Server,
  socket: Socket,
  payload: JoinStoreRoomPayload
): Promise<void> {
  const context = {
    socketId: socket.id,
    event: 'room:store:join',
    storeId: payload.storeId,
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

    // Validate store access authorization
    const accessValidation = await validateStoreAccess(user, payload.storeId);

    if (!accessValidation.authorized) {
      const error: SocketErrorPayload = {
        message: accessValidation.reason || 'Access denied',
        code: 'AUTHORIZATION_FAILED',
      };

      socketLogger.authorizationFailure({
        socketId: socket.id,
        userId: user.id,
        resource: 'store',
        resourceId: payload.storeId,
        reason: accessValidation.reason || 'Access denied',
      });

      emitSocketError(io, socket.id, SOCKET_EVENTS.ERROR, error);
      return;
    }

    // Join the room
    const roomName = getStoreRoomName(payload.storeId);
    await socket.join(roomName);

    socketLogger.roomJoin(roomName, socket.id, user.id);
  } catch (error) {
    socketLogger.error(
      'Failed to join store room',
      { ...context, userId: getAuthenticatedUser(socket)?.id },
      error as Error
    );

    const errorPayload: SocketErrorPayload = {
      message: 'Failed to join store room',
      code: 'JOIN_ROOM_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error',
    };

    emitSocketError(io, socket.id, SOCKET_EVENTS.ERROR, errorPayload);
  }
}

/**
 * Handle leave store room event
 */
export async function handleLeaveStoreRoom(
  socket: Socket,
  payload: LeaveStoreRoomPayload
): Promise<void> {
  try {
    const roomName = getStoreRoomName(payload.storeId);
    await socket.leave(roomName);

    const user = getAuthenticatedUser(socket);
    socketLogger.roomLeave(roomName, socket.id, user?.id || 0);
  } catch (error) {
    socketLogger.error(
      'Failed to leave store room',
      {
        socketId: socket.id,
        storeId: payload.storeId,
        event: 'room:store:leave',
      },
      error as Error
    );
  }
}
