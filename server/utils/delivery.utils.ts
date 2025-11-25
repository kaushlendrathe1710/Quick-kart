import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { db } from '@server/db/connect';
import { orders, deliveries, addresses } from '@server/db/schema';
import { eq } from 'drizzle-orm';
import { deliveryService } from '@server/db/services/delivery.service';
import { sellerSettingsService } from '@server/db/services/sellerSettings.service';

/**
 * Helper function to create delivery when order is confirmed
 * Automatically creates a delivery record with pickup and drop locations
 */
export async function createDeliveryForOrder(orderId: number, sellerId: number, buyerId: number) {
  try {
    // Get order details with address
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        address: true,
      },
    });

    if (!order || !order.address) {
      throw new Error('Order or delivery address not found');
    }

    // Get seller's pickup address from settings
    const sellerSettings = await sellerSettingsService.getOrCreateSettings(sellerId);
    const pickupAddress = sellerSettings.pickupAddress as any;

    if (!pickupAddress || !pickupAddress.addressLine1) {
      throw new Error(
        'Seller pickup address not configured. Please update pickup address in settings.'
      );
    }

    // Get seller user info for contact details
    const seller = await db.query.users.findFirst({
      where: eq(orders.sellerId, sellerId),
    });

    if (!seller) {
      throw new Error('Seller information not found');
    }

    // Prepare pickup location
    const pickupLocation = {
      address: `${pickupAddress.addressLine1}, ${pickupAddress.addressLine2 || ''}, ${pickupAddress.city}, ${pickupAddress.state} ${pickupAddress.pincode}`,
      lat: null, // Can be geocoded later
      lng: null,
      contactName: pickupAddress.name || seller.name || 'Store',
      contactPhone: pickupAddress.phone || seller.contactNumber || '',
    };

    // Prepare drop location from order address
    const dropLocation = {
      address: `${order.address.addressLine}, ${order.address.city}, ${order.address.state || ''} ${order.address.postalCode}`,
      lat: null, // Can be geocoded later
      lng: null,
      contactName: 'Customer', // Address doesn't have recipient name
      contactPhone: order.address.contactNumber || '',
    };

    // Calculate delivery fee (can be based on distance, default for now)
    const deliveryFee = order.shippingCharges || '50.00';

    // Create delivery
    const delivery = await deliveryService.createDelivery({
      orderId,
      buyerId,
      pickupLocation: pickupLocation as any,
      dropLocation: dropLocation as any,
      status: 'pending',
      deliveryFee,
      tip: '0.00',
    });

    return delivery;
  } catch (error) {
    console.error('Error creating delivery for order:', error);
    throw error;
  }
}

/**
 * Update order status and create delivery if confirmed
 * This is called when seller confirms/accepts an order
 */
export async function confirmOrderAndCreateDelivery(
  orderId: number,
  sellerId: number,
  newStatus: string
) {
  try {
    // Get order details
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        orderStatus: newStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    // If status is being changed to 'confirmed' or 'processing', create delivery
    if (
      (newStatus === 'confirmed' || newStatus === 'processing') &&
      order.orderStatus !== 'confirmed' &&
      order.orderStatus !== 'processing'
    ) {
      // Check if delivery already exists
      const existingDelivery = await deliveryService.getDeliveryByOrderId(orderId);

      if (!existingDelivery) {
        // Create new delivery
        const delivery = await createDeliveryForOrder(orderId, sellerId, order.userId);
        return { order: updatedOrder, delivery, deliveryCreated: true };
      }
    }

    return { order: updatedOrder, delivery: null, deliveryCreated: false };
  } catch (error) {
    console.error('Error confirming order and creating delivery:', error);
    throw error;
  }
}
