import 'dotenv/config';
import { createApp } from './app';
import { registerRoutes } from './routes/index';
import { setupVite, serveStatic, log } from './vite';
import { initDatabase } from '@server/db/connect';
import { seedDatabase } from '@server/db/seed';
import { initializeSocketIO } from './sockets';
// sessionStore is exported from services when needed

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'JWT_SECRET',
  'JWT_EXPIRY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_BUCKET_REGION',
  'AWS_BUCKET_NAME',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: Required environment variable ${envVar} is not defined`);
    console.error('Please check your .env file');
    process.exit(1);
  }
}

console.log(`\n========== Quick Kart Configuration ==========
Environment: ${process.env.NODE_ENV}
=================================================\n`);

const app = createApp();

(async () => {
  try {
    // Log the current environment
    console.log(`Starting server in ${process.env.NODE_ENV} mode`);

    // Initialize database
    await initDatabase();

    // Seed database with dummy data (only if empty)
    await seedDatabase();

    const server = await registerRoutes(app);

    // Initialize Socket.IO for real-time features
    const io = initializeSocketIO(server);

    // Make io available globally if needed by other modules
    (app as any).io = io;

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = process.env.PORT;
    server.listen(port, () => {
      log(`Server running at: port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
