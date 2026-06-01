import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LeadsRepository } from './leads.repository';
import { LeadAssignmentService } from './services/lead-assignment.service';
import { LeadScoringService } from './services/lead-scoring.service';
import { LeadEventListener } from './listeners/lead.listener';

@Module({
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadsRepository,
    LeadAssignmentService,
    LeadScoringService,
    LeadEventListener,
  ],
  exports: [LeadsService, LeadsRepository, LeadAssignmentService],
})
export class LeadsModule {}
