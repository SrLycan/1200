import { Body, Controller, Get, HttpCode, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { Public } from '../../../common/decorators/public.decorator';
import { InstagramService } from './instagram.service';
import { WebhookHandlerService } from '../webhook-handler.service';

@ApiExcludeController()
@Controller('integrations/instagram')
export class InstagramWebhookController {
  constructor(
    private readonly instagram: InstagramService,
    private readonly handler: WebhookHandlerService,
  ) {}

  @Public()
  @Get('webhook')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (mode === 'subscribe' && token === this.instagram.verifyToken()) return challenge;
    throw new UnauthorizedException();
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async receive(@Body() body: any) {
    await this.handler.handleInstagram(body);
    return { received: true };
  }
}
