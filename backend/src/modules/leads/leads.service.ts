import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadStatus, Prisma } from '@prisma/client';

import { LeadsRepository } from './leads.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { buildPagination } from '../../common/dto/pagination.dto';
import { LeadAssignmentService } from './services/lead-assignment.service';
import { LeadScoringService } from './services/lead-scoring.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly repo: LeadsRepository,
    private readonly events: EventEmitter2,
    private readonly assignment: LeadAssignmentService,
    private readonly scoring: LeadScoringService,
  ) {}

  async create(dto: CreateLeadDto, createdById?: string) {
    const score = this.scoring.compute(dto);
    const ownerId = dto.ownerId ?? (await this.assignment.pickOwner());

    const lead = await this.repo.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      source: dto.source,
      priority: dto.priority,
      city: dto.city,
      notes: dto.notes,
      tags: dto.tags ?? [],
      utm: dto.utm,
      score,
      status: LeadStatus.NEW,
      ...(createdById && { createdBy: { connect: { id: createdById } } }),
      ...(ownerId && { owner: { connect: { id: ownerId } } }),
    });

    this.events.emit('lead.created', lead);
    return lead;
  }

  async findAll(filter: FilterLeadsDto) {
    const { page, pageSize, search, status, source, ownerId, sortBy, sortDir } = filter;

    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(source && { source }),
      ...(ownerId && { ownerId }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.LeadOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortDir ?? 'desc' }
      : { createdAt: 'desc' };

    const [data, total] = await this.repo.paginate(where, page, pageSize, orderBy);
    return buildPagination(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const lead = await this.repo.findById(id);
    if (!lead || lead.deletedAt) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.findOne(id);
    const updated = await this.repo.update(id, dto as Prisma.LeadUpdateInput);
    this.events.emit('lead.updated', updated);
    return updated;
  }

  async moveStage(id: string, stageId: string) {
    const lead = await this.findOne(id);
    const updated = await this.repo.update(id, { pipelineStage: { connect: { id: stageId } } });
    this.events.emit('lead.stage_changed', { lead, fromStageId: lead.pipelineStageId, toStageId: stageId });
    return updated;
  }

  async assign(id: string, ownerId: string) {
    await this.findOne(id);
    const updated = await this.repo.update(id, { owner: { connect: { id: ownerId } } });
    this.events.emit('lead.assigned', updated);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.softDelete(id);
    this.events.emit('lead.deleted', { id });
    return { success: true };
  }
}
