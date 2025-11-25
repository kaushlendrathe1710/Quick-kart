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
  variantId: z.number().int().positive().optional(),
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
    price: number;
    stock: number;
    thumbnail: string | null;
    imageUrls: string | null;
    categoryId: number;
  };
  variant?: {
    id: number;
    sku?: string | null;
    color?: string | null;
    size?: string | null;
    price: number;
    stock: number;
    images?: string | null;
  } | null;
}

export interface CartWithItems extends Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: string;
}
