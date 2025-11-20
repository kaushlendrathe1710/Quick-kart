/**
 * Invoice Generator Utility
 * Generates PDF invoices for orders
 */

interface InvoiceData {
  // Order details
  orderId: number;
  orderDate: Date;

  // Seller details
  sellerName: string;
  sellerBusinessName?: string;
  sellerAddress: string;
  sellerGSTNumber?: string;
  sellerPANNumber?: string;
  sellerEmail: string;
  sellerPhone: string;

  // Buyer details
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };

  // Order items
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    taxRate?: number;
    taxAmount?: string;
    total: string;
  }>;

  // Amounts
  subtotal: string;
  shippingCharges: string;
  taxAmount: string;
  discount: string;
  total: string;

  // Payment
  paymentMethod: string;
  paymentStatus: string;
}

/**
 * Generate invoice HTML template
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const itemsHTML = data.items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.taxRate || 0}%</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">₹${item.total}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice #${data.orderId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 14px; color: #1f2937; line-height: 1.6; }
    .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
    .header h1 { font-size: 28px; color: #2563eb; margin-bottom: 5px; }
    .header .subtitle { color: #6b7280; font-size: 16px; }
    .info-section { display: table; width: 100%; margin-bottom: 30px; }
    .info-col { display: table-cell; width: 50%; vertical-align: top; }
    .info-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 10px 5px; }
    .info-box h3 { font-size: 14px; color: #6b7280; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
    .info-box p { margin: 5px 0; }
    .info-box .label { color: #6b7280; font-size: 12px; }
    .info-box .value { color: #1f2937; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #2563eb; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; }
    th:nth-child(3), th:nth-child(4), th:nth-child(5), th:nth-child(6) { text-align: right; }
    .totals { margin-top: 20px; float: right; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .totals-row.total { font-size: 18px; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; border-bottom: none; margin-top: 10px; padding-top: 15px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .invoice-container { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <h1>TAX INVOICE</h1>
      <p class="subtitle">Invoice #${data.orderId}</p>
    </div>

    <!-- Seller & Buyer Info -->
    <div class="info-section">
      <div class="info-col">
        <div class="info-box">
          <h3>Seller Details</h3>
          <p class="value">${data.sellerBusinessName || data.sellerName}</p>
          <p style="margin: 10px 0;">${data.sellerAddress}</p>
          ${data.sellerGSTNumber ? `<p><span class="label">GSTIN:</span> <span class="value">${data.sellerGSTNumber}</span></p>` : ''}
          ${data.sellerPANNumber ? `<p><span class="label">PAN:</span> <span class="value">${data.sellerPANNumber}</span></p>` : ''}
          <p><span class="label">Email:</span> ${data.sellerEmail}</p>
          <p><span class="label">Phone:</span> ${data.sellerPhone}</p>
        </div>
      </div>
      <div class="info-col">
        <div class="info-box">
          <h3>Bill To</h3>
          <p class="value">${data.buyerName}</p>
          <p style="margin: 10px 0;">
            ${data.buyerAddress.street}<br>
            ${data.buyerAddress.city}, ${data.buyerAddress.state} - ${data.buyerAddress.pincode}
            ${data.buyerAddress.country ? `<br>${data.buyerAddress.country}` : ''}
          </p>
          <p><span class="label">Email:</span> ${data.buyerEmail}</p>
          <p><span class="label">Phone:</span> ${data.buyerPhone}</p>
        </div>
      </div>
    </div>

    <!-- Invoice Info -->
    <div class="info-section">
      <div class="info-col">
        <div class="info-box">
          <p><span class="label">Invoice Date:</span> <span class="value">${new Date(data.orderDate).toLocaleDateString('en-IN')}</span></p>
        </div>
      </div>
      <div class="info-col">
        <div class="info-box">
          <p><span class="label">Payment Method:</span> <span class="value">${data.paymentMethod}</span></p>
          <p><span class="label">Payment Status:</span> <span class="value">${data.paymentStatus}</span></p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 50px;">#</th>
          <th>Product Description</th>
          <th style="width: 80px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Rate</th>
          <th style="width: 80px; text-align: right;">Tax</th>
          <th style="width: 120px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>₹${data.subtotal}</span>
      </div>
      ${
        parseFloat(data.discount) > 0
          ? `
      <div class="totals-row">
        <span>Discount:</span>
        <span>- ₹${data.discount}</span>
      </div>
      `
          : ''
      }
      <div class="totals-row">
        <span>Shipping Charges:</span>
        <span>₹${data.shippingCharges}</span>
      </div>
      <div class="totals-row">
        <span>Tax Amount:</span>
        <span>₹${data.taxAmount}</span>
      </div>
      <div class="totals-row total">
        <span>Total Amount:</span>
        <span>₹${data.total}</span>
      </div>
    </div>
    <div style="clear: both;"></div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Thank you for your business!</strong></p>
      <p style="margin-top: 10px;">This is a computer-generated invoice and does not require a signature.</p>
      <p style="margin-top: 5px;">For any queries, please contact ${data.sellerEmail}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate invoice for an order
 * Returns HTML that can be converted to PDF using a library like puppeteer
 */
export async function generateInvoice(invoiceData: InvoiceData): Promise<string> {
  return generateInvoiceHTML(invoiceData);
}
