import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsService, type LeadsFilters } from '../services/leads.service';

export const useLeads = (filters: LeadsFilters) =>
  useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadsService.list(filters),
  });

export const useLead = (id: string) =>
  useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsService.get(id),
    enabled: !!id,
  });

export const useMoveStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) =>
      leadsService.moveStage(id, stageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });
};
