import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly http: AxiosInstance;
  private readonly phoneId?: string;

  constructor(private readonly config: ConfigService) {
    const token = config.get<string>('app.whatsapp.token');
    this.phoneId = config.get<string>('app.whatsapp.phoneId');
    this.http = axios.create({
      baseURL: 'https://graph.facebook.com/v20.0',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 10_000,
    });
  }

  async sendText(to: string, body: string): Promise<string> {
    if (!this.phoneId) throw new Error('WHATSAPP_PHONE_ID not configured');
    const { data } = await this.http.post(`/${this.phoneId}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    });
    return data?.messages?.[0]?.id ?? '';
  }

  verifyToken(): string | undefined {
    return this.config.get<string>('app.whatsapp.verifyToken');
  }
}
