import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditListener } from './audit.listener';

@Module({
  providers: [AuditService, AuditListener],
  exports: [AuditService],
})
export class AuditModule {}
