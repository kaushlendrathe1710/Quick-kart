# Socket.IO Connection & Authentication Guide

Complete guide for establishing and maintaining WebSocket connections with authentication.

---

## 📡 Overview

This application uses **Socket.IO** for real-time bidirectional communication. All socket connections require JWT-based authentication to ensure secure communication.

---

## 🚀 Getting Started

### Installation

**Node.js / React:**

```bash
npm install socket.io-client
```

**React Native:**

```bash
npm install socket.io-client
```

---

## 🔐 Authentication Methods

### Method 1: Connect with Token (Recommended)

Pass JWT token during connection initialization:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here',
  },
  transports: ['websocket', 'polling'],
});
```

**Advantages:**

- Immediate authentication
- Connection rejected if token invalid
- Cleaner code flow

### Method 2: Post-Connection Authentication

Connect first, authenticate later:

```javascript
const socket = io('http://localhost:5000');

// After connection, send token
socket.emit('authenticate', {
  token: 'your_jwt_token_here',
});

// Listen for auth response
socket.on('authentication:success', (data) => {
  console.log('✅ Authenticated:', data.user);
});

socket.on('authentication:error', (error) => {
  console.error('❌ Auth failed:', error.message);
  // Handle error - redirect to login, refresh token, etc.
});
```

**Use When:**

- Token not available at connection time
- Need to re-authenticate without reconnecting
- Implementing token refresh flow

---

## 🔄 Token Management

### Token Refresh

When JWT expires, you need to refresh and re-authenticate:

```javascript
import { io } from 'socket.io-client';

let socket;
let currentToken = getTokenFromStorage();

function connectSocket(token) {
  if (socket) {
    socket.disconnect();
  }

  socket = io('http://localhost:5000', {
    auth: { token },
  });

  socket.on('connect_error', (error) => {
    if (error.message === 'Invalid or expired token') {
      // Token expired, refresh it
      refreshTokenAndReconnect();
    }
  });
}

async function refreshTokenAndReconnect() {
  try {
    const newToken = await refreshAuthToken(); // Your token refresh logic
    currentToken = newToken;
    saveTokenToStorage(newToken);
    connectSocket(newToken);
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login
  }
}

// Initial connection
connectSocket(currentToken);
```

### Alternative Query Parameter Method

Some clients may need to pass token via query:

```javascript
const socket = io('http://localhost:5000', {
  query: {
    token: 'your_jwt_token_here',
  },
});
```

**Note:** The server supports both `auth` and `query` methods.

---

## 🔌 Connection Lifecycle

### Connection Events

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your_token' },
});

// Successfully connected
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
  console.log('Connected:', socket.connected); // true
});

// Connection error (auth failure, network issue, etc.)
socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);

  // Check error type
  if (error.message.includes('Authentication')) {
    // Handle auth error
  } else {
    // Handle network error
  }
});

// Disconnected
socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // Server forced disconnect (auth failure, kicked out, etc.)
    // Manual reconnection needed
    socket.connect();
  }
  // For other reasons, Socket.IO will auto-reconnect
});

// Reconnection attempts
socket.io.on('reconnect_attempt', (attemptNumber) => {
  console.log(`🔄 Reconnection attempt #${attemptNumber}`);
});

socket.io.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconnected after ${attemptNumber} attempts`);
});

socket.io.on('reconnect_error', (error) => {
  console.error('❌ Reconnection error:', error.message);
});

socket.io.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed - giving up');
});
```

---

## ⚙️ Configuration Options

### Basic Configuration

```javascript
const socket = io('http://localhost:5000', {
  // Authentication
  auth: {
    token: 'your_jwt_token',
  },

  // Transport methods (order matters)
  transports: ['websocket', 'polling'],

  // Reconnection settings
  reconnection: true,
  reconnectionDelay: 1000, // Start with 1 second
  reconnectionDelayMax: 5000, // Max 5 seconds
  reconnectionAttempts: 5, // Try 5 times

  // Timeout settings
  timeout: 20000, // 20 seconds connection timeout

  // Upgrade transport after initial connection
  upgrade: true,
});
```

### Production Configuration

```javascript
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  auth: {
    token: getAuthToken(),
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: Infinity, // Keep trying
  timeout: 30000,
});
```

---

## 📱 React Hook Example

### useSocket Hook

```typescript
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url: string;
  token: string;
  autoConnect?: boolean;
}

export function useSocket({ url, token, autoConnect = true }: UseSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Initialize socket
    const socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err.message);
      setError(err.message);
      setConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [url, token, autoConnect]);

  const disconnect = () => {
    socketRef.current?.disconnect();
  };

  const reconnect = () => {
    socketRef.current?.connect();
  };

  return {
    socket: socketRef.current,
    connected,
    error,
    disconnect,
    reconnect,
  };
}
```

### Usage

