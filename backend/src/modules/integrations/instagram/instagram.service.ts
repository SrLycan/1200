import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class InstagramService {
  private readonly http: AxiosInstance;
  private readonly pageId?: string;

  constructor(private readonly config: ConfigService) {
    const token = config.get<string>('app.instagram.token');
    this.pageId = config.get<string>('app.instagram.pageId');
    this.http = axios.create({
      baseURL: 'https://graph.facebook.com/v20.0',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 10_000,
    });
  }

  async sendText(igUserId: string, text: string): Promise<string> {
    if (!this.pageId) throw new Error('INSTAGRAM_PAGE_ID not configured');
    const { data } = await this.http.post(`/${this.pageId}/messages`, {
      recipient: { id: igUserId },
      message: { text },
      messaging_type: 'RESPONSE',
    });
    return data?.message_id ?? '';
  }

  verifyToken(): string | undefined {
    return this.config.get<string>('app.instagram.verifyToken');
  }
}
