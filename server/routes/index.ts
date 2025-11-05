import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { registerAuthRoutes } from './auth.routes.js';
// import { registerUserRoutes } from './user.routes.js';
import uploadRoutes from './upload.routes.js';
import { registerAddressRoutes } from './address.routes.js';
import { registerPaymentRoutes } from './payment.routes.js';
import { registerNotificationRoutes } from './notification.routes.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Quick-kart API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Register all route groups
  registerAuthRoutes(app);
  // registerUserRoutes(app);
  registerAddressRoutes(app);
  registerPaymentRoutes(app);
  registerNotificationRoutes(app);

  // Register upload routes
  app.use('/api/upload', uploadRoutes);

  // Create and return HTTP server
  return createServer(app);
}
