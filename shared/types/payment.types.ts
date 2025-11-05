import { z } from 'zod';
import { paymentMethods, cardTypeEnum } from '@server/db/schema';

// TypeScript types
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;
export type CardType = (typeof cardTypeEnum.enumValues)[number];

// Validation schemas
export const createPaymentMethodSchema = z.object({
  cardHolderName: z.string().min(2).max(100),
  cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Invalid month (01-12)'),
  expiryYear: z.string().regex(/^\d{4}$/, 'Invalid year (YYYY)'),
  cardType: z.enum(['Visa', 'MasterCard', 'American Express', 'Discover', 'Rupay', 'Other']),
  isDefault: z.boolean().optional(),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial();

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
