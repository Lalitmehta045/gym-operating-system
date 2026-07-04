import { Controller, Post, Req, Res, Headers, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../../auth/decorators/public.decorator.js';
import { RazorpayWebhookService } from '../services/razorpay-webhook.service.js';

/**
 * SETUP INSTRUCTIONS:
 * Each gym owner must configure this URL in their own 
 * Razorpay Dashboard -> Settings -> Webhooks:
 * 
 * URL: https://your-backend-url.onrender.com/api/v1/webhooks/razorpay
 * Events to subscribe: payment_link.paid
 * Secret: Must match the Webhook Secret saved in 
 *         Settings -> Integrations -> Razorpay
 */
@Controller('webhooks/razorpay')
export class RazorpayWebhookController {
  private readonly logger = new Logger(RazorpayWebhookController.name);

  constructor(
    private readonly webhookService: RazorpayWebhookService,
  ) {}

  @Public()
  @Post()
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    // Convert buffer if using express.raw middleware, otherwise use NestJS rawBody
    const rawBody = Buffer.isBuffer(req.body) ? req.body : ((req as any).rawBody || JSON.stringify(req.body));
    const parsedBody = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    
    try {
      await this.webhookService.processWebhook(rawBody, signature, parsedBody);
      return res.status(HttpStatus.OK).json({ status: 'ok' });
    } catch (err) {
      // Always return 200 to Razorpay even on processing errors
      // (log internally, don't let Razorpay retry indefinitely for bugs)
      this.logger.error('Razorpay webhook error:', err);
      return res.status(HttpStatus.OK).json({ status: 'error_logged' });
    }
  }
}
