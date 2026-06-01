import { http } from '@/services/http';
import type { Lead, LeadSource, LeadStatus, Paginated } from '@/types';

export interface LeadsFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  ownerId?: string;
}

export const leadsService = {
  async list(filters: LeadsFilters = {}): Promise<Paginated<Lead>> {
    const { data } = await http.get('/leads', { params: filters });
    // backend envuelve en { success, data: { data, meta } }
    return data.data;
  },
  async get(id: string): Promise<Lead> {
    const { data } = await http.get(`/leads/${id}`);
    return data.data;
  },
  async create(payload: Partial<Lead>) {
    const { data } = await http.post('/leads', payload);
    return data.data;
  },
  async update(id: string, payload: Partial<Lead>) {
    const { data } = await http.patch(`/leads/${id}`, payload);
    return data.data;
  },
  async moveStage(id: string, stageId: string) {
    const { data } = await http.patch(`/leads/${id}/stage/${stageId}`);
    return data.data;
  },
  async remove(id: string) {
    await http.delete(`/leads/${id}`);
  },
};
