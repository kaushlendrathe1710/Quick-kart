import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware, handleSocketAuthentication } from './auth';
import { registerDeliveryLocationHandlers, autoJoinAdminRoom } from './deliveryLocation';
import { SOCKET_EVENTS } from './socketTypes';
import { socketLogger } from './utils/logger';
import { getAuthenticatedUser } from './auth';

/**
 * Initialize Socket.IO server
 * Sets up authentication, event handlers, and room management
 */
export function initializeSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.VITE_CLIENT_URL || 'http://localhost:5173',
        process.env.VITE_AUTH_SERVER || 'http://localhost:5000',
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Connection settings
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds
    transports: ['websocket', 'polling'],
  });

  // Apply authentication middleware
  // This will validate JWT before allowing connection
  io.use(socketAuthMiddleware);

  // Handle new connections
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    const user = getAuthenticatedUser(socket);

    socketLogger.connection(socket.id, user?.id);

    // Auto-join admin room if user is admin
    autoJoinAdminRoom(socket);

    // Register runtime authentication handler
    // (in case client connects first, then authenticates)
    handleSocketAuthentication(socket);

    // Register delivery location event handlers
    registerDeliveryLocationHandlers(io, socket);

    // Handle disconnection
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
      const user = getAuthenticatedUser(socket);
      socketLogger.disconnection(socket.id, user?.id, reason);
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      const user = getAuthenticatedUser(socket);
      socketLogger.error(
        'Socket error',
        {
          socketId: socket.id,
          userId: user?.id,
        },
        error
      );
    });
  });

  socketLogger.info('✅ Socket.IO initialized successfully', {
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  return io;
}

/**
 * Export the Server type for use in other modules
 */
export type { Server } from 'socket.io';

/**
 * Export socket types for convenience
 */
export * from './socketTypes';
