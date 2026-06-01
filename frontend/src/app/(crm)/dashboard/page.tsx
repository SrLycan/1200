'use client';

import { Users, MessageSquare, Trophy, Target, Car, Wrench, DollarSign, Clock } from 'lucide-react';
import {
  BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/modules/dashboard/components/kpi-card';
import { useKpis, useLeadsBySource, useLeadsByStage } from '@/modules/dashboard/hooks/use-kpis';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const PIE_COLORS = ['#1e3a6e', '#b8860b', '#1a6355', '#8b3a3a', '#4a5568', '#2b5876', '#744210', '#553c9a'];

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-lg text-sm">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Activity timeline mock — replace with real API call when ready
const ACTIVITY_DATA = [
  { day: 'Lun', leads: 5, citas: 2, ventas: 1 },
  { day: 'Mar', leads: 8, citas: 3, ventas: 0 },
  { day: 'Mié', leads: 4, citas: 4, ventas: 2 },
  { day: 'Jue', leads: 11, citas: 2, ventas: 1 },
  { day: 'Vie', leads: 9, citas: 5, ventas: 3 },
  { day: 'Sáb', leads: 6, citas: 1, ventas: 1 },
  { day: 'Dom', leads: 2, citas: 0, ventas: 0 },
];

export default function DashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useKpis();
  const { data: bySource } = useLeadsBySource();
  const { data: byStage } = useLeadsByStage();
  const user = useAuthStore((s) => s.user);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen comercial · {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Sistema en línea</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Leads totales"
          value={kpisLoading ? '…' : (kpis?.totalLeads ?? 0)}
          icon={Users}
          tone="default"
          trend={{ value: 8, label: 'vs mes anterior' }}
        />
        <KpiCard
          label="Nuevos (30 días)"
          value={kpisLoading ? '…' : (kpis?.newLeadsLast30 ?? 0)}
          icon={Target}
          tone="warning"
          trend={{ value: 12 }}
        />
        <KpiCard
          label="Ventas cerradas"
          value={kpisLoading ? '…' : (kpis?.wonLeadsLast30 ?? 0)}
          icon={Trophy}
          tone="success"
          trend={{ value: 5 }}
        />
        <KpiCard
          label="Conv. abiertas"
          value={kpisLoading ? '…' : (kpis?.openConversations ?? 0)}
          icon={MessageSquare}
          tone="danger"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-l-4 border-l-primary card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10">
              <Car className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Vehículos disponibles</p>
              <p className="font-display text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500 card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-yellow-500/10">
              <Wrench className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Órdenes taller hoy</p>
              <p className="font-display text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 card-hover">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tasa de conversión</p>
              <p className="font-display text-2xl font-bold text-emerald-700">
                {kpis?.conversionRate ?? 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Activity chart - spans 3 cols */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="font-display">Actividad semanal</CardTitle>
            <p className="text-xs text-muted-foreground">Leads, citas y ventas por día</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVITY_DATA}>
                <defs>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(215,75%,28%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(215,75%,28%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Area dataKey="leads" name="Leads" stroke="hsl(215,75%,28%)" fill="url(#gradLeads)" strokeWidth={2} dot={false} />
                <Area dataKey="citas" name="Citas" stroke="#f59e0b" fill="transparent" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                <Area dataKey="ventas" name="Ventas" stroke="#10b981" fill="url(#gradVentas)" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart - spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-display">Origen de leads</CardTitle>
            <p className="text-xs text-muted-foreground">Distribución por canal</p>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bySource ?? []}
                  dataKey="count"
                  nameKey="source"
                  outerRadius={85}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {(bySource ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{v}</span>}
                />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stage bar chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-display">Leads por etapa del pipeline</CardTitle>
          <p className="text-xs text-muted-foreground">Estado actual del embudo comercial</p>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byStage ?? []} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]}>
                {(byStage ?? []).map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color ?? PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}