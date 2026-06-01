import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload) => {
        // Si el servicio ya devuelve { data, meta } lo respetamos.
        if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
          const { data, meta } = payload as unknown as { data: T; meta?: Record<string, unknown> };
          return { success: true, data, meta, timestamp: new Date().toISOString() };
        }
        return { success: true, data: payload, timestamp: new Date().toISOString() };
      }),
    );
  }
}
