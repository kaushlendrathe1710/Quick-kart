import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { userService } from '@server/db/services/user.service';
import type {
  AuthenticatedSocket,
  SocketAuthPayload,
  SocketErrorPayload,
  UserRole,
} from './socketTypes';
import { SOCKET_EVENTS } from './socketTypes';

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Socket Authentication Middleware
 * Authenticates socket connections using JWT tokens
 * Can be used as middleware or called manually
 */

/**
 * Extract token from socket handshake
 * Checks both auth header and query parameters
 */
function extractTokenFromSocket(socket: Socket): string | null {
  // Check authorization header
  const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

  if (authHeader) {
    // Handle "Bearer <token>" format
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    // Handle direct token
    if (typeof authHeader === 'string') {
      return authHeader;
    }
  }

  // Check query parameters (fallback for some clients)
  const queryToken = socket.handshake.query?.token;
  if (typeof queryToken === 'string') {
    return queryToken;
  }

  return null;
}

/**
 * Verify JWT token and attach user to socket
 */
async function verifySocketToken(socket: Socket, token: string): Promise<boolean> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    // Fetch user from database
    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return false;
    }

    // Attach user to socket
    (socket as AuthenticatedSocket).user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      isApproved: user.isApproved || false,
    };

    return true;
  } catch (error) {
    console.error('Socket token verification failed:', error);
    return false;
  }
}

/**
 * Socket.IO middleware for authentication
 * Use this when initializing Socket.IO
 */
export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  const token = extractTokenFromSocket(socket);

  if (!token) {
    return next(new Error('Authentication required'));
  }

  const isValid = await verifySocketToken(socket, token);

  if (!isValid) {
    return next(new Error('Invalid or expired token'));
  }

  next();
}

/**
 * Manual authentication handler for runtime authentication
 * Useful for clients that connect first, then send auth
 */
export async function handleSocketAuthentication(socket: Socket): Promise<void> {
  socket.on(SOCKET_EVENTS.AUTHENTICATE, async (payload: SocketAuthPayload) => {
    try {
      if (!payload?.token) {
        const errorPayload: SocketErrorPayload = {
          message: 'Token is required',
          code: 'AUTH_TOKEN_MISSING',
        };
        socket.emit(SOCKET_EVENTS.AUTHENTICATION_ERROR, errorPayload);
        return;
      }

      const isValid = await verifySocketToken(socket, payload.token);

      if (!isValid) {
        const errorPayload: SocketErrorPayload = {
          message: 'Invalid or expired token',
          code: 'AUTH_TOKEN_INVALID',
        };
        socket.emit(SOCKET_EVENTS.AUTHENTICATION_ERROR, errorPayload);
        return;
      }

      const authSocket = socket as AuthenticatedSocket;
      socket.emit(SOCKET_EVENTS.AUTHENTICATION_SUCCESS, {
        user: {
          id: authSocket.user!.id,
          email: authSocket.user!.email,
          role: authSocket.user!.role,
        },
      });
    } catch (error) {
      const errorPayload: SocketErrorPayload = {
        message: 'Authentication failed',
        code: 'AUTH_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      };
      socket.emit(SOCKET_EVENTS.AUTHENTICATION_ERROR, errorPayload);
    }
  });
}

/**
 * Check if socket is authenticated
 * Use this in event handlers to ensure user is authenticated
 */
export function requireAuthentication(socket: Socket): socket is AuthenticatedSocket {
  const authSocket = socket as AuthenticatedSocket;
  return authSocket.user !== undefined;
}

/**
 * Get authenticated user from socket
 * Returns user info or null if not authenticated
 */
export function getAuthenticatedUser(socket: Socket) {
  const authSocket = socket as AuthenticatedSocket;
  return authSocket.user || null;
}
