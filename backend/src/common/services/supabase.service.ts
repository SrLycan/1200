import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _client?: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('app.supabase.url');
    const key = this.config.get<string>('app.supabase.serviceRoleKey');
    if (url && key) {
      this._client = createClient(url, key, { auth: { persistSession: false } });
      this.logger.log('Supabase client initialized');
    } else {
      this.logger.warn('Supabase not configured (SUPABASE_URL / SERVICE_ROLE_KEY missing)');
    }
  }

  get client(): SupabaseClient {
    if (!this._client) throw new Error('Supabase client not configured');
    return this._client;
  }

  isAvailable() {
    return Boolean(this._client);
  }
}
