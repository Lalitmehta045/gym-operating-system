import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { WhatsappService } from '../services/whatsapp.service.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { Role } from '../../../generated/prisma/client.js';

@Controller('api/v1/whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @SkipThrottle()
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(HttpStatus.OK).send(challenge);
      } else {
        return res.sendStatus(HttpStatus.FORBIDDEN);
      }
    }
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Res() res: Response) {
    // Return OK immediately to acknowledge receipt as per Meta docs
    res.sendStatus(HttpStatus.OK);

    try {
      await this.whatsappService.processWebhook(body);
    } catch (error) {
      // Log error but don't fail the request since we already responded 200 OK
      this.logger.error('Error processing WhatsApp webhook:', error);
    }
  }

}
