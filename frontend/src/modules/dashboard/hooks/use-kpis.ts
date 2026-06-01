import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const useKpis = () =>
  useQuery({ queryKey: ['dashboard', 'kpis'], queryFn: dashboardService.kpis });

export const useLeadsBySource = () =>
  useQuery({ queryKey: ['dashboard', 'leads-by-source'], queryFn: dashboardService.bySource });

export const useLeadsByStage = () =>
  useQuery({ queryKey: ['dashboard', 'leads-by-stage'], queryFn: dashboardService.byStage });
