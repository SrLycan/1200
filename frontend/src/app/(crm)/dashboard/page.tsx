'use client';

import { Users, MessageSquare, Trophy, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/modules/dashboard/components/kpi-card';
import { useKpis, useLeadsBySource, useLeadsByStage } from '@/modules/dashboard/hooks/use-kpis';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#f97316', '#10b981', '#ef4444', '#6b7280'];

export default function DashboardPage() {
  const { data: kpis } = useKpis();
  const { data: bySource } = useLeadsBySource();
  const { data: byStage } = useLeadsByStage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen comercial en tiempo real</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Leads totales" value={kpis?.totalLeads ?? '-'} icon={Users} />
        <KpiCard label="Nuevos (30d)" value={kpis?.newLeadsLast30 ?? '-'} icon={Target} tone="warning" />
        <KpiCard label="Ventas cerradas" value={kpis?.wonLeadsLast30 ?? '-'} icon={Trophy} tone="success" />
        <KpiCard label="Conv. abiertas" value={kpis?.openConversations ?? '-'} icon={MessageSquare} tone="danger" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads por etapa</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStage ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(byStage ?? []).map((entry, i) => (
                    <Cell key={i} fill={entry.color ?? PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Origen de los leads</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bySource ?? []} dataKey="count" nameKey="source" outerRadius={90} label>
                  {(bySource ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasa de conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">{kpis?.conversionRate ?? 0}%</p>
          <p className="text-sm text-muted-foreground">Leads ganados / total acumulado</p>
        </CardContent>
      </Card>
    </div>
  );
}
