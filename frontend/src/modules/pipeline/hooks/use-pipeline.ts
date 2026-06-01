import { useQuery } from '@tanstack/react-query';
import { pipelineService } from '../services/pipeline.service';

export const usePipeline = () =>
  useQuery({
    queryKey: ['pipeline', 'kanban'],
    queryFn: pipelineService.kanban,
    refetchInterval: 30_000,
  });
