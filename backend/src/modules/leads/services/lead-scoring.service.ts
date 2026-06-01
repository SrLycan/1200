import { Injectable } from '@nestjs/common';
import { LeadSource } from '@prisma/client';
import { CreateLeadDto } from '../dto/create-lead.dto';

/**
 * Lead scoring inicial determinístico (0-100).
 * Reemplazable por modelo ML en Fase 3.
 */
@Injectable()
export class LeadScoringService {
  compute(lead: CreateLeadDto): number {
    let score = 30;

    const sourceWeights: Record<LeadSource, number> = {
      WHATSAPP: 25,
      INSTAGRAM: 20,
      WEB: 15,
      REFERRAL: 30,
      WALK_IN: 35,
      PHONE: 20,
      FACEBOOK: 15,
      OTHER: 5,
    };
    score += sourceWeights[lead.source] ?? 0;

    if (lead.email) score += 10;
    if (lead.phone) score += 15;
    if (lead.notes && lead.notes.length > 30) score += 5;

    return Math.min(100, Math.max(0, score));
  }
}
