# WebSocket (Socket.IO) Documentation

Real-time communication documentation for Quick Kart application.

---

## 📚 Documentation Index

### 1. [Socket Connection & Authentication](./socketConnection.md)

Complete guide for establishing and maintaining WebSocket connections with JWT authentication.

**Topics Covered:**

- Connection setup for different platforms (Web, React Native)
- Authentication methods
- Token management and refresh
- Connection lifecycle events
- Reconnection strategies
- React hooks for socket management
- Troubleshooting common issues

### 2. [Delivery Location Tracking](./deliveryLocation.md)

Real-time delivery partner location tracking system.

**Topics Covered:**

- Location update events (delivery partner → server)
- Location broadcast events (server → clients)
- Room-based broadcasting (order, store, admin rooms)
- Complete React Native implementation examples
- Best practices for battery optimization
- Performance considerations
- Security notes

---

## 🚀 Quick Start

### Installation

```bash
npm install socket.io-client
```

### Basic Connection (Web/React Native)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here',
  },
});

socket.on('connect', () => {
  console.log('Connected!');
});
```

---

## 🎯 Use Cases

### For Customers

Track delivery partner location in real-time for your orders.

**See:** [Delivery Location Tracking - Customer Example](./deliveryLocation.md#usage-example-customer)

### For Delivery Partners

Send location updates while delivering orders.

**See:** [Delivery Location Tracking - Delivery Partner Example](./deliveryLocation.md#usage-example-delivery-partner)

### For Store Owners

Monitor all active deliveries for your stores.

**See:** [Delivery Location Tracking - Store Room](./deliveryLocation.md#5-join-store-room)

### For Admins

System-wide monitoring of all deliveries.

**See:** [Delivery Location Tracking - Admin Room](./deliveryLocation.md#room-system)

---

## 🔐 Authentication Required

All WebSocket connections require JWT authentication. See [Authentication Guide](./socketConnection.md#authentication-methods) for details.

---

## 📡 Event Reference

### Connection Events

- `connect` - Successfully connected
- `disconnect` - Connection closed
- `connect_error` - Connection failed
- `authenticate` - Manual authentication
- `authentication:success` - Auth successful
- `authentication:error` - Auth failed

### Delivery Location Events

- `delivery:location:update` - Send location (delivery partner)
- `delivery:location` - Receive location broadcast
- `delivery:location:error` - Location update error

### Room Management Events

- `room:order:join` - Join order tracking room
- `room:order:leave` - Leave order room
- `room:store:join` - Join store monitoring room
- `room:store:leave` - Leave store room

**Full reference:** [Delivery Location Events](./deliveryLocation.md#socket-events)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│ Delivery Partner│
│   (Emitter)     │
└────────┬────────┘
         │ emit: delivery:location:update
         │
         ▼
┌─────────────────┐
│   Socket.IO     │
│     Server      │
│  (Broadcaster)  │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌────────────────┐
│  Customer Room │  │   Admin Room   │
│  order:123     │  │   admin:all    │
└────────────────┘  └────────────────┘
```

---

## 🔧 Server Configuration

Socket.IO is initialized on the HTTP server with:

- JWT authentication middleware
- CORS enabled for client domains
- WebSocket + Polling transports
- Auto-reconnection support

**Location:** `server/sockets/index.ts`

---

## 📝 Code Examples

### React Hook Example

```typescript
import { useSocket } from './hooks/useSocket';

function App() {
  const { socket, connected } = useSocket({
    url: 'http://localhost:5000',
    token: authToken
  });

  return <div>Status: {connected ? '🟢' : '🔴'}</div>;
}
```

**Full implementation:** [Socket Connection Guide](./socketConnection.md#react-hook-example)

### React Native with Background Handling

```typescript
import { useSocketRN } from './hooks/useSocketRN';

function TrackingScreen() {
  const { socket, connected } = useSocketRN({
    url: 'http://localhost:5000',
    token: authToken,
    reconnectOnForeground: true,
  });

  // ... rest of component
}
```

**Full implementation:** [Socket Connection Guide](./socketConnection.md#react-native-implementation)

---

## 🎨 Best Practices

### 1. Always Clean Up Event Listeners

```javascript
useEffect(() => {
  socket.on('event', handler);
  return () => socket.off('event', handler);
}, []);
```

### 2. Handle Connection States

Show appropriate UI for connected, disconnected, and reconnecting states.

### 3. Implement Token Refresh

Handle JWT expiration gracefully with automatic token refresh.

### 4. Optimize for Mobile

- Disconnect on background (React Native)
- Reduce update frequency
- Handle network changes

### 5. Error Handling

Always listen for error events and handle appropriately.

**Full best practices:** [Socket Connection Guide](./socketConnection.md#best-practices)

---

## 🐛 Troubleshooting

### Common Issues

| Issue                 | Cause                 | Solution                        |
| --------------------- | --------------------- | ------------------------------- |
| Authentication failed | Invalid/expired token | Refresh token and reconnect     |
| Not receiving events  | Not joined room       | Emit join room event            |
| Constant reconnection | Server rejecting      | Check server logs, verify token |
| High battery drain    | Too frequent updates  | Reduce update interval          |

**Full troubleshooting guide:** [Socket Connection Guide](./socketConnection.md#troubleshooting)

---

## 📊 Performance Tips

1. **Throttle location updates** - Send every 3-5 seconds, not every GPS update
2. **Clean up old data** - Periodically remove old location records from DB
3. **Use rooms efficiently** - Only join rooms you need
4. **Disconnect when not needed** - Save battery and server resources

---

## 🔒 Security

- All connections authenticated via JWT
- Rooms enforce permission checks
- Rate limiting on location updates
- Monitor for suspicious patterns

---

## 🚀 Next Steps

1. Read [Connection & Authentication Guide](./socketConnection.md)
2. Implement [Delivery Location Tracking](./deliveryLocation.md)
3. Test with provided React Native examples
4. Monitor performance and optimize

---

## 📞 Support

For issues or questions:

- Check documentation first
- Review server logs
- Contact backend team
- File issue in repository

---

## 🔄 Updates

This documentation is maintained alongside the codebase. Last updated: November 2025.

For the latest code implementation, see:

- `server/sockets/` - Socket.IO server implementation
- `server/db/services/deliveryLocation.service.ts` - Location database operations
- `server/db/schema/deliveryPartnerLocation.schema.ts` - Location data schema
