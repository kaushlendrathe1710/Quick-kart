/**
 * Shipping Label Generator Utility
 * Generates PDF shipping labels for orders
 */

interface ShippingLabelData {
  // Order details
  orderId: number;
  orderDate: Date;

  // Tracking
  trackingNumber?: string;

  // Pickup details
  pickup: {
    name: string;
    businessName?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };

  // Delivery details
  delivery: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };

  // Package details
  package: {
    weight?: number; // in kg
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    itemCount: number;
    description: string;
  };

  // Payment
  paymentMethod: string;
  codAmount?: string;
}

/**
 * Generate shipping label HTML template
 */
export function generateShippingLabelHTML(data: ShippingLabelData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shipping Label - Order #${data.orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; }
    .label-container { width: 4in; height: 6in; padding: 10px; border: 2px solid #000; position: relative; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
    .header h1 { font-size: 20px; margin-bottom: 5px; }
    .tracking { text-align: center; margin: 15px 0; padding: 10px; background: #f0f0f0; border: 2px dashed #000; }
    .tracking-number { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
    .section { margin: 15px 0; padding: 10px; border: 1px solid #000; }
    .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
    .address-line { margin: 3px 0; }
    .large-text { font-size: 16px; font-weight: bold; margin: 5px 0; }
    .label { font-size: 10px; color: #666; display: inline-block; width: 80px; }
    .value { font-weight: bold; }
    .barcode { text-align: center; margin: 15px 0; }
    .barcode-image { height: 60px; margin: 10px 0; }
    .footer { position: absolute; bottom: 10px; left: 10px; right: 10px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 5px; }
    .highlight { background: #ffeb3b; padding: 2px 5px; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .label-container { border: 2px solid #000; }
    }
  </style>
</head>
<body>
  <div class="label-container">
    <!-- Header -->
    <div class="header">
      <h1>SHIPPING LABEL</h1>
      <div>Order #${data.orderId}</div>
    </div>

    <!-- Tracking Number -->
    ${
      data.trackingNumber
        ? `
    <div class="tracking">
      <div style="font-size: 10px; margin-bottom: 5px;">TRACKING NUMBER</div>
      <div class="tracking-number">${data.trackingNumber}</div>
    </div>
    `
        : ''
    }

    <!-- From Address -->
    <div class="section">
      <div class="section-title">📦 PICKUP FROM</div>
      <div class="large-text">${data.pickup.businessName || data.pickup.name}</div>
      <div class="address-line">${data.pickup.address}</div>
      <div class="address-line">${data.pickup.city}, ${data.pickup.state} - <strong>${data.pickup.pincode}</strong></div>
      <div class="address-line">📱 ${data.pickup.phone}</div>
    </div>

    <!-- To Address -->
    <div class="section">
      <div class="section-title">🚚 DELIVER TO</div>
      <div class="large-text">${data.delivery.name}</div>
      <div class="address-line">${data.delivery.address}</div>
      <div class="address-line">${data.delivery.city}, ${data.delivery.state} - <strong>${data.delivery.pincode}</strong></div>
      <div class="address-line">📱 ${data.delivery.phone}</div>
    </div>

    <!-- Package Info -->
    <div class="section">
      <div class="section-title">📋 PACKAGE DETAILS</div>
      <div style="display: flex; justify-content: space-between; margin: 5px 0;">
        <div>
          <span class="label">Items:</span> 
          <span class="value">${data.package.itemCount}</span>
        </div>
        ${
          data.package.weight
            ? `
        <div>
          <span class="label">Weight:</span> 
          <span class="value">${data.package.weight} kg</span>
        </div>
        `
            : ''
        }
      </div>
      ${
        data.package.dimensions
          ? `
      <div style="margin: 5px 0;">
        <span class="label">Dimensions:</span> 
        <span class="value">${data.package.dimensions.length} x ${data.package.dimensions.width} x ${data.package.dimensions.height} cm</span>
      </div>
      `
          : ''
      }
      <div style="margin: 5px 0;">
        <span class="label">Description:</span> 
        <span class="value">${data.package.description}</span>
      </div>
    </div>

    <!-- Payment Info -->
    <div class="section">
      <div class="section-title">💳 PAYMENT</div>
      <div style="margin: 5px 0;">
        <span class="label">Method:</span> 
        <span class="value">${data.paymentMethod}</span>
      </div>
      ${
        data.codAmount
          ? `
      <div style="margin: 5px 0;">
        <span class="label">COD Amount:</span> 
        <span class="value highlight">₹${data.codAmount}</span>
      </div>
      `
          : ''
      }
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>Handle with care • Fragile items</div>
      <div>Date: ${new Date(data.orderDate).toLocaleDateString('en-IN')}</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate shipping label for an order
 * Returns HTML that can be converted to PDF using a library like puppeteer
 */
export async function generateShippingLabel(labelData: ShippingLabelData): Promise<string> {
  return generateShippingLabelHTML(labelData);
}
