/**
 * Dummy Orders for Development
 * Links buyer (userId: 1) with seller products
 */
export const dummyOrders = [
  {
    userId: 1, // buyer@test.com
    sellerId: 2, // seller@test.com
    addressId: 1, // buyer's home address
    orderStatus: 'delivered' as const,
    paymentStatus: 'completed' as const,
    totalAmount: '2499.00',
    discount: '0.00',
    shippingCharges: '50.00',
    taxAmount: '449.82',
    finalAmount: '2998.82',
    deliveryPartnerId: 3, // delivery@test.com
    trackingNumber: 'TRK123456789',
    courierName: 'QuickKart Express',
    notes: 'Please deliver before 6 PM',
  },
  {
    userId: 1, // buyer@test.com
    sellerId: 2, // seller@test.com
    addressId: 1,
    orderStatus: 'shipped' as const,
    paymentStatus: 'completed' as const,
    totalAmount: '1499.00',
    discount: '100.00',
    shippingCharges: '0.00',
    taxAmount: '251.82',
    finalAmount: '1650.82',
    deliveryPartnerId: 3,
    trackingNumber: 'TRK987654321',
    courierName: 'QuickKart Express',
    notes: null,
  },
  {
    userId: 1, // buyer@test.com
    sellerId: 2, // seller@test.com
    addressId: 2, // office address
    orderStatus: 'processing' as const,
    paymentStatus: 'completed' as const,
    totalAmount: '3999.00',
    discount: '200.00',
    shippingCharges: '100.00',
    taxAmount: '701.82',
    finalAmount: '4600.82',
    deliveryPartnerId: null,
    trackingNumber: null,
    courierName: null,
    notes: 'Office delivery - working hours only',
  },
  {
    userId: 1, // buyer@test.com
    sellerId: 2, // seller@test.com
    addressId: 1,
    orderStatus: 'pending' as const,
    paymentStatus: 'pending' as const,
    totalAmount: '799.00',
    discount: '0.00',
    shippingCharges: '50.00',
    taxAmount: '152.82',
    finalAmount: '1001.82',
    deliveryPartnerId: null,
    trackingNumber: null,
    courierName: null,
    notes: null,
  },
];

/**
 * Dummy Order Items
 * Note: productId references will be set after products are seeded
 */
export const dummyOrderItems = [
  // Order 1 items (delivered)
  {
    orderId: 1,
    productId: 1, // Will be mapped to actual product IDs
    quantity: 1,
    price: '2499.00',
    discount: '0.00',
    finalPrice: '2499.00',
  },
  // Order 2 items (shipped)
  {
    orderId: 2,
    productId: 2,
    quantity: 1,
    price: '1499.00',
    discount: '100.00',
    finalPrice: '1399.00',
  },
  // Order 3 items (processing)
  {
    orderId: 3,
    productId: 3,
    quantity: 2,
    price: '1999.00',
    discount: '100.00',
    finalPrice: '1899.00',
  },
  // Order 4 items (pending)
  {
    orderId: 4,
    productId: 4,
    quantity: 1,
    price: '799.00',
    discount: '0.00',
    finalPrice: '799.00',
  },
];
