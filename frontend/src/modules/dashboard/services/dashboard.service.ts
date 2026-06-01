import { http } from '@/services/http';

export interface Kpis {
  totalLeads: number;
  newLeadsLast30: number;
  wonLeadsLast30: number;
  openConversations: number;
  unreadMessages: number;
  conversionRate: number;
}

export const dashboardService = {
  kpis: async (): Promise<Kpis> => (await http.get('/dashboard/kpis')).data.data,
  bySource: async () => (await http.get('/dashboard/leads-by-source')).data.data as { source: string; count: number }[],
  byStage: async () =>
    (await http.get('/dashboard/leads-by-stage')).data.data as {
      stage: string;
      color: string;
      count: number;
    }[],
};
