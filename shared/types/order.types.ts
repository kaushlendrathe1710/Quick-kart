import { z } from 'zod';
import { orders, orderItems, orderStatusEnum, paymentStatusEnum } from '@server/db/schema';

// TypeScript types
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];

// Validation schemas
export const createOrderSchema = z.object({
  addressId: z.number().int().positive(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  discount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  finalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive(),
      price: z.string().regex(/^\d+(\.\d{1,2})?$/),
      discount: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/)
        .optional(),
      finalPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
    })
  ),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
