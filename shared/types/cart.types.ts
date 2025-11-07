import { z } from 'zod';
import { carts, cartItems } from '@server/db/schema';

// TypeScript types
export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Validation schemas
export const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().min(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().min(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

// Extended types for API responses with product details
export interface CartItemWithProduct extends CartItem {
  product?: {
    id: number;
    name: string;
    price: string;
    discount: string | null;
    stock: number;
    images: string[] | null;
    categoryId: number;
  };
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: string;
}
