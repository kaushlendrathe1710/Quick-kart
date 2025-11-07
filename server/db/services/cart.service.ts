import { db } from '@server/db/connect';
import { carts, cartItems, products } from '@server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { CartWithItems, CartItemWithProduct } from '@shared/types';

/**
 * Cart Service
 * Database operations for shopping cart management
 */

/**
 * Get or create cart for a user
 */
export async function getOrCreateCart(userId: number): Promise<number> {
  // Check if cart exists
  const existingCart = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);

  if (existingCart.length > 0) {
    return existingCart[0].id;
  }

  // Create new cart
  const [newCart] = await db
    .insert(carts)
    .values({
      userId,
    })
    .returning();

  return newCart.id;
}

/**
 * Get user's cart with all items and product details
 */
export async function getUserCart(userId: number): Promise<CartWithItems | null> {
  // Get or create cart
  const cartId = await getOrCreateCart(userId);

  // Fetch cart with items and product details
  const cart = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);

  if (!cart.length) return null;

  // Fetch cart items with product details
  const items = await db
    .select({
      id: cartItems.id,
      cartId: cartItems.cartId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      price: cartItems.price,
      createdAt: cartItems.createdAt,
      updatedAt: cartItems.updatedAt,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        discount: products.discount,
        stock: products.stock,
        images: products.images,
        categoryId: products.categoryId,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  // Calculate total items and subtotal
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items
    .reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0)
    .toFixed(2);

  return {
    ...cart[0],
    items: items as CartItemWithProduct[],
    totalItems,
    subtotal,
  };
}

/**
 * Add product to cart or update quantity if already exists
 */
export async function addToCart(
  userId: number,
  productId: number,
  quantity: number
): Promise<void> {
  // Get or create cart
  const cartId = await getOrCreateCart(userId);

  // Get product details for price
  const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);

  if (!product.length) {
    throw new Error('Product not found');
  }

  if (!product[0].isActive) {
    throw new Error('Product is not available');
  }

  if (product[0].stock < quantity) {
    throw new Error('Insufficient stock');
  }

  // Check if item already exists in cart
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existingItem.length > 0) {
    // Update quantity
    const newQuantity = existingItem[0].quantity + quantity;

    if (product[0].stock < newQuantity) {
      throw new Error('Insufficient stock');
    }

    await db
      .update(cartItems)
      .set({
        quantity: newQuantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, existingItem[0].id));
  } else {
    // Add new item
    await db.insert(cartItems).values({
      cartId,
      productId,
      quantity,
      price: product[0].price,
    });
  }

  // Update cart timestamp
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

/**
 * Update cart item quantity
 */
export async function updateCartItemQuantity(
  userId: number,
  productId: number,
  quantity: number
): Promise<void> {
  // Get cart
  const cartId = await getOrCreateCart(userId);

  // Get product for stock validation
  const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);

  if (!product.length) {
    throw new Error('Product not found');
  }

  if (product[0].stock < quantity) {
    throw new Error('Insufficient stock');
  }

  // Update cart item
  const result = await db
    .update(cartItems)
    .set({
      quantity,
      updatedAt: new Date(),
    })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .returning();

  if (!result.length) {
    throw new Error('Cart item not found');
  }

  // Update cart timestamp
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

/**
 * Remove product from cart
 */
export async function removeFromCart(userId: number, productId: number): Promise<void> {
  // Get cart
  const cartId = await getOrCreateCart(userId);

  // Delete cart item
  const result = await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .returning();

  if (!result.length) {
    throw new Error('Cart item not found');
  }

  // Update cart timestamp
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

/**
 * Clear all items from cart
 */
export async function clearCart(userId: number): Promise<void> {
  // Get cart
  const cartId = await getOrCreateCart(userId);

  // Delete all cart items
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

  // Update cart timestamp
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

/**
 * Get cart items count
 */
export async function getCartItemsCount(userId: number): Promise<number> {
  const cartId = await getOrCreateCart(userId);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  return result[0]?.count || 0;
}
