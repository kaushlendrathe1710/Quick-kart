import { relations } from 'drizzle-orm';
import { users, session, sellerInfo } from './user.schema';
import { categories, subcategories } from './category.schema';
import { products } from './product.schema';
import { productVariants } from './productVariant.schema';
import { carts, cartItems } from './cart.schema';
import { addresses } from './address.schema';
import { paymentMethods } from './paymentMethod.schema';
import { notifications } from './notification.schema';
import { orders, orderItems } from './order.schema';
import { sellerSettings } from './sellerSettings.schema';
import { sellerDocuments } from './sellerDocuments.schema';
import { sellerAnalytics } from './sellerAnalytics.schema';
import { deliveries } from './delivery.schema';
import { reviews, reviewImages, reviewHelpful, reviewReplies } from './review.schema';
import { wishlists } from './wishlist.schema';

// Session table relations (standalone table for express-session)
export const sessionRelations = relations(session, () => ({}));

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  addresses: many(addresses),
  paymentMethods: many(paymentMethods),
  notifications: many(notifications),
  ordersAsBuyer: many(orders, { relationName: 'buyer_orders' }),
  ordersAsSeller: many(orders, { relationName: 'seller_orders' }),
  ordersAsDeliveryPartner: many(orders, { relationName: 'delivery_partner_orders' }),
  products: many(products), // Products they sell (as seller)
  carts: many(carts),
  reviews: many(reviews), // Reviews they wrote
  reviewReplies: many(reviewReplies), // Review replies they wrote
  reviewHelpful: many(reviewHelpful), // Reviews they marked helpful
  wishlists: many(wishlists), // Products they saved to wishlist
  sellerInfo: one(sellerInfo, {
    fields: [users.id],
    references: [sellerInfo.userId],
  }),
  sellerSettings: one(sellerSettings, {
    fields: [users.id],
    references: [sellerSettings.sellerId],
  }),
  sellerDocuments: many(sellerDocuments),
  sellerAnalytics: many(sellerAnalytics),
}));

// Category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  subcategories: many(subcategories),
}));

// Subcategory relations
export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  products: many(products),
}));

// Product relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  reviews: many(reviews),
  variants: many(productVariants),
  wishlists: many(wishlists), // Users who saved this product
}));

// Product Variant relations
export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

// Cart relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  cartItems: many(cartItems),
}));

// Cart Item relations
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Address relations
export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

// Payment Method relations
export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Order relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.userId],
    references: [users.id],
    relationName: 'buyer_orders',
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: 'seller_orders',
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  deliveryPartner: one(users, {
    fields: [orders.deliveryPartnerId],
    references: [users.id],
    relationName: 'delivery_partner_orders',
  }),
  delivery: one(deliveries, {
    fields: [orders.id],
    references: [deliveries.orderId],
  }),
  orderItems: many(orderItems),
}));

// Order Item relations
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Seller Info relations
export const sellerInfoRelations = relations(sellerInfo, ({ one }) => ({
  user: one(users, {
    fields: [sellerInfo.userId],
    references: [users.id],
  }),
}));

// Seller Settings relations
export const sellerSettingsRelations = relations(sellerSettings, ({ one }) => ({
  seller: one(users, {
    fields: [sellerSettings.sellerId],
    references: [users.id],
  }),
}));

// Seller Documents relations
export const sellerDocumentsRelations = relations(sellerDocuments, ({ one }) => ({
  seller: one(users, {
    fields: [sellerDocuments.sellerId],
    references: [users.id],
  }),
}));

// Seller Analytics relations
export const sellerAnalyticsRelations = relations(sellerAnalytics, ({ one }) => ({
  seller: one(users, {
    fields: [sellerAnalytics.sellerId],
    references: [users.id],
  }),
}));

// Delivery relations
export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id],
  }),
  deliveryPartner: one(users, {
    fields: [deliveries.deliveryPartnerId],
    references: [users.id],
  }),
  buyer: one(users, {
    fields: [deliveries.buyerId],
    references: [users.id],
  }),
}));

// Review relations
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  images: many(reviewImages),
  replies: many(reviewReplies),
  helpfulVotes: many(reviewHelpful),
}));

// Review Images relations
export const reviewImagesRelations = relations(reviewImages, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewImages.reviewId],
    references: [reviews.id],
  }),
}));

// Review Helpful relations
export const reviewHelpfulRelations = relations(reviewHelpful, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewHelpful.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewHelpful.userId],
    references: [users.id],
  }),
}));

// Review Replies relations
export const reviewRepliesRelations = relations(reviewReplies, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewReplies.reviewId],
    references: [reviews.id],
  }),
  user: one(users, {
    fields: [reviewReplies.userId],
    references: [users.id],
  }),
}));

// Wishlist relations
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));
