import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { IPaymentProvider } from './payment-provider.interface.js';
import { ExternalServiceCall } from '../../common/utils/circuit-breaker.util.js';

@Injectable()
export class RealRazorpayProvider implements IPaymentProvider {
  private razorpay: Razorpay;
  private readonly logger = new Logger(RealRazorpayProvider.name);

  constructor() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      this.logger.warn('Razorpay credentials not configured. RealRazorpayProvider initialized but will fail on use if keys are missing.');
    }
  }

  async createOrder(options: { amount: number; currency: string; receipt: string; notes: any }): Promise<{ id: string; amount: number; currency: string }> {
    if (!this.razorpay) throw new InternalServerErrorException('Razorpay is not configured on the server');
    
    return this.createRazorpayOrderWithRetry(options);
  }

  async createPaymentLink(options: { amount: number; currency: string; description: string; customer: { name: string; email: string; contact: string }; notes: any }): Promise<string | null> {
    if (!this.razorpay) return null;

    try {
      const paymentLink = await ExternalServiceCall.execute(
        'razorpay-create-payment-link',
        () => this.razorpay.paymentLink.create({
          amount: options.amount,
          currency: options.currency,
          accept_partial: false,
          description: options.description,
          customer: options.customer,
          notify: { sms: false, email: false },
          reminder_enable: false,
          notes: options.notes,
        }),
        () => {
          this.logger.error('Razorpay paymentLink.create degraded response (Fallback)');
          return { short_url: '' } as any;
        },
        { timeout: 6000 }
      );
      return paymentLink.short_url;
    } catch (error) {
      this.logger.error('Failed to create Razorpay payment link', error);
      return null;
    }
  }

  verifySignature(signature: string, payload: string | Buffer, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expectedSignature === signature;
  }

  private async createRazorpayOrderWithRetry(payload: any, attempt = 1): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');

    try {
      const response = await fetch(`https://api.razorpay.com/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error(`Gateway error: ${response.status}`, errorData);
        throw new InternalServerErrorException(`Payment gateway error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      const isNetworkError = error.name === 'AbortError' || error.name === 'TypeError' || error.name === 'FetchError' || error.code === 'ECONNRESET';
      
      if (isNetworkError) {
        if (attempt < 2) {
          this.logger.warn(`Network error during Razorpay order creation. Retrying... (attempt ${attempt + 1})`);
          return this.createRazorpayOrderWithRetry(payload, attempt + 1);
        }
        this.logger.error('Network error failed after retries', error);
        throw new InternalServerErrorException('Failed to communicate with payment gateway due to network error');
      }

      throw error;
    }
  }
}
