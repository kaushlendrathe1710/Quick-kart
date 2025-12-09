import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay configuration
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Verify Razorpay payment signature
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Signature from Razorpay
 * @returns boolean - true if signature is valid
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay signature:', error);
    return false;
  }
}

/**
 * Verify Razorpay webhook signature
 * @param body - Webhook body
 * @param signature - Signature from Razorpay webhook
 * @returns boolean - true if signature is valid
 */
export function verifyRazorpayWebhookSignature(body: string, signature: string): boolean {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying Razorpay webhook signature:', error);
    return false;
  }
}

/**
 * Create Razorpay order
 * @param amount - Amount in paise (1 INR = 100 paise)
 * @param currency - Currency code (default: INR)
 * @param receipt - Receipt ID
 * @param notes - Additional notes
 * @returns Razorpay order object
 */
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes?: Record<string, string>
) {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create Razorpay order');
  }
}

/**
 * Fetch payment details from Razorpay
 * @param paymentId - Razorpay payment ID
 * @returns Payment details
 */
export async function fetchPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
}

/**
 * Create a refund
 * @param paymentId - Razorpay payment ID
 * @param amount - Amount to refund in paise (optional, full refund if not provided)
 * @returns Refund object
 */
export async function createRefund(paymentId: string, amount?: number) {
  try {
    const options: any = {
      payment_id: paymentId,
    };

    if (amount) {
      options.amount = Math.round(amount * 100);
    }

    const refund = await razorpay.payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

export default razorpay;
