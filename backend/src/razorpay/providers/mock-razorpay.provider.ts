import { Injectable, Logger } from '@nestjs/common';
import crypto from 'crypto';
import { IPaymentProvider } from './payment-provider.interface.js';

@Injectable()
export class MockRazorpayProvider implements IPaymentProvider {
  private readonly logger = new Logger(MockRazorpayProvider.name);

  async createOrder(options: { amount: number; currency: string; receipt: string; notes: any }): Promise<{ id: string; amount: number; currency: string }> {
    this.logger.log(`[MOCK] Creating order for receipt ${options.receipt}`);
    return {
      id: `order_mock_${crypto.randomBytes(6).toString('hex')}`,
      amount: options.amount,
      currency: options.currency,
    };
  }

  async createPaymentLink(options: { amount: number; currency: string; description: string; customer: { name: string; email: string; contact: string }; notes: any }): Promise<string | null> {
    this.logger.log(`[MOCK] Creating payment link for ${options.customer.email}`);
    // Generate a mock payment link
    const mockPaymentId = crypto.randomBytes(4).toString('hex');
    return `https://mock.razorpay.local/pay/plink_${mockPaymentId}`;
  }

  verifySignature(signature: string, payload: string | Buffer, secret: string): boolean {
    this.logger.log(`[MOCK] Verifying webhook signature`);
    // For mock development, we'll verify it using the same HMAC mechanism, so the mock frontend/API must generate it correctly.
    // However, if signature is "mock_signature_skip", we can bypass it for ease of testing.
    if (signature === 'mock_signature_skip') return true;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
    this.logger.log(`[MOCK] Verifying payment signature for order ${orderId}`);
    if (signature === 'mock_signature_skip') return true;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expectedSignature === signature;
  }
}
