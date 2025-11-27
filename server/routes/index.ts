import type { Express } from 'express';
import { createServer, type Server } from 'http';

// Auth Routes
import { registerAuthRoutes } from './auth/auth.routes.js';

// Buyer Routes
import { registerAddressRoutes } from './buyer/address.routes.js';
import { registerPaymentRoutes } from './buyer/payment.routes.js';
import { registerNotificationRoutes } from './buyer/notification.routes.js';
import { registerCartRoutes } from './buyer/cart.routes.js';
import { registerOrderRoutes } from './buyer/order.routes.js';
import { registerBuyerReviewRoutes } from './buyer/review.routes.js';
import { registerBuyerDeliveryRatingRoutes } from './buyer/deliveryRating.routes.js';
import { registerWishlistRoutes } from './buyer/wishlist.routes.js';

// Admin Routes
import { registerAdminDeliveryRoutes } from './admin/delivery.routes.js';
import { registerAdminWalletRoutes } from './admin/wallet.routes.js';
import { registerAdminTicketRoutes } from './admin/ticket.routes.js';
import { registerAdminSellerRoutes } from './admin/seller.routes.js';
import { registerAdminDashboardRoutes } from './admin/dashboard.routes.js';
import { registerAdminProductRoutes } from './admin/product.routes.js';
import { registerAdminCategoryRoutes } from './admin/category.routes.js';
import { registerAdminDeliveryPartnerRoutes } from './admin/deliveryPartner.routes.js';
import { registerAdminUserRoutes } from './admin/user.routes.js';
import { registerAdminOrderRoutes } from './admin/order.routes.js';
import { registerAdminBannerRoutes } from './admin/banner.routes.js';
import { registerAdminGiftCardRoutes } from './admin/giftCard.routes.js';
import { registerAdminRewardRoutes } from './admin/reward.routes.js';

// Seller Routes
import {
  registerSellerDashboardRoutes,
  registerSellerProfileRoutes,
  registerSellerDocumentsRoutes,
  registerSellerAnalyticsRoutes,
  registerSellerProductRoutes,
  registerSellerOrderRoutes,
  registerSellerReviewRoutes,
  registerSellerBusinessRoutes,
  registerSellerSettingsRoutes,
  registerSellerStoreRoutes,
} from './seller/index.js';
import { registerSellerDeliveryRoutes } from './seller/delivery.routes.js';

// Delivery Partner Routes
import { registerDeliveryPartnerDocumentsRoutes } from './deliveryPartner/deliveryPartnerDocuments.routes.js';
import { registerDeliveryPartnerVehicleRoutes } from './deliveryPartner/deliveryPartnerVehicle.routes.js';
import { registerDeliveryPartnerBankRoutes } from './deliveryPartner/deliveryPartnerBank.routes.js';
import { registerDeliveryPartnerDeliveryRoutes } from './deliveryPartner/delivery.routes.js';
import { registerDeliveryPartnerRatingRoutes } from './deliveryPartner/deliveryRating.routes.js';
import { registerDeliveryPartnerWalletRoutes } from './deliveryPartner/wallet.routes.js';
import { registerTicketRoutes } from './deliveryPartner/ticket.routes.js';

// Public Routes
import { registerCategoryRoutes } from './public/category.routes.js';
import { registerProductRoutes } from './public/product.routes.js';
import { registerPublicDeliveryRatingRoutes } from './public/deliveryRating.routes.js';
import { registerSubcategoryRoutes } from './public/subcategory.routes.js';
import { registerPublicBannerRoutes } from './public/banner.routes.js';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Quick-kart API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // ============================================
  // AUTH ROUTES
  // ============================================
  registerAuthRoutes(app);

  // ============================================
  // BUYER ROUTES
  // ============================================
  registerAddressRoutes(app);
  registerPaymentRoutes(app);
  registerNotificationRoutes(app);
  registerCartRoutes(app);
  registerWishlistRoutes(app);
  registerOrderRoutes(app);
  registerBuyerDeliveryRatingRoutes(app);
  registerBuyerReviewRoutes(app);

  // ============================================
  // SELLER ROUTES
  // ============================================
  registerSellerDashboardRoutes(app);
  registerSellerProfileRoutes(app);
  registerSellerDocumentsRoutes(app);
  registerSellerAnalyticsRoutes(app);
  registerSellerDeliveryRoutes(app);
  registerSellerProductRoutes(app);
  registerSellerOrderRoutes(app);
  registerSellerReviewRoutes(app);
  registerSellerBusinessRoutes(app);
  registerSellerSettingsRoutes(app);
  registerSellerStoreRoutes(app);

  // ============================================
  // ADMIN ROUTES
  // ============================================
  registerAdminDeliveryRoutes(app);
  registerAdminWalletRoutes(app);
  registerAdminTicketRoutes(app);
  registerAdminSellerRoutes(app);
  registerAdminDashboardRoutes(app);
  registerAdminProductRoutes(app);
  registerAdminCategoryRoutes(app);
  registerAdminDeliveryPartnerRoutes(app);
  registerAdminUserRoutes(app);
  registerAdminOrderRoutes(app);
  registerAdminBannerRoutes(app);
  registerAdminGiftCardRoutes(app);
  registerAdminRewardRoutes(app);

  // ============================================
  // DELIVERY PARTNER ROUTES
  // ============================================
  registerDeliveryPartnerDocumentsRoutes(app);
  registerDeliveryPartnerVehicleRoutes(app);
  registerDeliveryPartnerBankRoutes(app);
  registerDeliveryPartnerDeliveryRoutes(app);
  registerDeliveryPartnerRatingRoutes(app);
  registerDeliveryPartnerWalletRoutes(app);
  registerTicketRoutes(app);

  // ============================================
  // PUBLIC ROUTES (No Authentication Required)
  // ============================================
  registerCategoryRoutes(app);
  registerSubcategoryRoutes(app);
  registerProductRoutes(app);
  registerPublicDeliveryRatingRoutes(app);
  registerPublicBannerRoutes(app);

  // Create and return HTTP server
  return createServer(app);
}
