import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { registerAuthRoutes } from './auth.routes.js';
// import { registerUserRoutes } from './user.routes.js';
import uploadRoutes from './upload.routes.js';

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

  // Register upload routes
  app.use('/api/upload', uploadRoutes);

  // Create and return HTTP server
  return createServer(app);
}
