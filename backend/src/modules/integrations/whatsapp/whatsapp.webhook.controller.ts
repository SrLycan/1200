import { Body, Controller, Get, Headers, HttpCode, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import * as crypto from 'crypto';

import { Public } from '../../../common/decorators/public.decorator';
import { WhatsappService } from './whatsapp.service';
import { WebhookHandlerService } from '../webhook-handler.service';
import { ConfigService } from '@nestjs/config';

@ApiExcludeController()
@Controller('integrations/whatsapp')
export class WhatsappWebhookController {
  constructor(
    private readonly whatsapp: WhatsappService,
    private readonly handler: WebhookHandlerService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('webhook')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (mode === 'subscribe' && token === this.whatsapp.verifyToken()) {
      return challenge;
    }
    throw new UnauthorizedException();
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async receive(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: Request,
  ) {
    this.verifySignature((req as any).rawBody ?? JSON.stringify(body), signature);
    await this.handler.handleWhatsapp(body);
    return { received: true };
  }

  private verifySignature(rawBody: string | Buffer, signature?: string) {
    const secret = this.config.get<string>('app.whatsapp.webhookSecret');
    if (!secret) return; // dev mode
    if (!signature) throw new UnauthorizedException('Missing signature');
    const expected =
      'sha256=' +
      crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      throw new UnauthorizedException('Invalid signature');
    }
  }
}