```typescript
import React from 'react';
import { useSocket } from './hooks/useSocket';

export default function App() {
  const { socket, connected, error } = useSocket({
    url: 'http://localhost:5000',
    token: 'your_jwt_token',
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for events
    socket.on('delivery:location', (data) => {
      console.log('Location update:', data);
    });

    return () => {
      socket.off('delivery:location');
    };
  }, [socket]);

  return (
    <div>
      <p>Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

---

## 📱 React Native Implementation

### Complete React Native Hook

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { io, Socket } from 'socket.io-client';

interface UseSocketRNOptions {
  url: string;
  token: string;
  autoConnect?: boolean;
  reconnectOnForeground?: boolean;
}

export function useSocketRN({
  url,
  token,
  autoConnect = true,
  reconnectOnForeground = true,
}: UseSocketRNOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const appState = useRef(AppState.currentState);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected');
      setConnected(true);
      setError(null);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setError(err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
    });
  }, [url, token]);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
  }, []);

  // Handle app state changes
  useEffect(() => {
    if (!reconnectOnForeground) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - reconnect
        console.log('[Socket] App foregrounded - reconnecting');
        if (!socketRef.current?.connected) {
          connect();
        }
      } else if (nextAppState === 'background') {
        // App went to background - disconnect to save battery
        console.log('[Socket] App backgrounded - disconnecting');
        disconnect();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [connect, disconnect, reconnectOnForeground]);

  // Initial connection
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    connected,
    error,
    connect,
    disconnect,
  };
}
```

### Usage in React Native

```typescript
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useSocketRN } from './hooks/useSocketRN';

export default function TrackingScreen({ token, orderId }) {
  const { socket, connected, error } = useSocketRN({
    url: 'http://localhost:5000',
    token,
    reconnectOnForeground: true,
  });

  useEffect(() => {
    if (!socket || !connected) return;

    // Join order room
    socket.emit('room:order:join', { orderId });

    // Listen for location updates
    socket.on('delivery:location', (data) => {
      console.log('Location:', data);
    });

    return () => {
      socket.emit('room:order:leave', { orderId });
      socket.off('delivery:location');
    };
  }, [socket, connected, orderId]);

  return (
    <View>
      <Text>Status: {connected ? 'Live' : 'Offline'}</Text>
      {error && <Text>Error: {error}</Text>}
    </View>
  );
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Authentication required" Error

**Cause:** No token provided or invalid format

**Solution:**

```javascript
// ✅ Correct
io(url, { auth: { token: 'abc123' } });

// ❌ Wrong - don't include "Bearer"
io(url, { auth: { token: 'Bearer abc123' } });
```

#### 2. Token Expired During Connection

**Solution:** Implement token refresh before connecting:

```javascript
async function connectWithValidToken() {
  let token = getStoredToken();

  if (isTokenExpired(token)) {
    token = await refreshToken();
  }

  return io(url, { auth: { token } });
}
```

#### 3. Constant Reconnection Loop

**Cause:** Token invalid, server rejecting connection

**Solution:** Check server logs, verify token is valid:

```javascript
socket.on('connect_error', (error) => {
  if (error.message.includes('token')) {
    // Stop reconnection, redirect to login
    socket.disconnect();
    redirectToLogin();
  }
});
```

#### 4. Not Receiving Events

**Checklist:**

1. Socket connected: `socket.connected === true`
2. Joined correct room
3. Listening before event fires
4. Event name matches exactly

---

## 🎯 Best Practices

### 1. Always Clean Up

```javascript
useEffect(() => {
  socket.on('event', handler);

  return () => {
    socket.off('event', handler); // Remove listener
  };
}, []);
```

### 2. Handle Network Changes

```javascript
// React Native
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener((state) => {
  if (state.isConnected && !socket.connected) {
    socket.connect();
  }
});
```

### 3. Implement Exponential Backoff

```javascript
const socket = io(url, {
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 10,
});
```

### 4. Monitor Connection Health

```javascript
// Ping server periodically to check health
setInterval(() => {
  if (socket.connected) {
    socket.emit('ping');
  }
}, 30000);
```

---

## 📊 Connection States

| State          | Description                | Action               |
| -------------- | -------------------------- | -------------------- |
| `connecting`   | Initial connection attempt | Show loading         |
| `connected`    | Successfully connected     | Enable features      |
| `disconnected` | Connection lost            | Show offline mode    |
| `reconnecting` | Attempting to reconnect    | Show reconnecting UI |
| `failed`       | Reconnection failed        | Prompt user action   |

---

## 🔒 Security Best Practices

1. **Never log tokens** - Avoid console.log with sensitive data
2. **Use HTTPS/WSS** in production
3. **Validate token server-side** on every connection
4. **Implement rate limiting** for reconnection attempts
5. **Monitor for abuse** - suspicious connection patterns

---

## 📞 Support

For connection issues, check:

1. Server logs
2. Network connectivity
3. Token validity
4. CORS configuration

Contact backend team for persistent issues.
