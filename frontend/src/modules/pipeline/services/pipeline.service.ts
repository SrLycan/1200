import { http } from '@/services/http';
import type { Lead, PipelineStage } from '@/types';

export type KanbanColumn = PipelineStage & { leads: Lead[] };

export const pipelineService = {
  async kanban(): Promise<KanbanColumn[]> {
    const { data } = await http.get('/pipelines/kanban');
    return data.data;
  },
};
