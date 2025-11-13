import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { registerAuthRoutes } from './auth.routes.js';
// import { registerUserRoutes } from './user.routes.js';
import uploadRoutes from './upload.routes.js';
import { registerAddressRoutes } from './address.routes.js';
import { registerPaymentRoutes } from './payment.routes.js';
import { registerNotificationRoutes } from './notification.routes.js';
import { registerProductRoutes } from './product.routes.js';
import { registerCartRoutes } from './cart.routes.js';
import { registerOrderRoutes } from './order.routes.js';
import { registerCategoryRoutes } from './category.routes.js';

// Delivery Partner Routes
import { registerDeliveryPartnerDocumentsRoutes } from './deliveryPartnerDocuments.routes.js';
import { registerDeliveryPartnerVehicleRoutes } from './deliveryPartnerVehicle.routes.js';
import { registerDeliveryPartnerBankRoutes } from './deliveryPartnerBank.routes.js';
import { registerDeliveryRoutes } from './delivery.routes.js';
import { registerDeliveryRatingRoutes } from './deliveryRating.routes.js';
import { registerWalletRoutes } from './wallet.routes.js';
import { registerTicketRoutes } from './ticket.routes.js';

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
  registerCategoryRoutes(app);
  registerProductRoutes(app);
  registerCartRoutes(app);
  registerOrderRoutes(app);

  // Register Delivery Partner routes
  registerDeliveryPartnerDocumentsRoutes(app);
  registerDeliveryPartnerVehicleRoutes(app);
  registerDeliveryPartnerBankRoutes(app);
  registerDeliveryRoutes(app);
  registerDeliveryRatingRoutes(app);
  registerWalletRoutes(app);
  registerTicketRoutes(app);

  // Register upload routes
  app.use('/api/upload', uploadRoutes);

  // Create and return HTTP server
  return createServer(app);
}
