/**
 * Socket Logger Utility
 * Centralized logging for socket events with context
 */

interface LogContext {
  socketId?: string;
  userId?: number;
  orderId?: number;
  storeId?: number;
  event?: string;
  [key: string]: any;
}

/**
 * Format log message with context
 */
function formatLogMessage(message: string, context?: LogContext): string {
  if (!context) return message;

  const parts: string[] = [message];

  if (context.socketId) parts.push(`[Socket: ${context.socketId}]`);
  if (context.userId) parts.push(`[User: ${context.userId}]`);
  if (context.orderId) parts.push(`[Order: ${context.orderId}]`);
  if (context.storeId) parts.push(`[Store: ${context.storeId}]`);
  if (context.event) parts.push(`[Event: ${context.event}]`);

  // Add any additional context
  const extraKeys = Object.keys(context).filter(
    (key) => !['socketId', 'userId', 'orderId', 'storeId', 'event'].includes(key)
  );

  if (extraKeys.length > 0) {
    const extras = extraKeys.map((key) => `${key}=${JSON.stringify(context[key])}`).join(', ');
    parts.push(`{${extras}}`);
  }

  return parts.join(' ');
}

/**
 * Socket logger
 */
export const socketLogger = {
  info(message: string, context?: LogContext): void {
    console.log(`[Socket Info] ${formatLogMessage(message, context)}`);
  },

  warn(message: string, context?: LogContext): void {
    console.warn(`[Socket Warn] ${formatLogMessage(message, context)}`);
  },

  error(message: string, context?: LogContext, error?: Error): void {
    const formattedMessage = `[Socket Error] ${formatLogMessage(message, context)}`;

    if (error) {
      console.error(formattedMessage, error);
    } else {
      console.error(formattedMessage);
    }
  },

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Socket Debug] ${formatLogMessage(message, context)}`);
    }
  },

  connection(socketId: string, userId?: number): void {
    this.info('Client connected', { socketId, userId });
  },

  disconnection(socketId: string, userId?: number, reason?: string): void {
    this.info('Client disconnected', { socketId, userId, reason });
  },

  roomJoin(roomName: string, socketId: string, userId: number): void {
    this.info(`Joined room: ${roomName}`, { socketId, userId });
  },

  roomLeave(roomName: string, socketId: string, userId: number): void {
    this.info(`Left room: ${roomName}`, { socketId, userId });
  },

  locationUpdate(context: {
    deliveryPartnerId: number;
    orderId: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    socketId: string;
  }): void {
    this.info(`Location update: ${context.latitude}, ${context.longitude}`, {
      socketId: context.socketId,
      userId: context.deliveryPartnerId,
      orderId: context.orderId,
      accuracy: context.accuracy,
      speed: context.speed,
    });
  },

  authFailure(socketId: string, reason: string): void {
    this.warn('Authentication failed', { socketId, reason });
  },

  authorizationFailure(context: {
    socketId: string;
    userId: number;
    resource: string;
    resourceId: number;
    reason: string;
  }): void {
    this.warn(`Authorization failed: ${context.reason}`, {
      socketId: context.socketId,
      userId: context.userId,
      [context.resource]: context.resourceId,
    });
  },
};
