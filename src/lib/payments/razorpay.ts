import Razorpay from 'razorpay';
import crypto from 'crypto';

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!client) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return client;
}

/**
 * Razorpay expects amounts in the smallest currency unit (paise for INR).
 */
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Verifies the HMAC-SHA256 signature Razorpay returns after a successful
 * checkout, per Razorpay's documented verification scheme:
 *   signature = hmac_sha256(order_id + "|" + payment_id, key_secret)
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured.');
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature));
}
