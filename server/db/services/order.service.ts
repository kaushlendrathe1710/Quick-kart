import { db } from '@server/db/connect';
import { orders, orderItems, products, cartItems, carts, addresses } from '@server/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { Order, OrderItem } from '@shared/types';
import { clearCart } from './cart.service';

/**
 * Order Service
 * Database operations for order management with transaction support
 */

interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * Create order from user's cart
 * Uses transaction to ensure data consistency
 */
export async function createOrderFromCart(
  userId: number,
  addressId: number,
  notes?: string
): Promise<OrderWithItems> {
  return await db.transaction(async (tx) => {
    // 1. Validate that the address belongs to the user
    const address = await tx
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    if (!address.length) {
      throw new Error('Address not found or does not belong to user');
    }

    // 2. Get user's cart
    const cart = await tx.select().from(carts).where(eq(carts.userId, userId)).limit(1);

    if (!cart.length) {
      throw new Error('Cart not found');
    }

    const cartId = cart[0].id;

    // 3. Get cart items with product details
    const items = await tx
      .select({
        cartItem: cartItems,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    if (items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 4. Validate stock and calculate totals
    let totalAmount = 0;
    let totalDiscount = 0;

    for (const item of items) {
      const { cartItem, product } = item;

      // Check if product is active
      if (!product.isActive) {
        throw new Error(`Product "${product.name}" is no longer available`);
      }

      // Check stock availability
      if (product.stock < cartItem.quantity) {
        throw new Error(
          `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`
        );
      }

      // Calculate item total
      const itemPrice = product.price;
      const itemTotal = itemPrice * cartItem.quantity;

      totalAmount += itemTotal;
    }

    const finalAmount = totalAmount - totalDiscount;

    // 5. Create order
    const [newOrder] = await tx
      .insert(orders)
      .values({
        userId,
        addressId,
        orderStatus: 'pending',
        paymentStatus: 'pending',
        totalAmount: totalAmount.toFixed(2),
        discount: totalDiscount.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        notes: notes || null,
      })
      .returning();

    // 6. Create order items and update product stock
    const createdOrderItems: OrderItem[] = [];

    for (const item of items) {
      const { cartItem, product } = item;

      const itemPrice = product.price;
      const itemTotal = itemPrice * cartItem.quantity;

      // Create order item
      const [orderItem] = await tx
        .insert(orderItems)
        .values({
          orderId: newOrder.id,
          productId: product.id,
          quantity: cartItem.quantity,
          price: product.price.toString(),
          discount: '0',
          finalPrice: itemTotal.toFixed(2),
        })
        .returning();

      createdOrderItems.push(orderItem);

      // Update product stock
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} - ${cartItem.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, product.id));
    }

    // 7. Clear cart items
    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));

    // 8. Update cart timestamp
    await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));

    return {
      ...newOrder,
      items: createdOrderItems,
    };
  });
}

/**
 * Get all orders for a user with pagination
 */
export async function getUserOrders(
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ orders: OrderWithItems[]; totalCount: number; totalPages: number }> {
  // Validate and cap limit
  const validLimit = Math.min(Math.max(1, limit), 10);
  const offset = (page - 1) * validLimit;

  // Get orders with items using query API
  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: {
      orderItems: true,
    },
    orderBy: desc(orders.createdAt),
    limit: validLimit,
    offset: offset,
  });

  // Get total count for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.userId, userId));

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / validLimit);

  // Transform to match OrderWithItems interface
  const ordersWithItems: OrderWithItems[] = userOrders.map((order) => ({
    ...order,
    items: order.orderItems,
  }));

  return {
    orders: ordersWithItems,
    totalCount,
    totalPages,
  };
}

/**
 * Get order by ID with items (only if user owns it)
 */
export async function getOrderById(
  orderId: number,
  userId: number
): Promise<OrderWithItems | null> {
  // Get order
  const order = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order.length) {
    return null;
  }

  // Get order items
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  return {
    ...order[0],
    items,
  };
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: number,
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
): Promise<void> {
  await db
    .update(orders)
    .set({
      orderStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
): Promise<void> {
  await db
    .update(orders)
    .set({
      paymentStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));
}

/**
 * Cancel order and restore product stock
 */
export async function cancelOrder(orderId: number, userId: number): Promise<void> {
  await db.transaction(async (tx) => {
    // Get order
    const order = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order.length) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled', 'refunded'].includes(order[0].orderStatus)) {
      throw new Error('Order cannot be cancelled');
    }

    // Get order items
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    // Restore product stock
    for (const item of items) {
      await tx
        .update(products)
        .set({
          stock: sql`${products.stock} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId));
    }

    // Update order status
    await tx
      .update(orders)
      .set({
        orderStatus: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  });
}
