export const PAYMENT_PROVIDER_TOKEN = 'PAYMENT_PROVIDER_TOKEN';

export interface IPaymentProvider {
  createOrder(options: { amount: number; currency: string; receipt: string; notes: any }): Promise<{
    id: string;
    amount: number;
    currency: string;
  }>;

  createPaymentLink(options: {
    amount: number;
    currency: string;
    description: string;
    customer: { name: string; email: string; contact: string };
    notes: any;
  }): Promise<string | null>;

  verifySignature(signature: string, payload: string | Buffer, secret: string): boolean;
  
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean;
}
