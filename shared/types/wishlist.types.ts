import { z } from 'zod';
import { wishlists } from '@server/db/schema';

// TypeScript types
export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = typeof wishlists.$inferInsert;

// Validation schemas
export const addToWishlistSchema = z.object({
  productId: z.number().int().positive(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;

// Extended type for API responses with product details
export interface WishlistItemWithProduct extends Wishlist {
  product: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    mrp: number | null;
    imageUrl: string | null;
    images: string | null;
    category: string;
    stock: number | null;
    rating: string | null;
    reviewCount: number | null;
    approved: boolean | null;
  };
}
