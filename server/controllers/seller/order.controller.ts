import { Response } from 'express';
import { AuthenticatedRequest } from '@server/types';
import { db } from '@server/db/connect';
import { orders, orderItems, addresses } from '@server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateInvoice } from '@server/utils/invoiceGenerator';
import { generateShippingLabel } from '@server/utils/shippingLabelGenerator';
import { getPaginationParams, createPaginatedResponse } from '@server/utils/pagination.utils';

/**
 * Seller Order Controller
 * Handles order management and document generation for sellers
 */
export class SellerOrderController {
  /**
   * Get seller's orders with pagination
   * GET /api/seller/orders?page=1&limit=20&status=pending
   */
  static async getOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const { page, limit, offset } = getPaginationParams(req);
      const status = req.query.status as string | undefined;

      // Build where conditions
      const conditions = [eq(orders.sellerId, sellerId)];
      if (status) conditions.push(eq(orders.orderStatus, status as any));

      const sellerOrders = await db.query.orders.findMany({
        where: and(...conditions),
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
        limit,
        offset,
        with: {
          user: {
            columns: {
              name: true,
              email: true,
              contactNumber: true,
            },
          },
          address: true,
          orderItems: {
            where: eq(orderItems.sellerId, sellerId),
            with: {
              product: {
                columns: {
                  name: true,
                  thumbnail: true,
                  imageUrls: true,
                },
              },
            },
          },
        },
      });

      // Get total count
      const allOrders = await db.query.orders.findMany({
        where: and(...conditions),
      });

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        ...createPaginatedResponse(sellerOrders, page, limit, allOrders.length),
      });
    } catch (error) {
      console.error('Error getting seller orders:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve orders',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get single order details
   * GET /api/seller/orders/:id
   */
  static async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
        });
      }

      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.sellerId, sellerId)),
        with: {
          user: true,
          address: true,
          orderItems: {
            where: eq(orderItems.sellerId, sellerId),
            with: {
              product: true,
            },
          },
          delivery: true,
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      });
    } catch (error) {
      console.error('Error getting order:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve order',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate invoice for order
   * GET /api/seller/orders/:id/invoice
   */
  static async generateInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
        });
      }

      // Get order with full details
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.sellerId, sellerId)),
        with: {
          user: true,
          address: true,
          orderItems: {
            where: eq(orderItems.sellerId, sellerId),
            with: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Get seller info
      const seller = await db.query.users.findFirst({
        where: eq(orders.sellerId, sellerId),
        with: {
          sellerInfo: true,
        },
      });

      if (!seller || !seller.sellerInfo) {
        return res.status(404).json({
          success: false,
          message: 'Seller information not found',
        });
      }

      // Prepare invoice data
      const invoiceData = {
        orderId: order.id,
        orderDate: order.createdAt || new Date(),
        sellerName: seller.name || '',
        sellerBusinessName: seller.sellerInfo.businessName || undefined,
        sellerAddress: seller.sellerInfo.businessAddress || '',
        sellerGSTNumber: seller.sellerInfo.gstNumber || undefined,
        sellerPANNumber: seller.sellerInfo.panNumber || undefined,
        sellerEmail: seller.email,
        sellerPhone: seller.contactNumber || '',
        buyerName: order.user.name || '',
        buyerEmail: order.user.email,
        buyerPhone: order.user.contactNumber || '',
        buyerAddress: {
          street: order.address.addressLine,
          city: order.address.city,
          state: order.address.state || '',
          pincode: order.address.postalCode,
          country: order.address.country || undefined,
        },
        items: order.orderItems.map((item) => ({
          name: item.product?.name || 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          taxRate: 0, // Can be calculated from product gstRate
          taxAmount: '0',
          total: (parseFloat(item.price) * item.quantity).toFixed(2),
        })),
        subtotal: order.totalAmount,
        shippingCharges: order.shippingCharges || '0',
        taxAmount: order.taxAmount || '0',
        discount: order.discount || '0',
        total: order.finalAmount,
        paymentMethod: 'Online', // Can be extended
        paymentStatus: order.paymentStatus,
      };

      // Generate invoice HTML
      const invoiceHTML = await generateInvoice(invoiceData);

      // Return HTML or can be converted to PDF
      res.setHeader('Content-Type', 'text/html');
      return res.send(invoiceHTML);
    } catch (error) {
      console.error('Error generating invoice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate invoice',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate shipping label for order
   * GET /api/seller/orders/:id/shipping-label
   */
  static async generateShippingLabel(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
        });
      }

      // Get order with full details
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.sellerId, sellerId)),
        with: {
          user: true,
          address: true,
          orderItems: {
            where: eq(orderItems.sellerId, sellerId),
            with: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Get seller info with pickup address
      const seller = await db.query.users.findFirst({
        where: eq(orders.sellerId, sellerId),
        with: {
          sellerInfo: true,
          sellerSettings: true,
        },
      });

      if (!seller || !seller.sellerInfo) {
        return res.status(404).json({
          success: false,
          message: 'Seller information not found',
        });
      }

      const pickupAddress = (seller.sellerSettings?.pickupAddress as any) || {
        address: seller.sellerInfo.businessAddress,
        city: '',
        state: '',
        pincode: '',
      };

      // Prepare shipping label data
      const labelData = {
        orderId: order.id,
        orderDate: order.createdAt || new Date(),
        trackingNumber: order.trackingNumber || undefined,
        pickup: {
          name: seller.name || '',
          businessName: seller.sellerInfo.businessName || undefined,
          address: pickupAddress.address || seller.sellerInfo.businessAddress || '',
          city: pickupAddress.city || '',
          state: pickupAddress.state || '',
          pincode: pickupAddress.pincode || '',
          phone: seller.contactNumber || '',
        },
        delivery: {
          name: order.user.name || '',
          address: order.address.addressLine,
          city: order.address.city,
          state: order.address.state || '',
          pincode: order.address.postalCode,
          phone: order.user.contactNumber || '',
        },
        package: {
          weight: order.orderItems[0]?.product?.weight
            ? parseFloat(order.orderItems[0].product.weight)
            : undefined,
          dimensions: order.orderItems[0]?.product?.length
            ? {
                length: parseFloat(order.orderItems[0].product.length),
                width: parseFloat(order.orderItems[0].product.width || '0'),
                height: parseFloat(order.orderItems[0].product.height || '0'),
              }
            : undefined,
          itemCount: order.orderItems.length,
          description: order.orderItems.map((item) => item.product?.name).join(', '),
        },
        paymentMethod: order.paymentStatus === 'completed' ? 'Prepaid' : 'COD',
        codAmount: order.paymentStatus !== 'completed' ? order.finalAmount : undefined,
      };

      // Generate shipping label HTML
      const labelHTML = await generateShippingLabel(labelData);

      // Return HTML
      res.setHeader('Content-Type', 'text/html');
      return res.send(labelHTML);
    } catch (error) {
      console.error('Error generating shipping label:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate shipping label',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update order status
   * PATCH /api/seller/orders/:id/status
   */
  static async updateOrderStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const sellerId = req.user!.id;
      const orderId = parseInt(req.params.id);
      const { status, trackingNumber, courierName } = req.body;

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
        });
      }

      // Verify order ownership
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, orderId), eq(orders.sellerId, sellerId)),
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Update order
      const [updatedOrder] = await db
        .update(orders)
        .set({
          orderStatus: status,
          trackingNumber: trackingNumber || order.trackingNumber,
          courierName: courierName || order.courierName,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();

      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update order status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
