import { Controller, Post, Body, Req, Headers, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator.js';
import { RazorpayService } from '../services/razorpay.service.js';
import crypto from 'crypto';

@Controller('api/v1/mock/payment')
export class MockWebhookController {
  constructor(private readonly razorpayService: RazorpayService) {}

  @Public()
  @Post('success')
  async simulateSuccess(@Body() body: any) {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException('Mock endpoints are only available in development mode');
    }

    const { orderId, paymentId } = body;
    if (!orderId) throw new InternalServerErrorException('orderId is required');

    // Create a mock payload matching Razorpay's API format
    const mockPayload = {
      entity: 'event',
      account_id: 'acc_mock123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: paymentId || `pay_mock_${crypto.randomBytes(4).toString('hex')}`,
            entity: 'payment',
            amount: 500000,
            currency: 'INR',
            status: 'captured',
            order_id: orderId,
            invoice_id: null,
            international: false,
            method: 'card',
            amount_refunded: 0,
            refund_status: null,
            captured: true,
            description: 'Mock Payment',
            card_id: 'card_mock',
            bank: null,
            wallet: null,
            vpa: null,
            email: 'mock@example.com',
            contact: '+919999999999',
            notes: [],
            fee: 1000,
            tax: 150,
            error_code: null,
            error_description: null,
            error_source: null,
            error_step: null,
            error_reason: null,
            acquirer_data: { auth_code: '123456' },
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    // We can simulate the webhook call directly to razorpayService
    // In mock mode, the provider doesn't check signature strictly if we use a secret override or we can use the bypass token 'mock_signature_skip'
    
    // We mock the raw body and signature
    const signature = 'mock_signature_skip';
    const rawBody = Buffer.from(JSON.stringify(mockPayload));

    return this.razorpayService.handleWebhook(signature, rawBody, mockPayload);
  }

  @Public()
  @Post('failed')
  async simulateFailed(@Body() body: any) {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException('Mock endpoints are only available in development mode');
    }

    const { orderId } = body;
    if (!orderId) throw new InternalServerErrorException('orderId is required');

    const mockPayload = {
      entity: 'event',
      account_id: 'acc_mock123',
      event: 'payment.failed',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: `pay_mock_${crypto.randomBytes(4).toString('hex')}`,
            entity: 'payment',
            amount: 500000,
            currency: 'INR',
            status: 'failed',
            order_id: orderId,
            method: 'card',
            error_code: 'BAD_REQUEST_ERROR',
            error_description: 'Payment failed due to mock testing',
            created_at: Math.floor(Date.now() / 1000),
          },
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    const signature = 'mock_signature_skip';
    const rawBody = Buffer.from(JSON.stringify(mockPayload));

    return this.razorpayService.handleWebhook(signature, rawBody, mockPayload);
  }

  @Public()
  @Post('refund')
  async simulateRefund(@Body() body: any) {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException('Mock endpoints are only available in development mode');
    }

    // Similar logic for refund.processed
    const { orderId } = body;
    const mockPayload = {
      entity: 'event',
      account_id: 'acc_mock123',
      event: 'refund.processed',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: `pay_mock_${crypto.randomBytes(4).toString('hex')}`,
            order_id: orderId,
          }
        }
      }
    };
    const signature = 'mock_signature_skip';
    const rawBody = Buffer.from(JSON.stringify(mockPayload));

    return this.razorpayService.handleWebhook(signature, rawBody, mockPayload);
  }
}
