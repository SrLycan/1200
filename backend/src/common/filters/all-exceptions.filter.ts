import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as any)
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    if (status >= 500) {
      this.logger.error(`[${req.method}] ${req.url} -> ${status}`, (exception as Error)?.stack);
    } else {
      this.logger.warn(`[${req.method}] ${req.url} -> ${status}: ${JSON.stringify(message)}`);
    }

    res.status(status).json({
      success: false,
      statusCode: status,
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      error: typeof message === 'string' ? { message } : message,
    });
  }
}
