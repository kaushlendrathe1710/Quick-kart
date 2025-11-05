import { relations } from 'drizzle-orm';
import { users, session } from './user.schema';
import { categories } from './category.schema';
import { products } from './product.schema';
import { addresses } from './address.schema';
import { paymentMethods } from './paymentMethod.schema';
import { notifications } from './notification.schema';
import { orders, orderItems } from './order.schema';

// Session table relations (standalone table for express-session)
export const sessionRelations = relations(session, () => ({}));

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  paymentMethods: many(paymentMethods),
  notifications: many(notifications),
  orders: many(orders),
  products: many(products), // Products they sell (as seller)
}));

// Category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// Product relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
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
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  deliveryPartner: one(users, {
    fields: [orders.deliveryPartnerId],
    references: [users.id],
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
